import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const ToastProvider = ({ children }) => <>{children}</>;
const ToastViewport = ({ className, ...props }) => (
	<div className={cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)} {...props} />
);
const Toast = ({ className, variant, ...props }) => (
	<div className={cn("pointer-events-auto flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg", className)} {...props} />
);
const ToastAction = ({ className, ...props }) => <button className={cn("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium", className)} {...props} />;
const ToastClose = ({ className, ...props }) => (
	<button className={cn("absolute right-2 top-2 rounded-md p-1", className)} {...props}>
		<X className="h-4 w-4" />
	</button>
);
const ToastTitle = ({ className, ...props }) => <div className={cn("text-sm font-semibold", className)} {...props} />;
const ToastDescription = ({ className, ...props }) => <div className={cn("text-sm opacity-90", className)} {...props} />;

export {
	Toast,
	ToastAction,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
};
