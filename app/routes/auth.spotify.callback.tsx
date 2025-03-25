//本页代码用户处理 Spotify 登录认证，并在身份验证成功或失败后进行相应的跳转
//loader 适用于 自动触发 OAuth 登录（如 /auth/spotify）

import { LoaderFunction } from "@remix-run/node"; //用于定义数据加载函数，处理 HTTP 请求并返回相应的数据
import { authenticator } from "~/services/auth.server";
//导入authenticator，是使用 Remix Auth 进行身份验证的一个 Authenticator 实例

export const loader: LoaderFunction = ({ request }) => { //loader是务器端数据加载函数，用于处理 GET 请求
  return authenticator.authenticate("spotify", request, { //使用 Spotify 进行身份验证
    successRedirect: "/dashboard", //如果认证成功，用户将被重定向到 /dashboard 页面
    failureRedirect: "/failure", //如果认证失败，用户将被重定向到 /failure 页面
  });
};
