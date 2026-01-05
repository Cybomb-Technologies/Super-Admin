import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const Dialog = ({ children, open, onOpenChange }) => {
    if (!open) return null;
    return (
        <DialogPortal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => onOpenChange(false)}
                />
                <div className="relative z-[10000] w-full max-w-3xl animate-in zoom-in-95 duration-300">
                    {children}
                </div>
            </div>
        </DialogPortal>
    );
};

const DialogPortal = ({ children }) => {
    return createPortal(children, document.body);
};

const DialogContent = ({ className, children }) => (
    <div className={cn("bg-white rounded-[3.5rem] overflow-hidden shadow-2xl", className)}>
        {children}
    </div>
);

const DialogHeader = ({ className, ...props }) => (
    <div className={cn("flex flex-col space-y-1.5", className)} {...props} />
);

const DialogTitle = ({ className, ...props }) => (
    <h3 className={cn("text-lg font-semibold", className)} {...props} />
);

export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
}
