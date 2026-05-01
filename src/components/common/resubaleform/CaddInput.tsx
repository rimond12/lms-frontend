"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils"; // If using classNames utility
import { IInput } from "@/lib/types";
import { Input } from "@/components/ui/Input";

export default function CaddInput({
  variant = "bordered",
  size = "md",
  required = false,
  type = "text",
  label,
  name,
  disabled = false,
  placeholder,
  className,
  labelClassName,
}: IInput & { className?: string; labelClassName?: string }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className={cn("text-sm font-medium text-gray-700", labelClassName)}
        >
          {label}
        </label>
      )}
      <Input
        {...register(name)}
        id={name}
        type={type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn(
          "border rounded-md p-2 focus:outline-none",
          errorMessage ? "border-red-800" : "border-gray-300",
          className,
        )}
      />
      {errorMessage && (
        <span className="text-red-800 text-xs">{errorMessage}</span>
      )}
    </div>
  );
}
