import { Field, NativeSelect } from '@chakra-ui/react';
import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectFieldOption {
    label: string;
    value: string;
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: SelectFieldOption[];
    error?: string;
    required?: boolean;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField({ label, options, error, required, ...selectProps }, ref) {
    return (
        <Field.Root invalid={!!error} required={required}>
            <Field.Label>
                {label}
                {required ? <Field.RequiredIndicator /> : null}
            </Field.Label>
            <NativeSelect.Root>
                <NativeSelect.Field ref={ref} {...selectProps}>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
            </NativeSelect.Root>
            {error ? <Field.ErrorText>{error}</Field.ErrorText> : null}
        </Field.Root>
    );
});
