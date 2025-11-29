export type CalculatorCategory = 
  | 'General'
  | 'Cardiology' 
  | 'Nephrology' 
  | 'Emergency' 
  | 'Neurology' 
  | 'Hepatology' 
  | 'Gastroenterology'
  | 'Pulmonology'
  | 'Endocrinology'
  | 'Hematology'
  | 'Pediatrics'
  | 'Obstetrics'
  | 'Trauma'
  | 'Critical Care'
  | 'Infectious Disease'
  | 'Oncology'
  | 'Surgery';

export type InputType = 'number' | 'select' | 'boolean' | 'multiselect';

export interface SelectOption {
  label: string;
  value: number | string;
  description?: string;
}

export interface CalculatorInput {
  id: string;
  label: string;
  type: InputType;
  options?: SelectOption[]; // For select type
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  defaultValue?: number | string | boolean;
  step?: number;
  info?: string; // Tooltip info
}

export interface CalculationResult {
  value: number | string;
  unit?: string;
  severity?: 'normal' | 'warning' | 'critical' | 'info';
  interpretation?: string;
  details?: string[]; // Bullet points of logic explanation
}

export interface Calculator {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  category: CalculatorCategory;
  inputs: CalculatorInput[];
  calculate: (values: Record<string, any>) => CalculationResult;
  references?: string[];
}