import { LoaderFunction, json, MetaFunction } from "@remix-run/node";
//MetaFunction 用于设置 <title> 和 <meta> 信息
//LoaderFunction, json Remix 服务器端 loader（用于获取数据）

import { useLoaderData, Form, Link, useNavigation } from "@remix-run/react";
//useLoaderData 用于获取 loader 加载的数据
//useNavigation 用于获取当前页面的 导航状态

import { authenticator } from "~/services/auth.server";
//导入authenticator，是使用 Remix Auth 进行身份验证的一个 Authenticator 实例

import type { User } from "~/services/auth.server"; //User 定义 User 类型（表示用户信息）
import { Button } from "~/components/ui/button"; //导入Button组件
import {
  Search,
  Music2,
  Heart,
  LogOut,
  User as UserIcon,
  Loader2
} from "lucide-react"; //导入Lucide-react 图标库中的部分图标

//设置Meta信息
export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - Spotify Music App" },
    { name: "description", content: "Your music dashboard" },
  ];
};


//服务器loader用于加载用户信息
export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/?error=Please login first",
  });
//如果用户已登录返回用户数据，未登录重新定向到"/?error=Please login first"（返回登录页）

//验证accessToken
  if (!user || !user.accessToken) {
    throw new Error("No access token found");
  }
  //如果没有 accessToken，说明用户未正确登录，抛出错误


  // 这里可以使用 accessToken 调用 Spotify API
  const { accessToken, id, email } = user;
  //服务器返回JSON
  return json({
    user: {
      id,
      email,
      accessToken //Spotify API 访问令牌
    }
  });
};

//dashboard组件
export default function Dashboard() {
  const { user } = useLoaderData<{ user: User }>(); //从 loader 获取用户信息（id, email, accessToken）
  const navigation = useNavigation(); //获取当前导航页状态
  const isLoading = navigation.state === "submitting"; //检查是否在提交状态

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-500">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部用户信息 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <UserIcon className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-sm opacity-80">{user.email}</p>
            </div>
          </div>
          <Form action="/logout" method="post"> 
            <Button
              type="submit"
              variant="ghost"
              className="text-white hover:bg-white/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5 mr-2" />
              )}
              {isLoading ? "Signing out..." : "Sign out"}
            </Button>
          </Form>
        </div>

        {/* 功能按钮网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mood Recommendations */}
          <Link to="/mood" className="block">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 hover:bg-white/20 transition-all">
              <Heart className="h-12 w-12 text-white mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Mood Music</h2>
              <p className="text-white/80">Get music recommendations based on your mood</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}

//isLoading === true 时，显示 Loader2，Loader2 是 lucide-react 提供的加载动画图标
//当 isLoading === false 时，显示 LogOut 图标，LogOut 是 lucide-react 提供的 退出图标
