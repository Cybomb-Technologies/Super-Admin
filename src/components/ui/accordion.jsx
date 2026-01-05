import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Accordion = ({ children, className }) => (
  <div className={cn('w-full', className)}>{children}</div>
);

const AccordionItem = ({ children, className }) => (
  <div className={cn('border-b', className)}>{children}</div>
);

const AccordionTrigger = ({ children, className }) => (
  <button className={cn('flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline', className)}>
    {children}
    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
  </button>
);

const AccordionContent = ({ children, className }) => (
  <div className={cn('pb-4 pt-0 text-sm transition-all', className)}>
    {children}
  </div>
);

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };