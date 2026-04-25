import { forwardRef } from 'react';

export const Input = forwardRef(({ className = '', icon: Icon, ...props }, ref) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-slate-500" />
        </div>
      )}
      <input
        ref={ref}
        className={`glass-input w-full rounded-xl px-4 py-3 sm:text-sm ${
          Icon ? 'pl-10' : ''
        } ${className}`}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';
