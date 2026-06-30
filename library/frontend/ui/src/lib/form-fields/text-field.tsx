import { Field, Input, type InputProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface TextFieldProps extends InputProps {
    label: string;
    error?: string;
    helperText?: string;
    required?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({ label, error, helperText, required, ...inputProps }, ref) {
    return (
        <Field.Root invalid={!!error} required={required}>
            <Field.Label>
                {label}
                {required ? <Field.RequiredIndicator /> : null}
            </Field.Label>
            <Input ref={ref} {...inputProps} />
            {helperText && !error ? <Field.HelperText>{helperText}</Field.HelperText> : null}
            {error ? <Field.ErrorText>{error}</Field.ErrorText> : null}
        </Field.Root>
    );
});
