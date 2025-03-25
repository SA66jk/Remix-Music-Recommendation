//本页代码定义了一个工具函数 cn()，用于合并 CSS 类名（classnames），并且兼容 Tailwind CSS。


import { type ClassValue, clsx } from "clsx"//导入clsx
import { twMerge } from "tailwind-merge"//导入tailwind-merge

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
//定义cn函数 合并多个 CSS 类名（用 clsx） 
//去除 Tailwind CSS 冲突（用 twMerge）
//最终返回合并后的类名字符串