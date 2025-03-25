//本页代码使用 Remix Auth 和 Spotify OAuth 进行用户身份验证，让用户通过 Spotify 账户登录，并存储其会话信息，以便访问 Spotify API 进行音乐播放和数据操作

import { Authenticator } from "remix-auth"; //remix-auth：用于管理用户身份认证的 Remix 插件
import { SpotifyStrategy } from "remix-auth-spotify"; //remix-auth-spotify：专门用于处理 Spotify OAuth 认证的策略
import { createCookieSessionStorage } from "@remix-run/node";
//用于创建基于 Cookie 的 Session 存储，存储用户的身份信息


// 定义用户类型
export interface User {
  id: string;
  email: string;
  accessToken: string; //Spotify 访问令牌，用户每次请求 API 时都需要
  refreshToken: string; //用于刷新 accessToken，防止访问令牌过期后无法继续使用
}

// 创建 session storage
export const sessionStorage = createCookieSessionStorage({ //创建一个基于 Cookie 的会话存储
  cookie: {
    name: "_session", //存储用户身份信息的 Cookie 名称
    sameSite: "lax", //限制跨站请求携带 Cookie，增强安全性
    path: "/", //Cookie 可用于整个站点
    httpOnly: true, //防止 JavaScript 访问 Cookie，提高安全性
    secrets: [process.env.SPOTIFY_CLIENT_SECRET || ""], // 确保是数组
    secure: process.env.NODE_ENV === "production", //在生产环境下，强制使用 HTTPS 传输 Cookie
  },
});

// 创建 authenticator 实例
export const authenticator = new Authenticator<User>(sessionStorage);
//sessionStorage：用于存储身份验证的 Session 信息


// 配置 Spotify 策略
const spotifyStrategy = new SpotifyStrategy(
  {
    clientID: process.env.SPOTIFY_CLIENT_ID || "", //Spotify 开发者账户的客户端 ID
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "", //Spotify 开发者账户的客户端密钥
    callbackURL: process.env.SPOTIFY_REDIRECT_URI || "http://localhost:3000/auth/spotify/callback",
    scope: "user-read-email user-read-private streaming user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private",
  }, //需要的权限
  
  async ({ accessToken, refreshToken, profile }) => {
    // 返回用户数据
    return {
      id: profile.id,
      email: profile.emails[0].value,
      accessToken,
      refreshToken, //用于获取新的 accessToken，避免用户重新登录
    };
  }
);

authenticator.use(spotifyStrategy); 