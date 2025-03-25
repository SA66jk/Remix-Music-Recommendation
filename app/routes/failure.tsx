import { Link, Form } from "@remix-run/react"; //导入Remix 组件，Link 用于导航，Form 处理表单提交（登录）
import { Button } from "~/components/ui/button"; //导入Button组件
import { Command, AlertCircle } from "lucide-react"; //导入警告图标和Spotify图标
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
//导入Alert组件

export default function Failure() { //定义 Failure 组件 用于 Spotify 认证失败时显示错误信息和引导操作
    return (
        <section className="w-full min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <nav className="flex items-center justify-between px-4 py-3 shadow-sm bg-white dark:bg-gray-800">
                <Link to="/" className="flex items-center space-x-2"> 
                    <Command className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Spotify Music App
                    </h1>
                </Link>
            </nav>

            {/* Main Content */}
            <main className="container flex flex-col items-center justify-center flex-1 px-4 md:px-6 py-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Error Alert */}
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Authentication Failed</AlertTitle>
                        <AlertDescription>
                            We couldn't authenticate you with Spotify. This might happen due to:
                            <ul className="list-disc list-inside mt-2">
                                <li>Login out failed</li>
                                <li>Connection issues</li>
                                <li>Expired session</li>
                                <li>Permission denied</li>
                                <li>No login permission, please contact the administrator</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    {/* Action Buttons */}
                    <div className="text-center space-y-4 ">
                        {/* Try Logout Button */}
                        <Form action="/logout" method="post" className="mb-5">
                            <Button
                                type="submit"
                                variant="outline"
                                className="w-full border-red-500 text-red-500 hover:bg-red-50"
                            >
                                Click Here To Log Out First And Login Again
                            </Button>
                        </Form>

                        {/* Return Home Button */}
                        <Link to="/">
                            <Button
                                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Return to Home 
                            </Button>
                        </Link>
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            Please try logging in again from the home page.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <p>&copy; 2024 Spotify Music App. All rights reserved.</p>
            </footer>
        </section>
    );
} 

//Alert组件 Alert variant="destructive" 红色警告框
//AlertCircle ⚠️ 警告图标
//AlertDescription 列出可能的失败原因

//登出按钮 Form action="/logout" method="post" 发送 POST 请求登出

