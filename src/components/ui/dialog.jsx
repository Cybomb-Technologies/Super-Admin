import * as React from "react"
import { cn } from "@/lib/utils"

const Dialog = ({ children, open, onOpenChange }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50">
            <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
                {children}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

const DialogTrigger = ({ children, asChild, ...props }) => {
    return React.cloneElement(children, props);
};

const DialogContent = ({ children, className, ...props }) => (
    <div className={cn("mt-4", className)} {...props}>
        {children}
    </div>
);

const DialogHeader = ({ className, ...props }) => (
    <div className={cn("mb-4", className)} {...props} />
);

const DialogTitle = ({ className, ...props }) => (
    <h2 className={cn("text-xl font-bold", className)} {...props} />
);

const DialogFooter = ({ className, ...props }) => (
    <div className={cn("mt-6 flex justify-end space-x-2", className)} {...props} />
);

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
}
