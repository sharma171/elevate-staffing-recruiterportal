import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "signatureContainer inline-flex items-center justify-center gap-[6px] whitespace-nowrap rounded-[10px] text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        bluehover: "border border-input bg-[#3c83f6] hover:!bg-[#3c83f6e6] text-[#fff]",
        default: "bg-[#7c3bed] text-white hover:bg-[#7c3bede6]",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        outline: "border border-input bg-transparent hover:!bg-[#3c83f6] hover:text-[#fff]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "bg-transparent hover:!bg-[#3c83f6] hover:text-[#fff]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-[16px] py-2",
        sm: "h-9 px-[12px]",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={buttonVariants({ variant, size, className })} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
