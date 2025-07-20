import React, { createContext, useContext, useState } from "react";
import { type BaseInputProps } from "./_base.js";
import type { JSX } from "react/jsx-runtime";

interface FormContextType {
  values: Record<string, any>;
  setValue: (name: string, value: any) => void;
}

const FormContext = createContext<FormContextType | null>(null);

export const useFormContext = () => {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("FormContext not found");
  return ctx;
};

export const FormProvider = (props: {
  children: React.ReactNode;
  value?: Record<string, any>;
  onChange?: (newValue: Record<string, any>) => void;
}) => {
  const setValue = (name: string, value: any) => {
    props.onChange?.({ ...props.value, [name]: value });
  };

  return (
    <FormContext.Provider value={{ values: props.value, setValue }}>
      {props.children}
    </FormContext.Provider>
  );
};

interface FormItemProps<T> {
  name: string;
  children: JSX.Element;
  label?: string;
  disabled?: boolean;
}

export function FormItem<T>(props: FormItemProps<T>) {
  const { values, setValue } = useFormContext();

  const { name, children, label, ...rest } = props;

  return (
    <children.type
      value={values[name]}
      onChange={(val: T) => setValue(name, val)}
      label={label}
      name={name}
      {...rest}
    />
  );
}

type FormValues = Record<string, any>;

export function Form(
  props: React.PropsWithChildren<{
    values: FormValues;
    onChange: (newValues: FormValues) => void;
  }>,
) {
  return (
    <FormProvider value={props.values} onChange={props.onChange}>
      <form>{props.children}</form>
    </FormProvider>
  );
}
