import { cx } from "@/lib/util";
import React, { forwardRef, HTMLAttributes, ReactNode } from "react";

interface TabProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
}

const Tab = forwardRef<HTMLDivElement, TabProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cx(
          `bg-[#1a1a1a] border border-[#2a2a2a] p-8 shadow-lg`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Tab.displayName = "Tab";

export { Tab };
