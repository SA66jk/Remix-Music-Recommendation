import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
//MetaFunction 用于设置 <title> 和 <meta> 信息
//LoaderFunction, json Remix 服务器端 loader（用于获取数据）

import { useParams, useSearchParams, Link, useLoaderData } from "@remix-run/react";
//useParams() 获取 URL 参数（如 /emotion/happy）
//useSearchParams() 解析 URL 查询参数（intensity

import { authenticator } from "~/services/auth.server"; //导入authenticator，是使用 Remix Auth 进行身份验证的一个 Authenticator 实例
import { useState, useEffect } from "react"; //导入 useState & useEffect（管理状态）
import { Button } from "~/components/ui/button"; //导入按钮组件
import { Slider } from "~/components/ui/slider"; //导入滑块组件
import { Loader2, ArrowLeft, Music2, Home } from "lucide-react"; //导入四个图标
import { toast } from "sonner"; //导入 toast 组件，提示消息

//TypeScript 接口，定义 Spotify 音乐推荐对象的类型结构
interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  uri: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, { //验证用户是否已经登录
    failureRedirect: "/?error=Please login first", //未登录跳转到 /?error=Please login first
  });

  const url = new URL(request.url); //解析url
  const mood = url.pathname.split("/").pop(); // 从路径中获取 mood
  const moodIntensity = url.searchParams.get("moodIntensity");
  const state = url.searchParams.get("state") || "light";
  const speed = url.searchParams.get("speed") || "fast";
  const stateIntensity = url.searchParams.get("stateIntensity");
  const speedIntensity = url.searchParams.get("speedIntensity");
  // 调试信息
  console.log("Debug Info - emotion.$mood.tsx loader:");
  console.log(`- Mood Intensity: ${moodIntensity}`);
  console.log(`- State: ${state}`);
  console.log(`- Speed: ${speed}`);
  console.log(`- State Intensity: ${stateIntensity}`);
  console.log(`- Speed Intensity: ${speedIntensity}`);
  return json({
    moodIntensity: moodIntensity ? parseInt(moodIntensity) : 50,
    state,
    speed,
    stateIntensity: stateIntensity ? parseInt(stateIntensity) : 50,
    speedIntensity: speedIntensity ? parseInt(speedIntensity) : 50,
  });
  //如果 moodIntensity 存在（不为 null），则 parseInt(moodIntensity) 转换为 number 类型，moodIntensity 不存在，默认返回 50
};

//动态设置<title> 和 <meta>
export const meta: MetaFunction<typeof loader> = ({ params }) => {
  const mood = params.mood;
  return [
    { title: `${mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : ''} Music - Spotify Music App` },
    { name: "description", content: `Get music recommendations based on your ${mood} mood` }
  ]; //生成不同情绪的标题和描述
};

//导出EmotionMood组件
export default function EmotionMood() {
  const { mood } = useParams(); //获取mood参数
  const loaderData = useLoaderData<typeof loader>(); //获取loader传递的数据
  const [searchParams] = useSearchParams(); //监听URL查询参数
  
  // 使用 loader 数据作为初始值
  const [moodIntensity, setMoodIntensity] = useState(loaderData.moodIntensity);
  const [stateIntensity, setStateIntensity] = useState(loaderData.stateIntensity);
  const [speedIntensity, setSpeedIntensity] = useState(loaderData.speedIntensity);
  //读取数据，使用useState存入组件

  const [isLoading, setIsLoading] = useState(false); //组件初始加载状态
  const [tracks, setTracks] = useState<Track[]>([]); //推荐列表状态
  const [previousTracks, setPreviousTracks] = useState<Track[]>([]); //历史推荐状态
  const [showResults, setShowResults] = useState(false); //推荐结果展示状态

  // 监听 URL 参数变化
  useEffect(() => {
    const urlMoodIntensity = parseInt(searchParams.get("moodIntensity") || "50");
    const urlStateIntensity = parseInt(searchParams.get("stateIntensity") || "50");
    const urlSpeedIntensity = parseInt(searchParams.get("speedIntensity") || "50");
    
    setMoodIntensity(urlMoodIntensity);
    setStateIntensity(urlStateIntensity);
    setSpeedIntensity(urlSpeedIntensity);
  }, [searchParams]);

  // 在组件挂载时自动执行搜索
  useEffect(() => {
    // 使用一个小延迟确保组件完全渲染
    const timer = setTimeout(() => {
      if (mood) {  // 确保有心情值，避免空值错误
        handleGetRecommendations(); //触发 API 请求，获取推荐音乐列表
      }
    }, 100);

    //确保组件卸载时清除定时器，避免内存泄漏
    return () => clearTimeout(timer);
  }, [mood]); // 当 mood 改变时重新执行

  const handleGetRecommendations = async () => { //定义一个异步函数，用于向服务器请求音乐推荐数据
    if (!moodIntensity) { //检查moodIntensity（情绪强度）是否为空
      toast.error("Please select mood intensity"); //如果为空：显示错误消息 "Please select mood intensity"
      return; //终止函数执行（return 退出函数）
    }

    setIsLoading(true); //加载数据
    try {
      const formData = new FormData();
      formData.append("mood", mood || "");
      //添加 mood 参数（用户选择的情绪，如 "happy"）
      //mood || "" 确保如果 mood 为空，传递空字符串（防止 API 报错）
      formData.append("moodIntensity", moodIntensity.toString());
      //添加 moodIntensity 参数，表示用户选择的情绪强度
      //moodIntensity.toString() 确保数据类型为 字符串，符合 FormData 要求
      formData.append("numTracks", "12"); //指定 API 需要返回 12 首推荐歌曲
      formData.append("state", loaderData.state); // 传递 state
      formData.append("speed", loaderData.speed); // 传递 speed
      formData.append("stateIntensity", stateIntensity.toString()); // 传递 stateIntensity
      formData.append("speedIntensity", speedIntensity.toString()); // 传递 speedIntensity
      formData.append("previousTracks", JSON.stringify( //使用 JSON.stringify(...) 将数据转换为 JSON 格式，便于服务器解析
          [...previousTracks, ...tracks].map(track => ({ //合并 previousTracks 和 tracks，避免重复推荐相同的歌曲
            name: track.name,
            artists: track.artists.map(a => a.name) //格式化 previousTracks，确保只包含 name 和 artists 信息
          }))
      ));

      const response = await fetch("/api/recommendations", { //发送 HTTP 请求 到 /api/recommendations 端点
        method: "POST",
        body: formData,
      });
      //发送包含用户选择的情绪 (mood) 和强度 (moodIntensity) 的 POST 请求，向服务器请求音乐推荐
      const data = await response.json(); //解析服务器返回的 JSON 数据，并存入 data 变量

      if (!response.ok) { //检查 HTTP 响应状态是否成功，如果 response.ok === false，表示请求失败，执行错误处理逻辑
        let errorMessage = "Failed to get recommendations";
        //初始化 errorMessage，默认错误信息 "Failed to get recommendations"

        // 根据不同的错误状态显示不同的错误信息
        if (response.status === 429) { //请求过多
          errorMessage = "Rate limit exceeded. Please try again later.";
        } else if (response.status === 401) { //API认证失败
          errorMessage = "Invalid API key. Please check your configuration.";
        } else if (response.status === 402) { //API账户余额不足
          errorMessage = "Insufficient credits. Please check your OpenAI account.";
        } else if (data.error) {
          errorMessage = data.error;
        }

        toast.error(errorMessage);
        throw new Error(errorMessage); //调用 toast.error(errorMessage)，在 UI 中显示错误通知
      }

      setPreviousTracks(prev => [...prev, ...tracks]); //将当前推荐的 tracks 加入 previousTracks 记录历史数据
      setTracks(data.tracks); //data.tracks 来自 API 响应，包含新的推荐歌曲列表    更新 tracks 状态，供 UI 渲染推荐列表
      setShowResults(true); //将 showResults 设为 true，控制 UI 显示推荐列表
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      // 捕获 API 请求中的错误，在控制台打印错误信息
    } finally {
      setIsLoading(false); //无论请求成功还是失败，最终都设置 isLoading = false
      //防止按钮保持加载状态，确保 UI 恢复可交互状态
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-500">
        {/* Navigation */}
        <nav className="bg-black/20 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
            </div>
            <Link to="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <Home className="h-5 w-5 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-8">
              <h1 className="text-3xl font-bold mb-4 capitalize text-white">
                {mood} Music Recommendations
              </h1>

              {/* Mood Intensity Slider */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white">
                  Emotional（{mood}） Intensity: {moodIntensity}%
                </label>
                <Slider
                    value={[moodIntensity]}
                    onValueChange={(values) => setMoodIntensity(values[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full max-w-md"
                    trackClassName="bg-white/10 h-2"
                    activeTrackClassName="bg-[#1DB954]"
                    thumbClassName="h-4 w-4 border-2 border-[#1DB954] bg-white"
                />
                <div className="flex justify-between text-xs text-white/60 w-full max-w-md">
                  <span>Gentle</span>
                  <span>Intense</span>
                </div>
              </div>

              <hr className="my-6 border-white/10 max-w-md" />

              {/* State Intensity Slider */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white">
                  Style({loaderData.state.charAt(0).toUpperCase() + loaderData.state.slice(1)}) Intensity: {stateIntensity}%
                </label>
                <Slider
                    value={[stateIntensity]}
                    onValueChange={(values) => setStateIntensity(values[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full max-w-md"
                    trackClassName="bg-white/10 h-2"
                    activeTrackClassName="bg-[#1DB954]"
                    thumbClassName="h-4 w-4 border-2 border-[#1DB954] bg-white"
                />
                <div className="flex justify-between text-xs text-white/60 w-full max-w-md">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <hr className="my-6 border-white/10 max-w-md" />

              {/* Speed Intensity Slider */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white">
                  Rhythm({loaderData.speed.charAt(0).toUpperCase() + loaderData.speed.slice(1)}) Intensity: {speedIntensity}%
                </label>
                <Slider
                    value={[speedIntensity]}
                    onValueChange={(values) => setSpeedIntensity(values[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full max-w-md"
                    trackClassName="bg-white/10 h-2"
                    activeTrackClassName="bg-[#1DB954]"
                    thumbClassName="h-4 w-4 border-2 border-[#1DB954] bg-white"
                />
                <div className="flex justify-between text-xs text-white/60 w-full max-w-md">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <Button
                  onClick={handleGetRecommendations}
                  disabled={isLoading}
                  className="w-full max-w-md bg-[#1DB954] hover:bg-[#1ed760] text-white mt-6"
              >
                {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Recommendations...
                    </>
                ) : tracks.length > 0 ? (
                    "Not satisfied? Try again"
                ) : (
                    "Get Recommendations"
                )}
              </Button>
            </div>

            {/* Track List */}
            {showResults ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tracks.map((track) => (
                      <Link
                          to={`/play/${track.id}?mood=${mood}&intensity=${moodIntensity}&state=${loaderData.state}&speed=${loaderData.speed}&stateIntensity=${stateIntensity}&speedIntensity=${speedIntensity}`}
                          key={track.id}
                          className="block"
                      >
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 hover:bg-white/20 transition-all h-full">
                          <div className="aspect-square mb-4">
                            <img
                                src={track.album.images[0]?.url}
                                alt={track.album.name}
                                className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <h3 className="font-semibold text-lg mb-1 truncate text-white">
                            {track.name}
                          </h3>
                          <p className="text-sm text-white/60 truncate">
                            {track.artists.map((a) => a.name).join(", ")}
                          </p>
                        </div>
                      </Link>
                  ))}
                </div>
            ) : (
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-center">
                  <Music2 className="h-16 w-16 mx-auto mb-4 text-white/60" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No recommendations yet
                  </h3>
                  <p className="text-white/60 mb-4">
                    Adjust the intensity slider and click "Get Recommendations" to discover music that matches your mood
                  </p>
                  <div className="animate-bounce text-white/40">
                    ↑
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}

//滑块部分 value={[moodIntensity]} 绑定 moodIntensity 状态
//onValueChange={(values) => setMoodIntensity(values[0])} 滑动时更新 moodIntensity
//min={0} max={100} step={1} 范围 0-100，步长 1
//Link 链接 点击按钮跳转/emotion/${selectedMood}?moodIntensity=${moodIntensity}页面
// selectedMood 非空时才显示内容

//按钮部分 点击按钮触发 handleGetRecommendations，获取推荐音乐
//disabled={isLoading} → 当请求处理中，禁用按钮，防止用户重复点击
//isLoading = true 显示🔄 Getting Recommendations...
//tracks.length > 0 显示Not satisfied? Try again
//默认初始状态 显示Get Recommendations

//渲染推荐列表  showResults 为 true 渲染推荐歌曲列表，为 false 显示 "No recommendations yet" 提示
//遍历 tracks 数组，每个 track 生成一个 Link to={/play/${track.id}?mood=${mood}&moodIntensity=${moodIntensity}}
//点击歌曲后跳转到 /play/{track.id} 播放页面