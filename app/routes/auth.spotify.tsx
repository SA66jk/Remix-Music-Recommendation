//本页代码用于处理 Spotify OAuth 登录请求，当用户提交登录表单时，触发身份验证
//action 适用于 表单提交 触发认证（如点击 "Spotify 登录" 按钮）

import { ActionFunction } from "@remix-run/node"; //ActionFunction 用于处理 HTTP 请求的提交（POST 请求）
import { authenticator } from "~/services/auth.server";
//导入authenticator，是使用 Remix Auth 进行身份验证的一个 Authenticator 实例

export const action: ActionFunction = ({ request }) => { //接受一个 request 对象（HTTP 请求），进行身份验证
  return authenticator.authenticate("spotify", request); 
};  //触发身份验证 如果用户已登录，它会直接返回用户信息  如果用户未登录，它会重定向用户到 Spotify 登录页面，完成 OAuth 认证