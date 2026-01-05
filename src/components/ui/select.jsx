import * as React from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext(null);

const Select = ({ children, value, onValueChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef(null);
    const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('resize', updateCoords);
            window.addEventListener('scroll', updateCoords, true);
        }
        return () => {
            window.removeEventListener('resize', updateCoords);
            window.removeEventListener('scroll', updateCoords, true);
        };
    }, [isOpen]);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, coords }}>
            <div className="relative inline-block" ref={containerRef}>
                {children}
            </div>
        </SelectContext.Provider>
    );
};

const SelectTrigger = ({ children, className }) => {
    const { isOpen, setIsOpen } = React.useContext(SelectContext);
    return (
        <button
            type="button"
            className={cn(
                "flex h-11 min-w-[160px] items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold text-white focus:outline-none cursor-pointer transition-all hover:bg-white/10",
                isOpen && "border-indigo-500/50 bg-white/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]",
                className
            )}
            onClick={() => setIsOpen(!isOpen)}
        >
            {children}
        </button>
    );
};

const SelectValue = ({ placeholder }) => {
    const { value } = React.useContext(SelectContext);
    return (
        <span className="truncate">{value && value !== 'all' ? value : placeholder}</span>
    );
};

const SelectContent = ({ children, className }) => {
    const { isOpen, coords } = React.useContext(SelectContext);
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{
                        position: 'absolute',
                        top: coords.top + 8,
                        left: coords.left,
                        minWidth: Math.max(coords.width, 200),
                        zIndex: 9999
                    }}
                    className={cn(
                        "overflow-hidden rounded-2xl bg-[#0f172a] border border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl",
                        className
                    )}
                >
                    <div className="p-1.5 flex flex-col gap-1">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

const SelectItem = ({ value, children }) => {
    const { onValueChange, setIsOpen } = React.useContext(SelectContext);
    return (
        <div
            className="relative flex w-full cursor-pointer select-none items-center rounded-xl p-3 text-sm font-bold text-slate-400 transition-all hover:bg-white/10 hover:text-white"
            onClick={() => {
                onValueChange && onValueChange(value);
                setIsOpen(false);
            }}
        >
            {children}
        </div>
    );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
