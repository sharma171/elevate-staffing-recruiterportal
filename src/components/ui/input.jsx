import * as React from "react";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={`signatureContainer form-control flex h-10 w-full rounded-[10px] ring-1 ring-[#e7e7ef] bg-background px-[12px] text-base ring-offset-background file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground
        focus:!outline-none focus:ring-2 focus:ring-inset focus-visible:ring-inset focus:ring-[#7c3bed] 
        
        focus-visible:!ring-2 focus-visible:!ring-[#7c3bed] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className || ""}`.trim()}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
