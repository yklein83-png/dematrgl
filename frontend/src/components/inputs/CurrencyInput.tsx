/**
 * CurrencyInput - Champ de saisie monétaire avec symbole €
 * Affiche le montant formaté avec séparateurs de milliers
 */

import React, { forwardRef, useState, useEffect } from 'react';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';

interface CurrencyInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value?: number | string | null;
  onChange?: (value: number | null) => void;
  currency?: string;
  min?: number;
  max?: number;
  suffix?: string; // Ex: "/mois", "/an"
}

// Formate un nombre avec séparateurs de milliers (espace en français)
const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '';
  return value.toLocaleString('fr-FR');
};

// Parse une chaîne formatée en nombre
const parseFormattedNumber = (value: string): number | null => {
  if (!value || value.trim() === '') return null;
  // Enlever espaces et remplacer virgule par point
  const cleaned = value.replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      currency = '€',
      min = 0,
      max,
      suffix = '',
      helperText,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState('');

    // Synchroniser avec la prop value
    useEffect(() => {
      const numValue = typeof value === 'string' ? parseFormattedNumber(value) : value;
      setDisplayValue(formatNumber(numValue as number));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      // Autoriser chiffres, espaces, virgule, point
      const cleaned = input.replace(/[^\d\s,.-]/g, '');
      setDisplayValue(cleaned);

      // Parser et envoyer au parent
      const numValue = parseFormattedNumber(cleaned);

      if (onChange) {
        // Appliquer les contraintes min/max
        if (numValue !== null) {
          let constrainedValue = numValue;
          if (min !== undefined && numValue < min) constrainedValue = min;
          if (max !== undefined && numValue > max) constrainedValue = max;
          onChange(constrainedValue);
        } else {
          onChange(null);
        }
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Reformater proprement au blur
      const numValue = parseFormattedNumber(displayValue);
      setDisplayValue(formatNumber(numValue));

      // Appeler le onBlur parent si présent
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    const adornmentText = suffix ? `${currency}${suffix}` : currency;

    return (
      <TextField
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="0"
        helperText={helperText}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">{adornmentText}</InputAdornment>
          ),
        }}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
