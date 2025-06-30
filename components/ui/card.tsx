import * as React from "react";
import { View, ViewProps, Platform } from "react-native";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<View, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        Platform.OS === 'web' ? "glass border border-border rounded-2xl shadow-sm p-6" : "bg-white border border-border rounded-2xl shadow-sm p-6",
        className
      )}
      style={Platform.OS === 'web' ? { backgroundColor: 'transparent' } : {}}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card }; 