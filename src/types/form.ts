// Field option for select, radio, and checkbox fields
export interface FieldOption {
  label: string;
  value: string;
  defaultChecked?: boolean; // For checkbox fields only
}

// Validation rules
export interface ValidationRules {
  min?: number;      // Min length for text, min value for number, min date
  max?: number;      // Max length for text, max value for number, max date
  pattern?: string;  // Regex pattern for text validation
}

// Individual form field
export interface FormField {
  id: string;
  name?: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'info';
  label: string;
  placeholder?: string;
  required?: boolean;
  columnSpan: number;        // 1-12 (based on 12-column grid)
  visualRow: number;         // Row number for layout
  mappedField?: string;      // Field name in web service/database
  options?: FieldOption[];   // For select, radio, checkbox
  validation?: ValidationRules;
  dateFormat?: string;       // For date fields (e.g., "MM/DD/YYYY")
  showDateFormatHelper?: boolean; // Show format hint below date field
  infoText?: string;         // For info fields - the informational text to display
}

// Submit configuration
export interface SubmitConfig {
  webServiceId: string;
  webServiceName?: string;
  successMessage?: string;
  errorMessage?: string;
  buttonText?: string;
}

// Complete form configuration
export interface FormConfig {
  name: string;
  description?: string;
  fields: FormField[];
  submitConfig: SubmitConfig;
  createdAt?: string;
  updatedAt?: string;
}

// What Contentstack saves
export interface FormFieldData {
  formId: string;
  formName: string;
  formDescription?: string;
  formConfig: FormConfig;
}

