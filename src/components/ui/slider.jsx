import React from 'react';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
    <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <div
        className="absolute h-full bg-primary"
        style={{ width: `${props.value?.[0] || 0}%` }}
      />
    </div>
    <input
      type="range"
      ref={ref}
      className="absolute h-2 w-full cursor-pointer appearance-none bg-transparent"
      {...props}
    />
  </div>
));
Slider.displayName = 'Slider';

export { Slider };