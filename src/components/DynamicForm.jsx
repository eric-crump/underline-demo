"use client";
import React, { useState } from 'react';
import { submitForm } from '@/utils/formApi';

/**
 * DynamicForm Component
 * Renders a form dynamically based on the Contentstack Form Builder configuration
 * 
 * @param {Object} props
 * @param {Object} props.formData - Form configuration from Contentstack
 * @param {string} props.formData.formId - Unique form ID
 * @param {Object} props.formData.formConfig - Form configuration object
 */
export default function DynamicForm({ formData }) {
  if (!formData || !formData.formConfig) {
    return null;
  }

  const { formId, formConfig } = formData;
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'success' | 'error'

  // Group fields by visualRow
  const fieldsByRow = formConfig.fields.reduce((acc, field) => {
    const row = field.visualRow || 1;
    if (!acc[row]) acc[row] = [];
    acc[row].push(field);
    return acc;
  }, {});

  const rows = Object.keys(fieldsByRow)
    .map(Number)
    .sort((a, b) => a - b);

  const handleChange = (field, value) => {
    const fieldName = field.mappedField || field.name || field.id;
    setFormValues(prev => ({ ...prev, [fieldName]: value }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const validateField = (field, value) => {
    const { validation, required, type } = field;

    // Required validation
    if (required && !value) {
      return `${field.label} is required`;
    }

    if (!value || !validation) return null;

    // Type-specific validation
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (type === 'tel') {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(value)) {
        return 'Please enter a valid phone number';
      }
    }

    // Min/Max validation
    if (validation.min !== undefined) {
      if (type === 'text' || type === 'textarea') {
        if (value.length < validation.min) {
          return `Minimum ${validation.min} characters required`;
        }
      } else if (type === 'number') {
        if (Number(value) < validation.min) {
          return `Minimum value is ${validation.min}`;
        }
      }
    }

    if (validation.max !== undefined) {
      if (type === 'text' || type === 'textarea') {
        if (value.length > validation.max) {
          return `Maximum ${validation.max} characters allowed`;
        }
      } else if (type === 'number') {
        if (Number(value) > validation.max) {
          return `Maximum value is ${validation.max}`;
        }
      }
    }

    // Pattern validation
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return 'Invalid format';
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields (except info fields which are just display-only)
    const newErrors = {};
    formConfig.fields.forEach(field => {
      // Skip validation for info fields
      if (field.type === 'info') return;

      const fieldName = field.mappedField || field.name || field.id;
      const value = formValues[fieldName];
      const error = validateField(field, value);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Process checkbox fields - flatten nested objects
    const processedData = { ...formValues };
    formConfig.fields.forEach(field => {
      if (field.type === 'checkbox') {
        const fieldName = field.mappedField || field.name || field.id;
        const checkboxValues = formValues[fieldName] || {};

        // If checkbox has options, expand them into individual fields
        if (field.options) {
          field.options.forEach(option => {
            const optionValue = checkboxValues[option.value] ?? option.defaultChecked ?? false;
            processedData[option.value] = optionValue;
          });
          // Remove the parent checkbox field
          delete processedData[fieldName];
        }
      }
    });

    // Submit form
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await submitForm(formId, processedData);
      setSubmitStatus('success');
      setFormValues({});
    } catch (error) {
      console.error('Form submission error:', error);

      // Check if it's a rate limit error
      if (error.message && error.message.includes('Too many')) {
        setSubmitStatus('rate-limit');
      } else {
        setSubmitStatus('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field) => {
    const fieldName = field.mappedField || field.name || field.id;
    const value = formValues[fieldName] || '';
    const error = errors[fieldName];

    const commonProps = {
      id: field.id,
      name: fieldName,
      required: field.required,
      placeholder: field.placeholder,
      className: `form-input ${error ? 'error' : ''}`,
      'aria-invalid': !!error,
      'aria-describedby': error ? `${field.id}-error` : undefined,
    };

    switch (field.type) {
      case 'info':
        // Info fields don't collect data, just display text
        return (
          <div className="info-text">
            {field.infoText}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
          >
            <option value="">-- Select --</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map((opt) => (
              <label key={opt.value} className="radio-label">
                <input
                  type="radio"
                  name={fieldName}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => handleChange(field, e.target.value)}
                  required={field.required}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="checkbox-group">
            {field.options?.map((opt) => {
              // For checkboxes, value is an object with boolean values
              const checkboxValues = formValues[fieldName] || {};
              const isChecked = checkboxValues[opt.value] ?? opt.defaultChecked ?? false;

              return (
                <label key={opt.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    name={`${fieldName}.${opt.value}`}
                    checked={isChecked}
                    onChange={(e) => {
                      const newCheckboxValues = {
                        ...checkboxValues,
                        [opt.value]: e.target.checked,
                      };
                      handleChange(field, newCheckboxValues);
                    }}
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        );

      case 'date':
        return (
          <div>
            <input
              {...commonProps}
              type="text"
              value={value}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={field.dateFormat || 'MM/DD/YYYY'}
            />
            {field.showDateFormatHelper && field.dateFormat && (
              <span className="field-helper">Format: {field.dateFormat}</span>
            )}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="dynamic-form-container">
      <div className="form-header">
        <h2>{formConfig.name}</h2>
        {formConfig.description && <p>{formConfig.description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="dynamic-form">
        {rows.map((rowNum) => (
          <div key={rowNum} className="form-row">
            {fieldsByRow[rowNum].map((field) => (
              <div
                key={field.id}
                className="form-field"
                style={{
                  gridColumn: `span ${field.columnSpan}`,
                }}
              >
                {/* Info fields show label as heading, other fields show as label */}
                {field.type === 'info' ? (
                  field.label && (
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {field.label}
                    </h3>
                  )
                ) : (
                  field.label && (
                    <label htmlFor={field.id} className="field-label">
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                  )
                )}

                {renderField(field)}

                {errors[field.mappedField || field.name || field.id] && (
                  <span
                    id={`${field.id}-error`}
                    className="field-error"
                    role="alert"
                  >
                    {errors[field.mappedField || field.name || field.id]}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}

        {submitStatus === 'success' && (
          <div className="alert alert-success" role="alert">
            {formConfig.submitConfig.successMessage || 'Form submitted successfully!'}
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="alert alert-error" role="alert">
            {formConfig.submitConfig.errorMessage || 'Something went wrong. Please try again.'}
          </div>
        )}

        {submitStatus === 'rate-limit' && (
          <div className="alert alert-error" role="alert">
            Too many form submissions. Please wait a few minutes before trying again.
          </div>
        )}

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Submitting...' : (formConfig.submitConfig?.buttonText || 'Submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

