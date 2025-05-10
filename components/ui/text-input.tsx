import React from "react";
import { TextInput as RNTextInput, TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

interface Props extends TextInputProps {
  className?: string;
}

const TextInputComponent = React.forwardRef<RNTextInput, Props>(
  ({ className, ...props }, ref) => {
    return (
      <RNTextInput
        ref={ref}
        className={cn(
          "w-full bg-white/40 border border-white/50 rounded-xl px-4 py-3",
          "text-neutral-800 placeholder:text-neutral-500",
          "focus:border-blue-300 focus:bg-white/60",
          "transition-all duration-300",
          className
        )}
        placeholderTextColor="#6B7280"
        {...props}
      />
    );
  }
);

TextInputComponent.displayName = "TextInput";

export { TextInputComponent as TextInput };
export default TextInputComponent; 