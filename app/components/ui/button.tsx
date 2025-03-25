//本页代码用于定义封装按钮组件和按钮样式变体

import * as React from "react"//引入React库，用于构建组件
import { Slot } from "@radix-ui/react-slot"//用于动态替换组件的根元素
import { cva, type VariantProps } from "class-variance-authority"
//用于管理样式变体的工具，允许根据不同的属性生成不同的样式
import { cn } from "~/lib/utils"//工具函数，常用于动态拼接类名

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default://默认样式
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive://危险样式
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline://轮廓样式
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary://次要样式
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",//透明样式
        link: "text-primary underline-offset-4 hover:underline",//链接样式
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
//定义了一个名为buttonVariants的样式变体，用于生成不用类型的按钮样式


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
//定义了一个名为ButtonProps的接口，用于描述按钮组件的属性


const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
//定义了名为button的组件，用于展示按钮


export { Button, buttonVariants }
//导出组件和样式变体