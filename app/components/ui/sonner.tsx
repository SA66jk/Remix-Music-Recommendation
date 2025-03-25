//本页代码用于定义封装主题自适应背景颜色组件

import { useTheme } from "next-themes" //引入next-themes
import { Toaster as Sonner } from "sonner" //引入sonner

type ToasterProps = React.ComponentProps<typeof Sonner>
//定义ToasterProps类型，继承自Snooer组件所有属性


const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
// 通过useTheme获取主题，如果没有获取到，则默认为system
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}
//定义Toaster组件，接受props作为参数，返回一个Sonner组件
//group-[.toaster]:bg-background → 自动调整 Toast 背景颜色（深色模式=深色背景，浅色模式=浅色背景）
//group-[.toaster]:text-foreground → 确保文字颜色适配当前主题
//group-[.toaster]:border-border → 边框颜色自适应
//group-[.toast]:text-muted-foreground → 描述文本颜色适配当前主题



export { Toaster }
//导出组件