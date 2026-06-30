import { Field, Wrap, Button } from '@chakra-ui/react';

export interface ChipToggleGroupProps {
    label: string;
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
    error?: string;
}

export function ChipToggleGroup({ label, options, value, onChange, error }: ChipToggleGroupProps) {
    function toggle(option: string) {
        if (value.includes(option)) {
            onChange(value.filter((item) => item !== option));
        } else {
            onChange([...value, option]);
        }
    }

    return (
        <Field.Root invalid={!!error}>
            <Field.Label>{label}</Field.Label>
            <Wrap gap="2">
                {options.map((option) => {
                    const selected = value.includes(option);
                    return (
                        <Button
                            key={option}
                            type="button"
                            size="sm"
                            borderRadius="full"
                            variant={selected ? 'solid' : 'outline'}
                            colorPalette={selected ? 'orange' : 'gray'}
                            onClick={() => toggle(option)}
                        >
                            {option}
                        </Button>
                    );
                })}
            </Wrap>
            {error ? <Field.ErrorText>{error}</Field.ErrorText> : null}
        </Field.Root>
    );
}
