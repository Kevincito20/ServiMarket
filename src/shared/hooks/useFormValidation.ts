import { useState } from 'react';

type Rules<T> = {
  [K in keyof T]?: (value: T[K]) => string | undefined;
};

type Errors<T> = Partial<Record<keyof T, string>>;

export const useFormValidation = <T extends Record<string, unknown>>(
  initialValues: T,
  rules: Rules<T>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Errors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (touched[key] && rules[key]) {
      const error = rules[key]!(value);
      setErrors((prev) => ({ ...prev, [key]: error }));
    }
  };

  const touch = (key: keyof T) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    if (rules[key]) {
      const error = rules[key]!(values[key]);
      setErrors((prev) => ({ ...prev, [key]: error }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Errors<T> = {};
    let isValid = true;

    for (const key in rules) {
      const rule = rules[key];
      if (rule) {
        const error = rule(values[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    setTouched(Object.keys(rules).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return { values, errors, setValue, touch, validate, reset };
};