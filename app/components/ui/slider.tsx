//本页代码用于定义封装滑动组件

import * as React from "react"//引入Reactk库，用于构建组件
import * as SliderPrimitive from "@radix-ui/react-slider"//引入slider组件

import { cn } from "~/lib/utils"//工具函数，常用于动态拼接类名

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    thumbClassName?: string;
    trackClassName?: string;
    activeTrackClassName?: string;
  }
>(({ className, thumbClassName, trackClassName, activeTrackClassName, ...props }, ref) => (
  <SliderPrimitive.Root //滑块根容器，管理滑块状态
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track //滑轨（整个滑动区域）
      className={cn(
        "relative h-1 w-full grow overflow-hidden rounded-full",
        trackClassName
      )}
    >
      <SliderPrimitive.Range className={cn( //滑轨的活动区域
        "absolute h-full bg-[#1DB954]",
        activeTrackClassName
      )} /> 
      
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb //滑块（拖动的小圆点）
      className={cn(
        "block h-3 w-3 rounded-full bg-white hover:scale-110 transition-all disabled:pointer-events-none disabled:opacity-50",
        thumbClassName
      )}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName
//定义滑块组件，接受className, thumbClassName, TrackClassName, artiveTrackClassName作为参数，返回一个SlilderPrimitive,Root组件


export { Slider }
//导出组件