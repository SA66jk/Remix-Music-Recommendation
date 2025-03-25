//本页代码用于定义封装滚动区域组件

import * as React from "react" //引入React库，用于构建组件
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"//引入ScorllArea组件

import { cn } from "~/lib/utils" //工具函数，常用于动态拼接类名

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root //滚动区域根容器
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children} 
    </ScrollAreaPrimitive.Viewport> 
    <ScrollAreaPrimitive.Corner /> 
  </ScrollAreaPrimitive.Root>
))
//{children} 滚动内容
//</ScrollAreaPrimitive.Viewport> 滚动视图
//<ScrollAreaPrimitive.Corner /> 美化滚动交叉角


ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName
//定义滚动区域组件，接受className和children作为参数，返回一个ScrollAreaPrimitive.Root组件


const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",//定义滚动条样式
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",//支持垂直滚动
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",//支持水平滚动
      className
    )}
    {...props}//
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName
//定义滚动区域组件，接受className和orientation作为参数，返回一个ScrollAreaScrollbar.displayName组件


export { ScrollArea, ScrollBar }
//导出组件