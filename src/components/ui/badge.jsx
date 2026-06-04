import * as React from "react";
import { cva } from "class-variance-authority";

const badgeVariants = cva(
  "signatureContainer inline-flex items-center rounded-[1000px] border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 capitalize",
  {
    variants: {
      variant: {
        default: "!border-transparent bg-[#7C3AED] text-[#F9FAFB] shadow-sm hover:bg-[#7C3AED]/80",
        secondary: "!border-transparent !bg-[#3c83f6] !text-white hover:bg-[#3c83d0]/80 border-none",
        destructive: "!border-transparent !bg-red-500 !text-white shadow-sm hover:!bg-red-500/80",
        outline: "!text-[#080118] !bg-[#f1f1f9] ring-1 ring-gray-100 hover:bg-gray-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }) {
  return <div className={badgeVariants({ variant, className })} {...props} />;
}

export { Badge, badgeVariants };
