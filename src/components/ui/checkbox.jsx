import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={`signatureContainer peer h-4 w-4 shrink-0 rounded-[1000px] ring-1 ring-[#7c3bed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-transparent focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:!bg-[#7c3bed] data-[state=checked]:text-[#fff] ${className || ""}`.trim()}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={`flex items-center justify-center text-current`}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
