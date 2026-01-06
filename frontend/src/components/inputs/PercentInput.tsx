/**
 * PercentInput - Champ de saisie pourcentage avec symbole %
 * Limite automatiquement entre 0 et 100
 */

import React, { forwardRef, useState, useEffect } from 'react';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';

interface PercentInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value?: number | string | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  allowDecimals?: boolean;
}

const PercentInput = forwardRef<HTMLInputElement, PercentInputProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = 100,
      allowDecimals = true,
      helperText,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState('');

    // Synchroniser avec la prop value
    useEffect(() => {
      if (value === null || value === undefined || value === '') {
        setDisplayValue('');
      } else {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(numValue)) {
          setDisplayValue(allowDecimals ? numValue.toString() : Math.round(numValue).toString());
        }
      }
    }, [value, allowDecimals]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      // Autoriser chiffres et point/virgule si décimales autorisées
      const pattern = allowDecimals ? /[^\d.,]/g : /[^\d]/g;
      let cleaned = input.replace(pattern, '');

      // Remplacer virgule par point
      cleaned = cleaned.replace(',', '.');

      // Empêcher plusieurs points
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
      }

      setDisplayValue(cleaned);

      // Parser et envoyer au parent
      if (onChange) {
        if (cleaned === '' || cleaned === '.') {
          onChange(null);
        } else {
          let numValue = parseFloat(cleaned);
          if (!isNaN(numValue)) {
            // Appliquer les contraintes
            numValue = Math.max(min, Math.min(max, numValue));
            onChange(numValue);
          }
        }
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Reformater proprement au blur
      if (displayValue && displayValue !== '.') {
        let numValue = parseFloat(displayValue);
        if (!isNaN(numValue)) {
          // Appliquer les contraintes
          numValue = Math.max(min, Math.min(max, numValue));
          setDisplayValue(allowDecimals ? numValue.toString() : Math.round(numValue).toString());
        }
      }

      // Appeler le onBlur parent si présent
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

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
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
        }}
        inputProps={{
          min,
          max,
        }}
        {...props}
      />
    );
  }
);

PercentInput.displayName = 'PercentInput';

export default PercentInput;
