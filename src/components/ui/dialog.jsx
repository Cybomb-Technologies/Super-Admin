import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

const Dialog = ({ children, open, onOpenChange }) => {
    if (!open) return null;
    
    return createPortal(
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                zIndex: 2147483647,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(2px)'
            }}
            onClick={() => onOpenChange(false)}
        >
            <div 
                onClick={e => e.stopPropagation()}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '95vw',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none',
                    padding: '0 20px',
                    boxSizing: 'border-box'
                }}
            >
                {children}
            </div>
        </div>,
        document.body
    );
};

const DialogTrigger = ({ children, asChild, ...props }) => {
    return React.cloneElement(children, props);
};

const DialogContent = ({ children, className, ...props }) => (
    <div className={cn("relative w-full", className)} {...props}>
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
