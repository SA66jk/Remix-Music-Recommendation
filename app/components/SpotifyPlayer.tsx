import { useEffect, useState, useRef } from 'react';//引入React库，用于构建组件
import { useLocation } from "@remix-run/react";
//useEffect：用于处理副作用（如初始化播放器、监听事件）
//useState：用于管理组件的状态（如播放器状态、播放进度）
//useRef：用于存储可变的引用（如 setInterval 计时器）
//useLocation：用于获取当前路由路径（可能用于判断是否在播放器页面）

import { Slider } from "~/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
//引入悬停信息提示组件


interface SpotifyPlayerProps {
  accessToken: string;// Spotify API 访问令牌
  trackUri: string;// 播放的歌曲 URI
}

//播放器的状态管理
export function SpotifyPlayer({ accessToken, trackUri }: SpotifyPlayerProps) {
  const location = useLocation();
  const [player, setPlayer] = useState<Spotify.Player | null>(null);//存储 Spotify.Player 实例
  const [isPlaying, setIsPlaying] = useState(false);//播放状态（true = 播放中，false = 暂停）
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track | null>(null);//当前播放的歌曲信息
  const [deviceId, setDeviceId] = useState<string>("");//设备 ID，Spotify API 需要
  const [isVisible, setIsVisible] = useState(false);//播放器是否可见（否）
  const [isExpanded, setIsExpanded] = useState(false);//播放器是否展开（否）
  const [progress, setProgress] = useState(0);//当前播放进度（毫秒）
  const [duration, setDuration] = useState(0);//歌曲总时长（毫秒）
  const progressInterval = useRef<NodeJS.Timeout>();



  // 监听自定义事件来展开播放器
  useEffect(() => {
    const handleExpandPlayer = () => setIsExpanded(true);
    window.addEventListener('expandPlayer', handleExpandPlayer);//监听 window 事件 expandPlayer（自定义事件），当触发该事件时，展开播放器   自定义事件需要手动触发
    return () => window.removeEventListener('expandPlayer', handleExpandPlayer);
  }, []);
    //window.dispatchEvent(new CustomEvent('expandPlayer')) 手动触发此事件



  // 处理鼠标滚轮事件
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (isExpanded && event.deltaY > 0) {  // 向下滚动自动折叠播放器
        setIsExpanded(false);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isExpanded]);




  // 移除滚轮事件监听，只保留点击控制条来展开/折叠
  const toggleExpanded = () => setIsExpanded(!isExpanded);




  // 初始化播放器
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);
    //动态加载Spotify SDK

    //window.onSpotifyWebPlaybackSDKReady 监听SDK就绪 Spotify Web Playback SDK 加载完成后，会自动调用
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Mood Music Player',
        getOAuthToken: cb => { cb(accessToken); },//每次需要 Spotify 授权时，会传递 accessToken 进行认证
        volume: 0.5 //初始音量为 50%
      });
      //创建一个 Spotify.Player 实例，用于控制 Spotify 播放器
      //这里 getOAuthToken 传递 accessToken，确保播放器有权限播放音乐


      //监听ready事件，获取设备ID  当播放器准备好时，执行下面操作
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id); //存储设备 ID，用于后续播放 API 请求
        setIsVisible(true); //让播放器显示出来（可见状态）
      });


      //监听播放状态变化事件，更新播放器状态
      player.addListener('player_state_changed', state => {
        if (state) {
          setCurrentTrack(state.track_window.current_track); //player发生状态变化时，更新当前播放的歌曲信息
          setIsPlaying(!state.paused); //player发生状态变化时，更新是否正在播放（state.paused 为 false 时播放）
          setProgress(state.position); //player发生状态变化时，更新当前播放进度（毫秒）
          setDuration(state.duration); //player发生状态变化时，更新歌曲总时长（毫秒）
        }
      });
      //播放，暂停，切换歌曲时，更新播放进度时候，会触发player_state_changed事件

      //连接Spotify账户
      player.connect();
      setPlayer(player);
    };

    //组件卸载时，断开连接，移除脚本
    return () => {
      if (player) {
        player.disconnect();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [accessToken]);
  //避免 player 占用系统资源，防止内存泄漏  避免多个 <script> 重复加载，影响应用性能


  
  // 处理 trackUri 变化
  useEffect(() => {
    if (deviceId && trackUri) {
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, { //Spotify API 控制 deviceId 设备 播放 trackUri 指定的歌曲
        method: 'PUT',   //PUT请求
        body: JSON.stringify({ uris: [trackUri] }),//播放指定的歌曲
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${accessToken}` //令牌验证
        },
      });
    }
  }, [trackUri, deviceId, accessToken]);



  // 更新进度条
  useEffect(() => {
    if (isPlaying) { //检查是否在播放中
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= duration) {
            clearInterval(progressInterval.current);
            return 0;
          } //progress >= duration（播放结束），清除计时器，重置进度为0
          return prev + 1000; //播放中，每秒更新一次进度
        });
      }, 1000); 
    } else {
      clearInterval(progressInterval.current);
    } //不在播放中，清除计时器

    return () => clearInterval(progressInterval.current);
  }, [isPlaying, duration]); //组件卸载时，清除计时器



  const togglePlay = async () => {
    if (!player) return; //检查player是否存在
    await player.togglePlay(); //切换播放状态
    setIsPlaying(!isPlaying); //更新播放状态
    
    
    // 发送播放状态变化事件  触发全局事件 playStateChange，通知其他组件播放状态已改变
    window.dispatchEvent(new CustomEvent('playStateChange', {
      detail: { isPlaying: !isPlaying }
    }));
  };


  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`; //保持秒数始终为两位数
  }; //将毫秒转化为 分钟：秒 的格式


  
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 backdrop-blur-sm text-white transition-all duration-300 ease-in-out
        ${isExpanded ? "h-28" : "h-12"} 
        ${isVisible ? "translate-y-0" : "translate-y-full"}
        bg-black/80
      `}
     //fixed bottom-0 left-0 right-0 固定视口在底部，宽度填满整个屏幕
     //backdrop-blur-sm 背景模糊效果
     //transition-all duration-300 ease-in-out 变化过渡动画，持续300ms，开始和结束都比较缓慢，中间加速
     //${isExpanded ? "h-28" : "h-12"} 播放器高度展开28px，折叠12px
     //${isVisible ? "translate-y-0" : "translate-y-full"} 播放器可见时，不偏移，不可见时，向下偏移整个高度

    >
      <TooltipProvider> 
        <Tooltip>
          <TooltipTrigger asChild>
            {/* 控制条 */}
            <div
              className="absolute -top-10 left-0 right-0 h-0 flex justify-center cursor-pointer bg-gradient-to-t from-black/80 to-transparent"
              onClick={toggleExpanded}  
            >
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse" />
                  <div className="w-1 h-4 bg-white/50 rounded-full animate-pulse [animation-delay:75ms]" />
                  <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse [animation-delay:150ms]" />
                  <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse [animation-delay:225ms]" />
                  <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse [animation-delay:300ms]" />
                </div>
                <div className="text-xs text-white/50">
                  {isExpanded ? "Hide Player" : "Show Player"}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Spotify Premium required to play tracks</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      

      {/* 迷你播放器 - 折叠时显示 */}
      {!isExpanded && currentTrack && (
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 bg-white/10 rounded overflow-hidden">
              {currentTrack.album.images[0] && (
                <img
                  src={currentTrack.album.images[0].url}
                  alt={currentTrack.album.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">
                {currentTrack.name}
              </h3>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={togglePlay}
                  className="bg-[#1DB954] hover:bg-[#1ed760] rounded-full p-2 transition-colors ml-4"
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Spotify Premium required to play tracks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* 完整播放器 - 展开时显示 */}
      <div
        className={`
          container mx-auto px-4 h-full py-2
          transition-all duration-300 ease-in-out
          ${isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        <div className="flex flex-col h-full justify-between">
          {/* 播放器信息栏 */}
          <div className="flex items-center justify-between">
            {currentTrack && (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-white/10 rounded overflow-hidden">
                  {currentTrack.album.images[0] && (
                    <img
                      src={currentTrack.album.images[0].url}
                      alt={currentTrack.album.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate text-sm">
                    {currentTrack.name}
                  </h3>
                  <p className="text-xs text-white/60 truncate">
                    {currentTrack.artists.map(a => a.name).join(", ")}
                  </p>
                </div>
              </div>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={togglePlay}
                    className="bg-[#1DB954] hover:bg-[#1ed760] rounded-full p-3 transition-colors ml-4"
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
            </TooltipProvider>
          </div>

          {/* 进度条 */}
          <div className="space-y-1">
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/50 transition-all duration-1000 ease-linear"
                style={{ width: `${(progress / duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/60">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

//播放控制条  onClick={toggleExpanded} ，点击控制条可以展开或者折叠播放控制条
//播放控制条  <div className="flex gap-1">
  //<div className="w-1 h-3 bg-white/50 rounded-full animate-pulse" />
  //<div className="w-1 h-4 bg-white/50 rounded-full animate-pulse [animation-delay:75ms]" />
  //<div className="w-1 h-2 bg-white/50 rounded-full animate-pulse [animation-delay:150ms]" />
  //<div className="w-1 h-3 bg-white/50 rounded-full animate-pulse [animation-delay:225ms]" />
  //<div className="w-1 h-2 bg-white/50 rounded-full animate-pulse [animation-delay:300ms]" />
//</div>  模拟 "音量跳动" 动画   animate-pulse 周期性放大/缩小，形成闪烁动画  animation-delay:xxms  每个小柱子的动画延迟不同，形成交错效果
//播放控制条 {isExpanded ? "Hide Player" : "Show Player"} 当播放器展开时显示 "Hide Player" 当播放器折叠时显示 "Show Player" 
//播放控制条 TooltipContent 悬停显示  鼠标悬停显示"Spotify Premium required to play tracks"

//迷你播放器 {!isExpanded && currentTrack && (  只有在 isExpanded === false 且 currentTrack 存在时，显示迷你播放器  播放器展开时 (isExpanded === true) 迷你播放器会隐藏
//迷你播放器 flex items-center justify-between 使用 Flexbox 布局  垂直居中对齐 左侧显示封面 & 歌名，右侧显示按钮
//迷你播放器 currentTrack.album.images[0].url 当前播放歌曲封面图
//迷你播放器 currentTrack.name 当前播放歌曲名
//迷你播放器 isPlaying = true 显示暂停按钮  isPlaying = false 显示播放按钮
//迷你播放器 TooltipContent 悬停显示  鼠标悬停显示"Spotify Premium required to play tracks"

//<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/> path 用于 绘制 SVG 图标（路径绘制两个矩形），表示 暂停按钮（"⏸"）
//<path d="M8 5v14l11-7z"/> path 用于 绘制 SVG 播放按钮（"▶"）

//完整播放器 isExpanded = true 时完全显示播放器，否则完全透明且无法点击

//播放信息栏 flex items-center justify-between 使用 Flexbox 布局  垂直居中对齐 左侧显示封面 & 歌名，右侧显示按钮
//播放信息栏 currentTrack.album.images[0].url 当前播放歌曲封面图
//播放信息栏 currentTrack.name 当前播放歌曲名
//播放信息栏 {currentTrack && ( 检查是否有播放的歌曲 如果 currentTrack 存在，才显示歌曲信息
//播放信息栏 currentTrack.artists.map(a => a.name).join(", ")  当前歌曲演唱者
//播放信息栏 truncate 超长文本自动省略（...）防止 UI 溢出
//播放信息栏 isPlaying = true 显示暂停按钮  isPlaying = false 显示播放按钮
//播放信息栏 TooltipContent 悬停显示  鼠标悬停显示"Spotify Premium required to play tracks"

//进度条 transition-all 所有样式变化都带动画   
//进度条 duration-1000 进度条每次变化时 动画持续 1s（1000ms）
//进度条 ease-linear 线性过渡，让进度条匀速增长
//进度条 width: `${(progress / duration) * 100}%` 根据 progress 和 duration 计算进度
//进度条 flex justify-between 左侧显示 progress（播放时间），右侧显示 duration（总时长）
//进度条 formatTime 格式化时间（毫秒转 mm:ss）



export default SpotifyPlayer;
//导出组件