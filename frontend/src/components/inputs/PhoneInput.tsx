/**
 * PhoneInput - Champ de saisie téléphone avec format Polynésie Française
 * Format: +689 XX XX XX XX
 */

import React, { forwardRef, useState, useEffect } from 'react';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';
import { Phone as PhoneIcon } from '@mui/icons-material';

interface PhoneInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  showIcon?: boolean;
}

// Formate le numéro pour l'affichage: +689 87 12 34 56
const formatPhoneDisplay = (value: string): string => {
  if (!value) return '';

  // Nettoyer (garder uniquement chiffres)
  const digits = value.replace(/\D/g, '');

  // Si commence par 689, ajouter le +
  if (digits.startsWith('689') && digits.length <= 11) {
    const local = digits.slice(3); // Enlever 689
    return formatLocalNumber(local, true);
  }

  // Numéro local (8 chiffres)
  if (digits.length <= 8) {
    return formatLocalNumber(digits, false);
  }

  return value;
};

// Formate un numéro local avec espaces
const formatLocalNumber = (digits: string, withPrefix: boolean): string => {
  const parts: string[] = [];

  if (withPrefix) {
    parts.push('+689');
  }

  // Grouper par 2 chiffres: XX XX XX XX
  for (let i = 0; i < digits.length && i < 8; i += 2) {
    parts.push(digits.slice(i, i + 2));
  }

  return parts.join(' ');
};

// Nettoie pour stockage: +68987123456
const cleanPhoneForStorage = (value: string): string => {
  const digits = value.replace(/\D/g, '');

  // Si 8 chiffres locaux, ajouter +689
  if (digits.length === 8 && !digits.startsWith('689')) {
    return `+689${digits}`;
  }

  // Si commence par 689, ajouter +
  if (digits.startsWith('689')) {
    return `+${digits}`;
  }

  return digits ? `+${digits}` : '';
};

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, showIcon = true, helperText, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    // Synchroniser la valeur affichée avec la prop value
    useEffect(() => {
      setDisplayValue(formatPhoneDisplay(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      // Autoriser uniquement chiffres, +, espaces
      const cleaned = input.replace(/[^\d\s+]/g, '');

      // Formater pour affichage
      const formatted = formatPhoneDisplay(cleaned);
      setDisplayValue(formatted);

      // Envoyer la valeur nettoyée au parent
      if (onChange) {
        onChange(cleanPhoneForStorage(cleaned));
      }
    };

    return (
      <TextField
        ref={ref}
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder="+689 87 XX XX XX"
        helperText={helperText || "Format Polynésie: +689 XX XX XX XX"}
        InputProps={{
          startAdornment: showIcon ? (
            <InputAdornment position="start">
              <PhoneIcon fontSize="small" color="action" />
            </InputAdornment>
          ) : undefined,
        }}
        inputProps={{
          maxLength: 17, // +689 XX XX XX XX = 17 chars
        }}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
