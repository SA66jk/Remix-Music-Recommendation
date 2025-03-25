import { ActionFunction, json, redirect } from "@remix-run/node";//Remix API，用于创建 服务器端的 Action 处理函数
import { authenticator } from "~/services/auth.server";//用户认证工具（检查是否登录，管理会话）
import { Configuration, OpenAIApi } from "openai";//OpenAI API（用于生成歌曲推荐）
import { handleSpotifyError } from "~/utils/auth.server";//处理 Spotify API 相关的错误（可能用于用户认证问题）

interface Track {
  track: string;
  artist: string;
}
//定义歌曲对象（包括 track 歌曲名 和 artist 歌手）


interface OpenAIResponse {
  tracks: Track[];
}
//OpenAI 返回的 JSON 格式（包含 tracks 歌曲列表）


interface PreviousTrack {
  name: string;
  artists: string[];
}
//用于储存用户之前推荐过的歌曲（防止重复推荐）


export const action: ActionFunction = async ({ request }) => { //ActionFunction 是 Remix 服务器端处理表单提交的函数 前端的表单提交数据会发送到这里处理
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
//检查用户是否已登录 未登录，则重定向到 / 已登录则返回 user 对象（包含 accessToken）



  const formData = await request.formData(); //获取用户选择的 情绪类型（例如 "happy", "sad"）
  const mood = formData.get("mood") as string; //获取用户选择的情绪
  const moodIntensity = Number(formData.get("moodIntensity")) || 100; //获取情绪强度，0-100，默认值100
  const numTracks = Number(formData.get("numTracks")) || 12; //获取 用户希望推荐的歌曲数量（默认 12）
  const previousTracksJson = formData.get("previousTracks") as string;
  const previousTracks: PreviousTrack[] = previousTracksJson ? JSON.parse(previousTracksJson) : []; //解析用户之前推荐的歌曲，防止重复推荐

  // 新增参数获取
  const state = formData.get("state") as string || "light";
  const speed = formData.get("speed") as string || "fast";
  const stateIntensity = Number(formData.get("stateIntensity")) || 50;
  const speedIntensity = Number(formData.get("speedIntensity")) || 50;

  try {
    // 初始化 OpenAI
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    if (!process.env.OPENAI_API_KEY) {
      return json(
        { error: "OpenAI API key is not configured. Please check your environment variables." },
        { status: 401 }
      );
    }
    // 调试
    console.log("Debug Info - Recommendations Route:");
    console.log(`- Mood: ${mood}`);
    console.log(`- Mood Intensity: ${moodIntensity}`);
    console.log(`- Number of Tracks: ${numTracks}`);
    console.log(`- Previous Tracks: ${previousTracks}`);
    console.log(`- State: ${state}`);
    console.log(`- State Intensity: ${stateIntensity}`);
    console.log(`- Speed: ${speed}`);
    console.log(`- Speed Intensity: ${speedIntensity}`);

    //创建openAI API配置 使用 .env.OPENAI_API_KEY 作为 API Key  如果没有配置返回错误
    try {
      // 获取 AI 推荐
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo", //使用 OpenAI 生成歌曲推荐
        messages: [
          {
            role: "system", //设定 AI 角色（音乐推荐助手）
            content: "You are an AI music assistant with extensive knowledge of global pop music available on Spotify. You specialize in recommending songs based on the user's mood and emotional intensity. Ensure that each recommendation list is unique and does not repeat the previous list."
          },
          {
            role: "system", //要求 AI 始终以 JSON 数组格式回复，数组名称为 tracks，其中包含 track（歌曲名）和 artist（艺人名）字段
            content: "Always reply with a JSON array named 'tracks' containing objects with 'track' for the song name and 'artist' for the artist name. Use strategies such as random selection, shuffling, or introducing new songs to ensure diversity. Include songs from various languages and regions to provide a global music experience."
          },
          {
            role: "user", //用户请求推荐歌曲
            content: `Please recommend ${numTracks} tracks that match the following criteria:
            - Mood: ${mood}, Intensity: ${moodIntensity}%
            - Style: ${state}, Intensity: ${stateIntensity}%
            - Rhythm: ${speed}, Intensity: ${speedIntensity}%
            ${previousTracks.length > 0
              ? `Please DO NOT include these previously recommended songs: ${JSON.stringify(previousTracks, null, 2)}`
              : ''}
            Ensure these songs are available on Spotify and that the list is completely different from the previous recommendations.
            For ${state} style with ${stateIntensity}% intensity, prefer ${state === 'light' ? 'brighter and more uplifting' : 'darker and more atmospheric'} songs.
            For ${speed} rhythm with ${speedIntensity}% intensity, prefer ${speed === 'fast' ? 'higher tempo and more energetic' : 'slower tempo and more relaxed'} songs.`
          }
        ],
      });


      const aiResponse = completion.data.choices[0].message?.content;
      console.log("AI Response: " + aiResponse);
      const recommendations: OpenAIResponse = JSON.parse(aiResponse || "{}");
      //解析AI生成的JSON歌曲列表


      // 搜索 Spotify 歌曲
      const spotifyTracks = await Promise.all(
        recommendations.tracks.map(async (track) => { //遍历 OpenAI 推荐的所有歌曲 (recommendations.tracks)，对每首歌执行异步搜索请求
          const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=track:${encodeURIComponent(track.track)}%20artist:${encodeURIComponent(track.artist)}&type=track&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${user.accessToken}`, //使用 Bearer 令牌 (user.accessToken) 进行身份验证
              },
            }
          );
         //使用 fetch() 调用 Spotify API 搜索歌曲
         //track:${encodeURIComponent(track.track)} 歌曲名
         //artist:${encodeURIComponent(track.artist)} 歌手名
         //&type=track&limit=1 只搜索 track 类型，限制返回 1 首歌曲

          // 处理 Spotify 授权错误
          if (searchResponse.status === 401) {
            const error = "Session expired. Please login again.";
            console.log("Spotify auth error:", error);
          //检查 Spotify API 是否返回 401（授权失败）如果 401，表示 accessToken 可能已过期，需要重新登录


            // 直接重定向到首页
            await authenticator.logout(request, { //登出当前用户，清除 accessToken
              redirectTo: `/?error=${encodeURIComponent(error)}`
            }) //重定向到首页 提示用户重新登录
          }
          const searchData = await searchResponse.json(); //解析 Spotify API 返回的 JSON 数据
          return searchData.tracks.items[0] || null; //返回第一首搜索到的歌曲 (items[0])，如果找不到，则返回 null
        })
      );

      // 过滤掉未找到的歌曲
      const validTracks = spotifyTracks.filter(track => track !== null);
      return json({ tracks: validTracks });
      //使用 .filter(track => track !== null) 过滤掉 null，只保留有效歌曲


    } catch (error: any) {
      // 处理认证错误
      if (error?.type === 'auth_error') { //检查 error 类型是否是 auth_error，表示身份认证失败
        return await authenticator.logout(request, { //登出用户，清除 accessToken
          redirectTo: `/?error=${encodeURIComponent(error.message)}` //重定向到首页 ("/")，并显示错误消息
        });
      }




      // OpenAI API 特定错误处理
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 401:
            return json(
              { error: "Invalid OpenAI API key. Please check your configuration." },
              { status: 401 }
            ); //无效 API Key
          case 429:
            return json(
              { error: "Rate limit exceeded. Please try again later or upgrade your OpenAI plan." },
              { status: 429 }
            ); //超出请求速率限制
          case 402:
            return json(
              { error: "Insufficient credits. Please check your OpenAI account balance." },
              { status: 402 }
            ); //账户余额不足
          case 500:
            return json(
              { error: "OpenAI server error. Please try again later." },
              { status: 500 }
            ); //OpenAI 服务器错误
          case 503:
            return json(
              { error: "OpenAI service is temporarily unavailable. Please try again later." },
              { status: 503 }
            ); //OpenAI API 维护中
          default:
            if (data?.error?.message) {
              return json(
                { error: `OpenAI API error: ${data.error.message}` },
                { status }
              );
            } //未知错误 返回具体错误信息
        }
      }

      // 网络错误
      if (error.code === 'ECONNREFUSED') {
        return json(
          { error: "Could not connect to OpenAI servers. Please check your internet connection." },
          { status: 500 }
        );
      }

      // 解析错误
      if (error.message.includes('JSON')) {
        return json(
          { error: "Invalid response format from OpenAI. Please try again." },
          { status: 500 }
        );
      }

      // 其他未知错误
      console.error("Unexpected error:", error);
      return json(
        { error: "An unexpected error occurred. Please try again later." },
        { status: 500 }
      );
    }

  } catch (error) {
    // 如果是 Response 类型的错误（重定向），直接抛出交给 Remix 处理
    if (error instanceof Response) {
      throw error;
    }


    // 其他错误继续处理
    console.error("Error in recommendations route:", error);
    return json(
      { error: "Failed to process your request. Please try again later." },
      { status: 500 }
    );
  }
};
