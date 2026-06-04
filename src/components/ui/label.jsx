import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";

const labelVariants = cva(
  "signatureContainer !text-sm !font-medium text-[#080118] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={labelVariants({ className })} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
