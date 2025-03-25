//本页代码用于定义封装开关组件

import * as React from "react"//引入React库，用于构建组件
import * as SwitchPrimitives from "@radix-ui/react-switch"
//引入Switch组件

import { cn } from "~/lib/utils"//工具函数，常用于动态拼接类名

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root//开关根容器，管理开关状态
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
    //transition-colors → 平滑切换背景颜色
    //cursor-pointer → 鼠标变成手型，提示可交互
    //transition-colors → 平滑切换背景颜色
    //disabled:cursor-not-allowed → 禁用时鼠标变成“禁止”状态
    //disabled:opacity-50 → 禁用时降低透明度
    //data-[state=checked]:bg-primary → 开状态（checked），背景颜色变 primary（通常是蓝色/绿色）
    //data-[state=unchecked]:bg-input → 关状态（unchecked），背景颜色变 input（通常是灰色）

  >
    <SwitchPrimitives.Thumb//开关滑块，移动滑块表示开关状态
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    />
   //transition-transform → 滑块位置平滑过渡
   //data-[state=checked]:translate-x-4：checked 状态时，滑块右移 16px（表示 "开" 状态
   //data-[state=unchecked]:translate-x-0：unchecked 状态时，滑块回到 0px 位置（表示 "关" 状态）
   //h-4 w-4 → 滑块尺寸（16px x 16px）
   //bg-background → 背景色适配当前主题

  </SwitchPrimitives.Root>


))
Switch.displayName = SwitchPrimitives.Root.displayName
//定义Swith组件

export { Switch }
//导出组件