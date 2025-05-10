import * as React from "react";
import { View, ViewProps } from "react-native";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<View, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "bg-white border border-border rounded-2xl shadow-sm p-6",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card }; 