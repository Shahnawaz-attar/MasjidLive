import React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../src/components/ui/dialog";

// Re-export all shadcn/ui components
export { Button, buttonVariants } from "../src/components/ui/button";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "../src/components/ui/card";
export { Input } from "../src/components/ui/input";
export { Label } from "../src/components/ui/label";
export { Textarea } from "../src/components/ui/textarea";
export { Popover, PopoverTrigger, PopoverContent } from "../src/components/ui/popover";
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "../src/components/ui/dialog";
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "../src/components/ui/select";
export { Toaster } from "../src/components/ui/toaster";

// Keep existing custom components that aren't replaced by shadcn
export { Calendar } from "../src/components/ui/calendar";
export { DatePicker } from "../src/components/ui/date-picker";

// Legacy compatibility exports (for components not yet migrated)
export const XIcon = X;

// Simple skeleton component for loading states
export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse rounded-md bg-muted ${className}`}
    {...props}
  />
);

// Table skeleton for data loading
export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-4">
    <div className="flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-10 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-12 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// Legacy Modal wrapper using Dialog
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode; 
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-3 duration-300">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
      </DialogHeader>
      <div className="animate-in fade-in-0 slide-in-from-top-1 duration-200 delay-100">
        {children}
      </div>
    </DialogContent>
  </Dialog>
);