import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border-2 border-[#a89779]/50 bg-[#f5f0e8] px-3 py-2 text-base text-[#5a4a3a] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#a89779]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b7355] focus-visible:ring-offset-1 focus-visible:border-[#8b7355] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        style={{
          boxShadow: 'inset 0 1px 3px rgba(139, 115, 85, 0.1)'
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }