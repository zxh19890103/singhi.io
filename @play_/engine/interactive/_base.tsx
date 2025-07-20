import React from "react";

export interface BaseInputProps<T> {
  value?: T;
  onChange?: (value: T) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
}

export function withBaseInput<T>(
  Component: React.ComponentType<BaseInputProps<T>>,
) {
  return (props: BaseInputProps<T>) => {
    const { label, disabled, value, onChange, ...rest } = props;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-bold text-pink-600 px-1">
            {label}
          </label>
        )}
        <div className="rounded-2xl border-2 border-pink-300 bg-pink-50 p-2 shadow-sm hover:shadow-md transition-shadow">
          <Component
            {...(rest as any)}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>
    );
  };
}
