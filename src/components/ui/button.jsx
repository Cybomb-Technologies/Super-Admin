import { cn } from '@/lib/utils';
import React from 'react';

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
	const variants = {
		default: 'bg-indigo-600 text-white hover:bg-indigo-700',
		destructive: 'bg-red-600 text-white hover:bg-red-700',
		outline: 'border border-slate-700 bg-transparent hover:bg-slate-800 hover:text-white text-slate-200',
		secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700',
		ghost: 'hover:bg-slate-800 hover:text-white text-slate-300',
		link: 'text-indigo-400 underline-offset-4 hover:underline',
	};

	const sizes = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-10 w-10',
	};

	const variantClass = variants[variant] || variants.default;
	const sizeClass = sizes[size] || sizes.default;

	return (
		<button
			className={cn(
				'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
				variantClass,
				sizeClass,
				className
			)}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button };
