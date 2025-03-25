//本页代码为 Spotify Web Playback SDK 提供 TypeScript 类型支持，扩展 window 以便在 Web 应用中正确使用 Spotify 播放器

//window 接口拓展
interface Window {
  Spotify: {
    Player: new (options: {
      name: string;
      getOAuthToken: (cb: (token: string) => void) => void; //身份验证   Spotify API 通过这个回调传入 accessToken
      volume: number;
    }) => Spotify.Player;
  };
  onSpotifyWebPlaybackSDKReady: () => void; //用于初始化播放器
} //Spotify Web Playback SDK 加载完毕后，Spotify 会调用

declare namespace Spotify {
  interface Player { //定义Spotify.Player接口
    connect(): Promise<boolean>; //连接 Spotify 播放器
    disconnect(): void; //断开播放器连接，清除当前播放实例
    addListener(event: string, callback: (state: any) => void): boolean; //监听播放器事件
    removeListener(event: string): void; //移除指定事件监听，用于清理事件监听，避免重复触发
    togglePlay(): Promise<void>; //切换播放/暂停，如果当前是播放状态，则暂停；如果是暂停状态，则播放
  }

  interface Track {
    id: string; //歌曲ID
    name: string; //歌曲名字
    artists: Array<{ name: string }>; //该曲目的演唱者（可能是单个或多个）
    album: {
      name: string; //专辑名称
      images: Array<{ url: string }>; //专辑封面url
    };
  }
} 