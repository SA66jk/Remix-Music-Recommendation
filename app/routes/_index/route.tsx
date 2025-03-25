import { Link, Form } from "@remix-run/react";//导入Remix 组件，Link 用于导航，Form 处理表单提交（登录）
import { Command } from "lucide-react";//导入图标组件（来自 lucide-react）
import { Card, CardContent } from "~/components/ui/card";//导入封装的卡片组件
import { Button } from "~/components/ui/button";//导入封装的按钮组件
import { MetaFunction, LoaderFunction, json } from "@remix-run/node";
//MetaFunction 用于设置 <title> 和 <meta> 信息
//LoaderFunction, json Remix 服务器端 loader（用于获取数据）

import { useLoaderData, useSearchParams } from "@remix-run/react";//Remix Hooks（用于获取 loader 传递的数据 & 解析 URL 参数）
import { authenticator } from "~/services/auth.server";//用户身份验证


//loader - Remix 服务器数据加载
export const loader: LoaderFunction = async ({ request }) => {
    await authenticator.isAuthenticated(request, {
        successRedirect: "/dashboard",
    });  //检查用户是否已登录，如果已登录，重定向到 /dashboard

    // 获取错误消息
    const url = new URL(request.url); //解析请求的 URL
    const error = url.searchParams.get("error"); //检查 URL 是否有 error 参数（用于错误消息）

    return json({ error }); //返回错误信息，前端可以通过 useLoaderData() 获取
};



// meta - 设置页面title和meta标签
export const meta: MetaFunction = () => {
    return [
        { title: "Welcome to Spotify Music Mood Recommendation App" },
        { name: "description", content: "Your personal music companion" },
    ];
};


//Index 组件
export default function Index() {
    const { error } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    return (
        <section className="w-full min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* 顶部导航 */}
            <nav className="flex items-center justify-between px-4 py-3 shadow-sm bg-white dark:bg-gray-800">
                <Link to="/" className="flex items-center space-x-2">
                    <Command className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Spotify Music Mood Recommendation App
                    </h1>
                </Link>
            </nav>

            {/* 主内容 */}
            <main className="container flex flex-col items-center justify-center flex-1 px-4 md:px-6 py-8">
                {/* 欢迎语 */}
                <div className="text-center space-y-4 mb-8">
                    {/* 显示错误消息 */}
                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg max-w-md mx-auto">
                            {error}
                        </div>
                    )}
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-800 dark:text-gray-200">
                        Welcome to the{" "}
                        <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-transparent bg-clip-text">
                            Spotify Music Mood Recommendation App 🎵
                        </span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Discover personalized recommendations, popular songs, and more!
                    </p>
                </div>

                {/* Login or Dashboard button */}
                <div className="relative">
                    <div className="p-2">
                        <Form action="/auth/spotify" method="post">
                            <Button
                                type="submit"
                                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Login with Spotify
                            </Button>
                        </Form>
                    </div>
                </div>

                {/* 功能模块 */}
                <div className="flex flex-col items-center space-y-4 mt-8">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200">
                        Explore Features
                    </h2>
                    <ul className="text-gray-600 dark:text-gray-400 space-y-2 text-left">
                        <li>🎧 Log in and view your personalized recommendations.</li>
                        <li>🎼 Discover popular songs and playlists.</li>
                        <li>📊 Track your listening habits and statistics.</li>
                    </ul>
                </div>
            </main>

            {/* 页脚 */}
            <footer className="text-center py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <p>&copy; 2024 Spotify Music App. All rights reserved.</p>
            </footer>
        </section>
    );
}

//登陆按钮点击后跳转/auth/spotify，用户可以进行 Spotify 授权
//错误信息显示 如果error存在显示错误信息  红色背景表示错误提示