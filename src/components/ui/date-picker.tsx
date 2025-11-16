"use client"

import * as React from "react"
import { Calendar } from "lucide-react"
import { cn } from "../../lib/utils"

interface DatePickerProps {
  id?: string
  value: string | undefined
  onChange: (e: { target: { id: string; value: string } }) => void
  min?: string
  max?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export const DatePicker: React.FC<DatePickerProps> = ({
  id = "",
  value,
  onChange,
  min,
  max,
  placeholder = "Select date",
  className,
  disabled = false,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      target: {
        id: id,
        value: e.target.value,
      },
    });
  };

  const handleIconClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.showPicker?.();
    }
  };

  // Format value for HTML5 date input
  const formatValue = (val: string | undefined) => {
    if (!val) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    try {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('Invalid date value:', val);
    }
    return "";
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="date"
        id={id}
        value={formatValue(value)}
        onChange={handleChange}
        min={min}
        max={max}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // Hide the native calendar icon
          "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer",
          className
        )}
      />
      {/* Custom calendar icon */}
      <div 
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      >
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </div>
      {/* Clickable area for the icon */}
      <button
        type="button"
        onClick={handleIconClick}
        disabled={disabled}
        className="absolute right-0 top-0 h-full w-10 flex items-center justify-center cursor-pointer hover:bg-transparent focus:outline-none"
        tabIndex={-1}
        aria-label="Open calendar"
      >
      </button>
    </div>
  )
}
