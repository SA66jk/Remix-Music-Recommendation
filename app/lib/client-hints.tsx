//本页代码用于检测，监听管理颜色模式

import { getHintUtils } from "@epic-web/client-hints";//引入（Client Hints）的库，用于检测和处理用户偏好
import {
  clientHint as colorSchemeHint,
  subscribeToSchemeChange,
} from "@epic-web/client-hints/color-scheme";
//clientHint 指代 colorSchemeHint 它表示用户的颜色模式偏好（light / dark）
//subscribeToSchemeChange 允许 监听用户的颜色模式（深色/浅色模式）何时改变，用于 刷新页面、重新获取数据，或者动态更新UI


import { useRevalidator, useRouteLoaderData } from "@remix-run/react";
//useRevalidator 在颜色模式切换时，通常需要重新获取服务器端的数据，以确保主题的正确性
//useRouteLoaderData("root")用于从Remix路由加载器（Loader） 中获取预加载的数据

import * as React from "react";//引入React库，用于构建组件
import type { loader as rootLoader } from "~/root";//rootLoader  Remix 根路由的 loader，提供全局数据
import type { SerializeFrom } from "@remix-run/node";
//Remix 提供的类型工具，用于 确保从 Loader 获取的数据是正确的类型


const hintsUtils = getHintUtils({
  theme: colorSchemeHint,
});
//getHintUtils({...}) 配置一个工具对象，用于管理与主题相关的客户端提示

export const { getHints } = hintsUtils;
//提取 getHints 函数  用于获取当前请求的客户端提示（如颜色模式）



// Remix theme utils below
export function useRequestInfo() {
  const data = useRouteLoaderData("root") as SerializeFrom<typeof rootLoader>;
  return data.requestInfo;
}
//获取请求信息  从根加载器（root loader） 获取服务器端数据，返回客户端提示、用户设置以及其他请求相关信息


export function useHints() {
  const requestInfo = useRequestInfo();
  return requestInfo.hints;
}
//获取用户提示  调用 useRequestInfo() 获取 服务器端请求信息，返回 hints（客户端提示），其中包括 颜色模式偏好等数据


export function ClientHintCheck({ nonce }: { nonce: string }) {
  const { revalidate } = useRevalidator();
  React.useEffect(
    () => subscribeToSchemeChange(() => revalidate()),
    [revalidate]
  );

  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: hintsUtils.getClientHintCheckScript(),
      }}
    />
  );
}
//监听颜色模式变化并重新验证数据
//useRevalidator() 提供手动触发数据重新获取的方法 revalidate()
//subscribeToSchemeChange(() => revalidate())  监听用户颜色模式的变化，当用户切换深色或浅色模式时，自动触发 revalidate() 重新获取数据
//向页面注入 JavaScript 代码 这个脚本可以检测客户端颜色模式，并在页面加载时初始化正确的主题


/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme() {

}

// Use nonce for the script tag
const NonceContext = React.createContext<string>("");
export const useNonce = () => React.useContext(NonceContext);
// NonceContext（提供安全的 nonce 机制） 确保 <script> 安全执行，防止 XSS 攻击