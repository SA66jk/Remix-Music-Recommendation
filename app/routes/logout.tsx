import type { ActionFunction } from "@remix-run/node"; //ActionFunction 用于处理 HTTP 请求的提交（POST 请求）
import { redirect } from "@remix-run/node"; //redirect Remix 提供的 页面重定向方法
import { authenticator } from "~/services/auth.server";
//导入authenticator，是使用 Remix Auth 进行身份验证的一个 Authenticator 实例

//action 是一个 Remix 服务器端 ActionFunction
export const action: ActionFunction = async ({ request }) => { //当用户提交 POST 请求 到当前路由时，action 会执行
  await authenticator.logout(request, { redirectTo: "/" });
}; //调用 authenticator.logout()，清除用户的身份认证信息，登出后重定向到主页 /

export const loader = () => redirect("/"); 
//loader 处理 GET 请求，直接调用 redirect("/")，让所有访问该页面的 GET 请求自动跳转到主页