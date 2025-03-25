//本页代码用于定义封装标签组件

import * as React from "react"//引入React库，用于构建组件
import * as LabelPrimitive from "@radix-ui/react-label"//引入 Radix 提供的基础标签组件 （Label）
import { cva, type VariantProps } from "class-variance-authority"
//用于管理样式变体的工具，允许根据不同的属性生成不同的样式
import { cn } from "~/lib/utils"//工具函数，常用于动态拼接类名

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)
//定义了一个名为labelVariants的变体，用于管理标签的样式变体


const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName
//定义了一个名为Label的组件，用于展示标签


export { Label }
//导出Label组件