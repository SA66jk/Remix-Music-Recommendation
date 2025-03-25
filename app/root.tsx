import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node"; //LinksFunction：用于定义 links 头部元素，如 CSS 样式  LoaderFunctionArgs：用于 loader() 获取请求信息
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLocation,
} from "@remix-run/react";
//Links：用于渲染 <link> 组件（如 CSS）
//LiveReload：在开发模式下自动刷新页面
//Meta：管理 <meta> 标签，如 SEO 相关信息
//Outlet：用于渲染当前路由组件
//Scripts：用于加载 Remix 的 JavaScript
//ScrollRestoration：确保页面导航后滚动位置保持不变

import styles from "./tailwind.css"; 
import { getTheme } from "./lib/theme.server"; //导入自定义的cookie储存颜色工具
import {
  ClientHintCheck,
  getHints,
  useNonce,
  useTheme,
} from "./lib/client-hints"; //导入自定义颜色监听管理的工具
import clsx from "clsx"; //用于动态拼接css类名
import { Toaster } from "sonner"; //Toaster 组件用于显示 全局通知弹窗
import { useState } from "react"; //用于存储 当前播放的 Spotify 音乐 和 OAuth 令牌
import SpotifyPlayer from "~/components/SpotifyPlayer"; //导入自定义的Spotify播放器组件

//全局配置Tailwind CSS 样式
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];


//获取主题和客户端信息
export const loader = async ({ request }: LoaderFunctionArgs) => { //服务器端 loader() 用于 获取用户偏好和客户端环境信息
  return json({
    requestInfo: {
      hints: getHints(request), //获取客户端的特性，例如 是否为移动端
      userPrefs: {
        theme: getTheme(request), //从 cookie 或 session 获取用户的主题偏好（如 dark 或 light）
      },
    },
  });
};


//主入口组件
export default function App() {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null); //存储当前播放的 Spotify 歌曲 URI
  const [accessToken, setAccessToken] = useState<string | null>(null); //存储 Spotify API 授权令牌，用于播放音乐
  const location = useLocation(); //获取当前页面的 路由信息

  const theme = useTheme(); //获取用户的 主题偏好（dark/light）
  const nonce = useNonce(); //获取 CSP（内容安全策略）Nonce，防止 跨站脚本攻击（XSS）

  return (
    <html lang="en" className={clsx(theme)}> 
      <head>
        <ClientHintCheck nonce={nonce} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={{ setCurrentTrack, setAccessToken }} />
        <Toaster richColors position="top-center" />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        {currentTrack && accessToken && (
          <SpotifyPlayer 
            accessToken={accessToken}
            trackUri={currentTrack}
          />
        )}
      </body>
    </html>
  );
}
//HTML结构
//clsx(theme)：动态添加 dark/light 主题类名
//<ClientHintCheck nonce={nonce} />：检查 客户端特性（如设备类型）
//<Meta />：管理 SEO 元信息（如 title、description）
//<Links />：自动插入 CSS 文件（如 Tailwind）

//Body结构
//Outlet context={{ setCurrentTrack, setAccessToken }} />  Remix 的子路由渲染容器，context 允许子组件 修改当前播放的 Spotify 音乐（通过 setCurrentTrack
//<Toaster richColors position="top-center" /> 全局通知弹窗
//<ScrollRestoration /> 保持页面滚动位置，避免跳转后滚动到顶部
//<Scripts /> 加载 Remix 运行时 JavaScript
//<LiveReload /> 开发模式下自动刷新页面

// {currentTrack && accessToken && (  只有 currentTrack 和 accessToken 存在时，才会渲染 Spotify 播放器
//  <SpotifyPlayer 
//  accessToken={accessToken}  使用 accessToken 进行身份验证
//  trackUri={currentTrack}     设置播放器的 目标歌曲，确保加载正确的音频内容


// 导出 context 类型
export interface AppContext {
  setCurrentTrack: (uri: string | null) => void; //设置当前播放的歌曲（null 表示停止播放）
  setAccessToken: (token: string | null) => void; //存储 Spotify 授权令牌（null 表示登出）
}
//允许子组件访问和更新 Spotify 播放状态