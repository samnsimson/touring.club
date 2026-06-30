import { Field, Textarea, type TextareaProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface TextareaFieldProps extends TextareaProps {
    label: string;
    error?: string;
    helperText?: string;
    required?: boolean;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(
    { label, error, helperText, required, ...textareaProps },
    ref,
) {
    return (
        <Field.Root invalid={!!error} required={required}>
            <Field.Label>
                {label}
                {required ? <Field.RequiredIndicator /> : null}
            </Field.Label>
            <Textarea ref={ref} {...textareaProps} />
            {helperText && !error ? <Field.HelperText>{helperText}</Field.HelperText> : null}
            {error ? <Field.ErrorText>{error}</Field.ErrorText> : null}
        </Field.Root>
    );
});
