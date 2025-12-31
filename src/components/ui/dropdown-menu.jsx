import React from 'react';
import { cn } from '@/lib/utils';

const DropdownMenu = ({ children }) => <div className="relative inline-block text-left">{children}</div>;
const DropdownMenuTrigger = ({ children, asChild, ...props }) => {
  return React.cloneElement(children, props);
};
const DropdownMenuContent = ({ children, className }) => (
  <div className={cn("absolute right-0 z-50 mt-2 min-w-[8rem] origin-top-right rounded-md border bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none", className)}>
    <div className="py-1">{children}</div>
  </div>
);
const DropdownMenuItem = ({ children, className, ...props }) => (
  <button
    className={cn("block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100", className)}
    {...props}
  >
    {children}
  </button>
);
const DropdownMenuLabel = ({ children, className }) => (
  <div className={cn("px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider", className)}>
    {children}
  </div>
);
const DropdownMenuSeparator = () => <div className="my-1 border-t border-gray-100" />;
const DropdownMenuGroup = ({ children }) => <div>{children}</div>;
const DropdownMenuPortal = ({ children }) => <>{children}</>;
const DropdownMenuSub = ({ children }) => <div className="relative">{children}</div>;
const DropdownMenuSubTrigger = ({ children }) => <button className="w-full text-left px-4 py-2 text-sm">{children}</button>;
const DropdownMenuSubContent = ({ children }) => <div className="absolute left-full top-0 mt-0">{children}</div>;
const DropdownMenuRadioGroup = ({ children }) => <div>{children}</div>;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};