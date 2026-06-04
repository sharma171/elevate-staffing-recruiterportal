import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={`flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-[12px] py-2 text-[13.5px] text-[#080118] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#7c3bed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7c3bed] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${className || ""}`.trim()}
    {...props}
  >
    <div className="flex-1 text-left truncate pr-2 max-w-[95%]">{children}</div>
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors flex-shrink-0" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={`flex cursor-default items-center justify-center py-2 bg-gradient-to-b from-white to-gray-50 text-gray-600 ${className || ""}`.trim()}
    {...props}
  >
    <ChevronUp className="h-5 w-5" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={`flex cursor-default items-center justify-center py-2 bg-gradient-to-t from-white to-gray-50 text-gray-600 ${className || ""}`.trim()}
    {...props}
  >
    <ChevronDown className="h-5 w-5" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      style={{
        zIndex: 99999999999999,
        borderRadius: "8px",
        minHeight: "100px",
        maxHeight: "300px",
        overflowY: "hidden",
        overflowX: "hidden",
      }}
      className={`signatureContainer relative z-[9999] max-h-96 min-w-[8rem] w-full !overflow-scroll rounded-xl border-2 border-gray-200 bg-white shadow-lg !rounded-[6px] text-gray-700  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${position === "popper" ? "data-[side=bottom]:translate-y-2 data-[side=left]:-translate-x-2 data-[side=right]:translate-x-2 data-[side=top]:-translate-y-2" : ""} ${className || ""}`.trim()}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={`p-2 w-full ${position === "popper" ? "h-[var(--radix-select-trigger-height)] min-w-[var(--radix-select-trigger-width)]" : ""}`.trim()}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={`py-2 pl-2 pr-4 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50/50 ${className || ""}`.trim()}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={`relative flex w-full cursor-pointer rounded-xl select-none items-center rounded-lg py-2 pl-10 pr-4 text-sm font-medium text-gray-700 outline-none transition-all duration-150 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed hover:bg-[#3c83f6] hover:text-white hover:shadow-md focus:bg-[#3c83f6] focus:text-white focus:shadow-sm active:bg-[#e0e0d4] ${className || ""}`.trim()}
    {...props}
  >
    <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" strokeWidth={3} />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText className="line-clamp-1">{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={`-mx-1 my-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent ${className || ""}`.trim()}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
