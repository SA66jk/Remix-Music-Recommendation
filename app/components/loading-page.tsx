//本页代码用于定义封装登陆加载界面组件

import { Loader2 } from "lucide-react";//引入Loader2组件，用于显示加载动画

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 flex items-center justify-center">
      <div className="text-center text-white">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connecting to Spotify</h2>
        <p className="text-white/80">Please wait while we set up your session...</p>
      </div>
    </div>
  );
} 

//min-h-screen bg-gradient-to-br 全屏，背景渐变，从左上（top-left）到右下（bottom-right）渐变
//from-green-400 via-blue-500 to-purple-500  设置渐变的 起始（绿）、中间（蓝）、结束（紫） 颜色
//flex items-center justify-center 加载界面居中显示
//text-center text-white 文字居中对齐，并使用白色文本
//居中的旋转加载动画（Loader2）