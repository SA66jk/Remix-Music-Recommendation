import { LoaderFunction, json, MetaFunction } from "@remix-run/node";
//导入一些 Remix 框架的函数，用于数据加载 (LoaderFunction)、页面 meta 信息 (MetaFunction)，以及服务器端的 JSON 响应 (json)
import { useLoaderData, Link, useOutletContext, useNavigate } from "@remix-run/react";
//使用 Remix 提供的 React Hooks，比如 useLoaderData 来获取后端数据，useOutletContext 访问父组件的上下文，useNavigate 用于页面跳转
import { authenticator } from "~/services/auth.server"; //引入身份验证功能 (authenticator)，用于管理用户登录状态
import { useEffect, useState } from "react"; //允许组件在函数式组件中使用 状态（state） 和副作用（side effects）
import { Button } from "~/components/ui/button"; //导入button组件
import { Input } from "~/components/ui/input"; //导入输入组件
import { ScrollArea } from "~/components/ui/scroll-area";  //导入滚动区域组件
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"; //导入对话框组件
import {
  Play,
  Pause,
  Loader2,
  Plus,
  Home,
  ArrowLeft,
  Search,
  Music2,
  Check,
  AlertCircle 
} from "lucide-react"; //导入图标
import { toast } from "sonner"; //toast 进行消息提示，提供用户通知反馈
import type { AppContext } from "~/root"; //导入AppContext组件
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"; //导入悬停信息组件

//音乐信息接口
interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string; //专辑名称
    images: Array<{ url: string }>; //专辑封面
  };
  preview_url: string; //歌曲试听url
  uri: string; //spotify url
}

//播放列表接口
interface Playlist {
  id: string; //播放列表ID
  name: string; //播放列表名称
  images: Array<{ url: string }>; //播放列表封面图片
  tracks: {
    total: number; //播放列表歌曲数量
  };
  hasTrack: boolean; //是否已经包含某首特定的歌
}


//数据加载结构接口
interface LoaderData {
  track: SpotifyApi.TrackObjectFull; //Spotify 提供的 完整歌曲信息
  mood?: string; //歌曲的情绪标签（"快乐"或"悲伤"）
  intensity?: number; //歌曲的情绪强度
  accessToken: string; //Spotify API 的访问令牌
  initialState?: string; // Style
  initialSpeed?: string; // Rhythm
  stateIntensity?: number; // Style Intensity
  speedIntensity?: number; // Rhythm Intensity
}


export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await authenticator.isAuthenticated(request, { //检查用户是否已登录
    failureRedirect: "/login", //未登录会自动重定向到 /login  已登录，返回 user 对象
  });

  const url = new URL(request.url); //把请求的 URL 转换成可操作的对象
  const mood = url.searchParams.get("mood"); //获取 URL 查询参数 mood
  const intensity = url.searchParams.get("intensity");
  const state = url.searchParams.get("state");
  const speed = url.searchParams.get("speed");
  const stateIntensity = url.searchParams.get("stateIntensity");
  const speedIntensity = url.searchParams.get("speedIntensity");

  const response = await fetch( //向 Spotify API 发送请求，获取某首歌的详细信息
    `https://api.spotify.com/v1/tracks/${params.trackId}`,
    {
      headers: {
        Authorization: `Bearer ${user.accessToken}`, //使用用户的 accessToken 进行 API 认证，确保用户有权限访问数据
      },
    }
  );

  const track = await response.json(); //将 API 返回的 JSON 数据 转换成 JavaScript 对象，存入 track 变量
  return json({
    track, //Spotify API 返回的 歌曲信息
    mood, //用户选择的情绪
    intensity: intensity ? parseInt(intensity) : undefined, //情绪强度参数
    initialState: state,
    initialSpeed: speed,
    stateIntensity: stateIntensity ? parseInt(stateIntensity) : undefined,
    speedIntensity: speedIntensity ? parseInt(speedIntensity) : undefined,
    accessToken: user.accessToken //用户的 Spotify API 访问令牌
  });
};


//定义网页meta信息
export const meta: MetaFunction<typeof loader> = ({ data }) => { //导出 meta 函数
  if (!data?.track) { //判断data.track是否存在
    return [
      { title: "Track Not Found - Spotify Music App" } //不存在
    ];
  }
  return [
    { title: `${data.track.name} - ${data.track.artists[0].name} - Spotify Music App` },
    { name: "description", content: `Listen to ${data.track.name} by ${data.track.artists[0].name}` },
  ]; //存在
};

//定义PlayTrack组件
export default function PlayTrack() {
  const { 
    track, 
    mood, 
    intensity, 
    accessToken,
    initialState,
    initialSpeed,
    stateIntensity,
    speedIntensity 
  } = useLoaderData<LoaderData>(); //获取 loader 返回的JSON数据
  const { setCurrentTrack, setAccessToken } = useOutletContext<AppContext>(); //获取全局上下文 setCurrentTrack：用于设置当前播放的歌曲
  const navigate = useNavigate(); //跳转页面
  const [playlists, setPlaylists] = useState<Playlist[]>([]); //播放列表状态
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false); //加载播放列表状态  false：表示加载完成
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); //存储 用户输入的搜索内容
  const [isPlaying, setIsPlaying] = useState(false); //播放暂停音乐，默认暂停
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null); //音频对象
  const [isLoading, setIsLoading] = useState(true); //页面加载状态
  const [showDialog, setShowDialog] = useState(false); //控制对话框的显示
  const [deviceId, setDeviceId] = useState<string>(""); //储存设备ID

  // 根据心情和强度获取背景色
  const getBackgroundClass = () => {
    if (!mood) return "from-green-400 via-blue-500 to-purple-500"; // 默认渐变

    const intensityLevel = intensity ? Math.floor(intensity / 34) : 1; // 0-33: low, 34-66: medium, 67-100: high

    if (mood === "happy") {
      switch (intensityLevel) {
        case 0:
          return "from-yellow-300 via-orange-400 to-red-400"; // 低强度
        case 1:
          return "from-yellow-400 via-orange-500 to-red-500"; // 中强度
        case 2:
          return "from-yellow-500 via-orange-600 to-red-600"; // 高强度
        default:
          return "from-yellow-400 via-orange-500 to-red-500";
      }
    } else {
      switch (intensityLevel) {
        case 0:
          return "from-blue-300 via-indigo-400 to-purple-400"; // 低强度
        case 1:
          return "from-blue-400 via-indigo-500 to-purple-500"; // 中强度
        case 2:
          return "from-blue-500 via-indigo-600 to-purple-600"; // 高强度
        default:
          return "from-blue-400 via-indigo-500 to-purple-500";
      }
    }
  };

  // 根据心情获取卡片背景色
  const getCardBackgroundClass = () => {
    if (!mood) return "bg-white/10";
    return mood === "happy"
      ? "bg-white/20 backdrop-blur-lg"
      : "bg-black/30 backdrop-blur-lg";
  };

  // 设置当前播放的歌曲和 token
  useEffect(() => {
    if (track.uri && accessToken) {
      // 设置一个短暂的延迟，确保播放器组件已经挂载
      const timer = setTimeout(() => {
        setCurrentTrack(track.uri); //设置当前播放的歌曲
        setAccessToken(accessToken); //存储 accessToken
        // 通过自定义事件来控制播放器展开
        window.dispatchEvent(new CustomEvent('expandPlayer')); //触发自定义事件 expandPlayer，让播放器展开
      }, 100); //延迟100ms

      return () => clearTimeout(timer); //清楚定时器，避免重复执行
    }
  }, [track.uri, accessToken, setCurrentTrack, setAccessToken]); //依赖数组
  //当 track.uri 或 accessToken 发生变化，这个 useEffect 会重新执行
  //setCurrentTrack 和 setAccessToken 也是依赖项，确保状态正确更新

  useEffect(() => { //副作用
    if (track.preview_url) { //检查试听链接是否催在
      const audioElement = new Audio(track.preview_url); //存在创建对象播放音乐
      setAudio(audioElement); //不存在取消"加载中"状态

      audioElement.addEventListener('loadeddata', () => { //监听数据加载
        setIsLoading(false); //数据加载完成取消加载中动画，表示用户可以直接播放音乐
      });

      audioElement.addEventListener('ended', () => { //监听ended事件
        setIsPlaying(false); //音乐播放完毕触发，更新播放状态，让 UI 变成"未播放"状态
      });

      return () => { //组件销毁时，track.preview_url 发生变化时触发
        audioElement.pause(); //暂停音频播放，防止内存占用
        audioElement.src = ""; //清除音频资源，防止页面加载过多音频文件
      };
    } else {
      setIsLoading(false); //track.preview_url 为空，直接取消"加载中"状态
    }
  }, [track.preview_url]); //依赖数组，useEffect 只有当 track.preview_url 变化时 才会执行

  // 处理播放/暂停
  const handlePlayClick = async () => {
    try {
      // 如果没有播放，开始播放
      if (!isPlaying) {
        // 触发播放器展开
        window.dispatchEvent(new CustomEvent('expandPlayer'));
        // 设置当前曲目和 token
        setCurrentTrack(track.uri);
        setAccessToken(accessToken);

        // 等待一小段时间确保播放器已初始化
        await new Promise(resolve => setTimeout(resolve, 500));

        // 通过 Spotify Web API 开始播放
        const response = await fetch(`https://api.spotify.com/v1/me/player/play`, { ////Spotify API 发送 HTTP 请求，用于控制播放器
          method: 'PUT', //表示修改播放器状态，让播放器播放音乐
          headers: {
            'Content-Type': 'application/json', //请求为JSON格式
            'Authorization': `Bearer ${accessToken}` //传入令牌
          },
          body: JSON.stringify({
            uris: [track.uri]
          }) //发送播放歌曲url
        });

        if (!response.ok) { //检查 API 是否返回成功状态
          throw new Error('Failed to start playback'); //出错抛出问题
        }
      } else {
        // 如果正在播放，暂停播放
        await fetch(`https://api.spotify.com/v1/me/player/pause`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}` //传入令牌，确保用户有权限暂停音乐
          }
        });
      }

      setIsPlaying(!isPlaying); //当播放/暂停音乐时，切换 isPlaying 状态
    } catch (error) {
      console.error('Error controlling playback:', error); //控制台打印错误
      toast.error('Failed to control playback. Premium subscription required.'); //错误提示弹窗
    }
  };

  // 监听播放状态变化
  useEffect(() => {
    const handlePlayStateChange = (event: CustomEvent) => { //监听 playStateChange 事件，接收 event.detail.isPlaying
      setIsPlaying(event.detail.isPlaying); //更新 isPlaying 状态，让 UI 与实际播放状态同步
    };

    window.addEventListener('playStateChange', handlePlayStateChange as EventListener); //当 playStateChange 事件触发时，执行 handlePlayStateChange
    return () => {
      window.removeEventListener('playStateChange', handlePlayStateChange as EventListener);
    }; //组件卸载时，移除监听器，防止内存泄漏
  }, []);


  // 处理播放器就绪
  const handlePlayerReady = (deviceId: string) => { //当 Spotify 播放器准备好时，获取 deviceId（设备 ID）
    setDeviceId(deviceId); //存储 deviceId 到 React 的 state
  };

  // 处理图片点击播放
  const handleImageClick = async () => {
    if (!deviceId) return; //如果 deviceId 为空，直接 return 退出函数

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, { 
        method: 'PUT',  //向 Spotify API 发送 PUT 请求，请求 Spotify 在指定设备上播放音乐
        headers: {
          'Content-Type': 'application/json', //请求为JSON格式
          'Authorization': `Bearer ${accessToken}` //传入令牌
        },
        body: JSON.stringify({
          uris: [`spotify:track:${track.id}`]
        })  //播放 track.id 对应的歌曲
      });
    } catch (error) {
      console.error('Error playing track:', error); //控制台打印错误
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br transition-colors duration-500 ${getBackgroundClass()}`}>
      {/* Navigation Bar */}
      <nav className="bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => navigate(-1)}
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
        <div className={`${getCardBackgroundClass()} backdrop-blur-lg rounded-lg p-8 max-w-md w-full mx-auto`}>
          <div className="aspect-square mb-6 relative group">
            <img
              src={track.album.images[0]?.url}
              alt={track.album.name}
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-4">
              {/* <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handlePlayClick}
                      className="bg-[#1DB954] hover:bg-[#1ed760] rounded-full p-3 transition-colors"
                    >
                      {isPlaying ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Spotify Premium required to play tracks</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-white">{track.name}</h1>
          <p className="text-white/60">
            {track.artists.map((artist) => artist.name).join(", ")}
          </p>
          <p className="text-white/60 mt-1">{track.album.name}</p>

          {/* 如果是从情绪推荐来的，显示情绪标签 */}
          {mood && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-white/60">Mood:</span>
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${mood === "happy" 
                  ? "bg-yellow-500/20 text-yellow-200" 
                  : "bg-blue-500/20 text-blue-200"}
              `}>
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
                {typeof intensity === 'number' && `(${intensity}%)`}
              </span>

              {/* Style 标签 */}
              {initialState && (
                <>
                  <span className="text-white/60 ml-2">Style:</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-200">
                    {initialState.charAt(0).toUpperCase() + initialState.slice(1)}
                    {typeof stateIntensity === 'number' && `(${stateIntensity}%)`}
                  </span>
                </>
              )}

              {/* Rhythm 标签 */}
              {initialSpeed && (
                <>
                  <span className="text-white/60 ml-2">Rhythm:</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-200">
                    {initialSpeed.charAt(0).toUpperCase() + initialSpeed.slice(1)}
                    {typeof speedIntensity === 'number' && `(${speedIntensity}%)`}
                  </span>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
