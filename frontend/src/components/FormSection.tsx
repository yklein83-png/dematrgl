/**
 * Section de formulaire réutilisable
 * Gère l'affichage des champs avec grid
 */

import React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Typography,
  Divider,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Control, Controller } from 'react-hook-form';

interface FormSectionProps {
  title: string;
  fields: FormFieldConfig[];
  control: Control<any>;
  errors: any;
  columns?: number;
}

interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  xs?: number;
  sm?: number;
  md?: number;
}

export default function FormSection({
  title,
  fields,
  control,
  errors,
  columns = 2,
}: FormSectionProps) {
  const renderField = (field: FormFieldConfig) => {
    return (
      <Controller
        key={field.name}
        name={field.name}
        control={control}
        rules={{ required: field.required ? `${field.label} est requis` : false }}
        render={({ field: controllerField }) => {
          switch (field.type) {
            case 'checkbox':
              return (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...controllerField}
                      checked={controllerField.value || false}
                      disabled={field.disabled}
                    />
                  }
                  label={field.label}
                />
              );

            case 'select':
              return (
                <FormControl fullWidth error={!!errors[field.name]} size="small">
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    {...controllerField}
                    label={field.label}
                    disabled={field.disabled}
                  >
                    {field.options?.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[field.name] && (
                    <FormHelperText>{errors[field.name]?.message}</FormHelperText>
                  )}
                </FormControl>
              );

            case 'date':
              return (
                <DatePicker
                  label={field.label}
                  value={controllerField.value || null}
                  onChange={(date) => controllerField.onChange(date)}
                  disabled={field.disabled}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: !!errors[field.name],
                      helperText: errors[field.name]?.message,
                    },
                  }}
                />
              );

            case 'textarea':
              return (
                <TextField
                  {...controllerField}
                  label={field.label}
                  placeholder={field.placeholder}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]?.message || field.helperText}
                  disabled={field.disabled}
                  multiline
                  rows={field.rows || 4}
                  size="small"
                  fullWidth
                />
              );

            default:
              return (
                <TextField
                  {...controllerField}
                  type={field.type}
                  label={field.label}
                  placeholder={field.placeholder}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]?.message || field.helperText}
                  disabled={field.disabled}
                  size="small"
                  fullWidth
                />
              );
          }
        }}
      />
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid 
            key={field.name}
            item 
            xs={field.xs || 12} 
            sm={field.sm || (12 / columns)} 
            md={field.md || (12 / columns)}
          >
            {renderField(field)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}