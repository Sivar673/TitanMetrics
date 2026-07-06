import React from 'react';
import { TextInput } from 'react-native';

interface NumericFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  allowDecimal?: boolean;
  maxLength?: number;
  compact?: boolean; // tight variant for set-row grids
}

export function sanitizeNumeric(raw: string, allowDecimal: boolean): string {
  const cleaned = raw.replace(allowDecimal ? /[^0-9.]/g : /[^0-9]/g, '');
  const parts = cleaned.split('.');
  return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
}

export function NumericField({
  value,
  onChangeText,
  placeholder,
  allowDecimal = true,
  maxLength = 6,
  compact = false,
}: NumericFieldProps) {
  return (
    <TextInput
      className={
        compact
          ? 'rounded-lg bg-zinc-800 px-2 py-2 text-center text-base text-zinc-50'
          : 'rounded-xl bg-zinc-800 px-3 py-3 text-lg text-zinc-50'
      }
      value={value}
      onChangeText={(raw) => onChangeText(sanitizeNumeric(raw, allowDecimal))}
      placeholder={placeholder}
      placeholderTextColor="#52525b"
      keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
      maxLength={maxLength}
      selectTextOnFocus
    />
  );
}
