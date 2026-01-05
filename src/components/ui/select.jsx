import * as React from "react"
import { cn } from "@/lib/utils"

const Select = ({ children, value, onValueChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { value, onValueChange, isOpen, setIsOpen });
        }
        return child;
    });
};

const SelectTrigger = ({ children, className, isOpen, setIsOpen }) => (
    <div
        className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer", className)}
        onClick={() => setIsOpen(!isOpen)}
    >
        {children}
    </div>
);

const SelectValue = ({ placeholder, value }) => <span>{value || placeholder}</span>;

const SelectContent = ({ children, isOpen }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute top-full left-0 z-[1002] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-popover-foreground shadow-xl border border-slate-200 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-in fade-in slide-in-from-top-1 duration-200">
            {children}
        </div>
    );
};

const SelectItem = ({ value, children, onValueChange, setIsOpen }) => (
    <div
        className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-4 text-sm outline-none hover:bg-slate-100 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        onClick={() => {
            onValueChange && onValueChange(value);
            setIsOpen(false);
        }}
    >
        {children}
    </div>
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
