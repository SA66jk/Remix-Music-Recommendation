//本页代码用于定义封装悬停信息提示组件

import * as React from "react"//引入React库，用于构建组件
import * as TooltipPrimitive from "@radix-ui/react-tooltip"//引入Tooltip组件库

import { cn } from "~/lib/utils"//工具函数，常用于动态拼接类名

const TooltipProvider = TooltipPrimitive.Provider
//定义TooltipProvider组件，用于提供Tooltip组件，管理所有 Tooltip 组件的 状态 和 延迟
const Tooltip = TooltipPrimitive.Root
//定义Tooltip组件，用于包裹TooltipTrigger和ToolipContent组件，用于管理 TooltipTrigger 和 TooltipContent 之间的 逻辑 和 状态
const TooltipTrigger = TooltipPrimitive.Trigger
//TooltipTrigger 是 Tooltip 组件的触发元素，通常是按钮或文本


const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName
//定义TooltipContent组件，用于显示提示框的内容


export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
//导出组件