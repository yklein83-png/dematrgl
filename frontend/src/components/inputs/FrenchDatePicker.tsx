/**
 * FrenchDatePicker - DatePicker localisé en français
 * Utilise le format DD/MM/YYYY
 */

import React, { forwardRef } from 'react';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { TextFieldProps } from '@mui/material';

interface FrenchDatePickerProps
  extends Omit<DatePickerProps<Date>, 'value' | 'onChange'> {
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  textFieldProps?: Partial<TextFieldProps>;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

// Convertit une chaîne ISO ou Date en objet Date
const parseDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  // Essayer de parser la chaîne
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const FrenchDatePicker = forwardRef<HTMLInputElement, FrenchDatePickerProps>(
  (
    {
      value,
      onChange,
      textFieldProps = {},
      required = false,
      error = false,
      helperText,
      label,
      ...props
    },
    ref
  ) => {
    const dateValue = parseDate(value);

    const handleChange = (newDate: Date | null) => {
      if (onChange) {
        onChange(newDate);
      }
    };

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
        <DatePicker
          value={dateValue}
          onChange={handleChange}
          label={label}
          format="dd/MM/yyyy"
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              required,
              error,
              helperText,
              inputRef: ref,
              ...textFieldProps,
            },
          }}
          {...props}
        />
      </LocalizationProvider>
    );
  }
);

FrenchDatePicker.displayName = 'FrenchDatePicker';

export default FrenchDatePicker;
