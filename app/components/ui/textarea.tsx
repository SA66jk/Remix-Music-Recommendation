//本页代码用于定义封装文本输入框组件

import * as React from "react"//引入React库，用于构建组件

import { cn } from "~/lib/utils"//工具函数，常用于动态拼接类名

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"
//定义文本输入框组件
//多文本多行输入，不支持type类型


export { Textarea }
//导出组件