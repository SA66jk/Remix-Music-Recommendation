//本页代码用于定义封装输入组件

import * as React from "react"//引入React库，用于构建组件
import { cn } from "~/lib/utils"//工具函数，常用于动态拼接类名

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}
//定义了一个名为InputProps的接口，继承自React. InputHTMLAttributes<HtMLInputElement>接口

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
//定义了一个名为Input的组件，用于展示输入框
//短文本，单行输入，支持type类型


export { Input } 
//导出Input组件