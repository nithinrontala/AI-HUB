import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export const Button = forwardRef(
  ({ className = '', children, variant = 'primary', isLoading, icon: Icon, ...props }, ref) => {
    
    const variants = {
      primary: 'glass-button',
      ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white transition-all',
      outline: 'border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200 transition-all'
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={`w-full flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 ${variants[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && Icon && <Icon className="mr-2 h-5 w-5" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
