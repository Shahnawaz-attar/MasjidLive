import * as React from 'react';

// A simple Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props: ButtonProps, ref) => {
    const { className, variant = 'default', size = 'default', ...rest } = props;
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
      default: "bg-primary text-gray-50 hover:bg-primary/90",
      destructive: "bg-red-600 text-gray-50 hover:bg-red-600/90",
      outline: "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-200/80 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-700/80",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
      link: "underline-offset-4 hover:underline text-primary",
    };

    const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
      default: "h-10 py-2 px-4",
      sm: "h-9 px-3 rounded-md",
      lg: "h-11 px-8 rounded-md",
      icon: "h-10 w-10",
    };

    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    ].filter(Boolean).join(' ');

    return (
      <button
        className={classes}
        ref={ref}
        {...rest}
      />
    );
  }
);
Button.displayName = 'Button';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props: React.HTMLAttributes<HTMLDivElement>, ref) => {
    const { className, ...rest } = props;
    return (
      <div
        ref={ref}
        className={`rounded-2xl bg-surface dark:bg-dark-surface shadow-material border border-transparent dark:border-gray-700 ${className || ''}`}
        {...rest}
      />
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props: React.HTMLAttributes<HTMLDivElement>, ref) => {
    const { className, ...rest } = props;
    return <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className || ''}`} {...rest} />;
  }
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  (props: React.HTMLAttributes<HTMLHeadingElement>, ref) => {
    const { className, ...rest } = props;
    return <h3 ref={ref} className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`} {...rest} />;
  }
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  (props: React.HTMLAttributes<HTMLParagraphElement>, ref) => {
    const { className, ...rest } = props;
    return <p ref={ref} className={`text-sm text-gray-500 dark:text-gray-400 ${className || ''}`} {...rest} />;
  }
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props: React.HTMLAttributes<HTMLDivElement>, ref) => {
    const { className, ...rest } = props;
    return <div ref={ref} className={`p-6 pt-0 ${className || ''}`} {...rest} />;
  }
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props: React.HTMLAttributes<HTMLDivElement>, ref) => {
    const { className, ...rest } = props;
    return <div ref={ref} className={`flex items-center p-6 pt-0 ${className || ''}`} {...rest} />;
  }
);
CardFooter.displayName = 'CardFooter';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    (props: React.InputHTMLAttributes<HTMLInputElement>, ref) => {
        const { className, ...rest } = props;
        return (
            <input
                className={`flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
                ref={ref}
                {...rest}
            />
        );
    }
);
Input.displayName = 'Input';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>, ref) => {
        const { className, ...rest } = props;
        return (
            <textarea
                className={`flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
                ref={ref}
                {...rest}
            />
        );
    }
);
Textarea.displayName = 'Textarea';

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  (props: React.LabelHTMLAttributes<HTMLLabelElement>, ref) => {
      const { className, ...rest } = props;
      return (
          <label
              ref={ref}
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}
              {...rest}
          />
      );
  }
);
Label.displayName = 'Label';

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <XIcon className="h-4 w-4" />
                    </Button>
                </div>
                {children}
            </div>
        </div>
    );
};

// Simple shadcn-style Select (uses native select under the hood but styled)
const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  (props: React.SelectHTMLAttributes<HTMLSelectElement>, ref) => {
    const { className, children, ...rest } = props;
    const classes = `h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${className || ''}`;
    return (
      <select ref={ref} className={classes} {...rest}>
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

// Skeleton Loading Component
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const baseClass = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Skeleton presets
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} height={40} className="flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} height={50} className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Label, Textarea, Modal, Select, Skeleton };

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);