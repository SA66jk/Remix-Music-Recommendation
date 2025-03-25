//本页代码用于定义封装警告对话框组件

import * as React from "react" //引入React库，用于构建组件
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
//引入 Radix 提供的基础对话框组件（AlertDialog）
import { cn } from "~/lib/utils" //工具函数，常用于动态拼接类名
import { buttonVariants } from "~/components/ui/button"
//用来生成按钮样式的函数，用于统一按钮的外观设计


const AlertDialog = AlertDialogPrimitive.Root
//定义对话框的根容器，是整个对话框组件的入口
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
//定义触发对话框的按钮或元素，用于打开对话框
const AlertDialogPortal = AlertDialogPrimitive.Portal
//用于将对话框的内容渲染到 HTML 的根节点
const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      //对话框打开时，背景遮罩层淡入，对话框关闭时，背景遮罩层淡出
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName
//这是对话框的背景遮罩层，用于阻止用户与页面其他部分交互


const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        //对话框打开时，对话框内容从左侧滑入，对话框关闭时，对话框内容从左侧滑出  对话框内容居中显示
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName
//话框的主体部分，包含标题、描述、操作按钮等内容  并确保内容在对话框打开时居中显示



const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      //对话框标题和描述居中显示，操作按钮居左显示
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"
//对话框的头部，用于显示标题和描述等内容


const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      //对话框的操作按钮居右显示
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"
//对话框的底部，用于显示操作按钮


const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    //对话框标题大号加粗显示
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName
//用于显示对话框的标题


const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    //对话框描述小号灰色显示
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName
//用于显示对话框的描述


const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName
//对话框的操作按钮，用于执行操作


const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName
//对话框的取消按钮，用于关闭对话框


export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
//导出封装好的所有组件