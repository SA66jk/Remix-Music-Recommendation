//本页代码用于如果用户未登录或访问令牌失效，则引导用户重新登录

import { redirect } from "@remix-run/node"; //redirect 是 Remix 提供的重定向方法
import { authenticator } from "~/services/auth.server"; //remix-auth：用于管理用户身份认证的 Remix 插件

export async function requireUser(request: Request) {
  const user = await authenticator.isAuthenticated(request); //会检查当前请求中的 Session 是否存在有效用户
  if (!user) { //如果 user 为空（未登录），执行 redirect
    throw redirect("/?error=Please login first"); //将用户重定向到 "/"（首页）并附带 error=Please login first 参数，提示用户登录
  }
  return user; //如果 user 存在，返回用户信息
}

export async function handleSpotifyError(response: Response, request: Request) {
  if (response.status === 401) {
    const error = "Session expired. Please login again.";
    console.log("auth error:", error);

    // 执行登出操作
    const logoutResponse = await authenticator.logout(request, { 
      redirectTo: `/?error=${encodeURIComponent(error)}`
    }); //清除用户的 Session 并 重定向到登录页，提示用户重新登录
    
    throw logoutResponse;
  }
  console.log("response:", response);

  if (!response.ok) { //表示 API 请求失败
    console.error("Spotify API Error:", await response.text());
    throw new Error(`Spotify API error: ${response.status}`);
  } //通过 await response.text() 记录 API 返回的错误信息，并抛出异常

  return response; //如果请求成功，则返回 response，继续处理数据
} 