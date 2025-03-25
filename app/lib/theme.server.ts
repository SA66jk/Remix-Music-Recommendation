//本页代码用于在 Cookie 中存储、获取和管理用户的主题偏好
//使用 cookie 库来处理 HTTP cookie，用于 持久化存储用户选择的颜色模式


import * as cookie from "cookie";//导入 cookie 处理库，用于解析和设置 HTTP Cookies

const cookieName = "en_theme";//定义存储用户主题信息的 Cookie 名称，这里是 "en_theme"
type Theme = "light" | "dark";
//规定可选的主题类型只能为light和dark模式

export function getTheme(request: Request): Theme | null {
  const cookieHeader = request.headers.get("cookie"); // 获取请求头中的 Cookie 字符串
  const parsed = cookieHeader
    ? cookie.parse(cookieHeader)[cookieName] // 解析 Cookie，获取 `en_theme` 的值
    : "light"; //默认返回light
  if (parsed === "light" || parsed === "dark") return parsed;
  return null; //不是light或dark返回无效值
}
//读取用户主题


export function setTheme(theme: Theme | "system") {
  if (theme === "system") {
    return cookie.serialize(cookieName, "", { path: "/", maxAge: -1 });
  } else {
    return cookie.serialize(cookieName, theme, { path: "/", maxAge: 31536000 });
  }
}
//设置用户主题  支持删除 Cookie（如果用户选择 "system"）否则，存储用户选择的主题
//删除 Cookie（使用 maxAge: -1 让浏览器删除它）
//path: "/"（让 整个网站都能访问这个 Cookie）
//maxAge: 31536000（让 Cookie 在 1 年内有效）