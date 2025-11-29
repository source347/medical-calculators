import React from 'react';
import { CalculatorInput as InputDef } from '../types';
import { Info } from 'lucide-react';

interface Props {
  definition: InputDef;
  value: any;
  onChange: (value: any) => void;
}

export const CalculatorInput: React.FC<Props> = ({ definition, value, onChange }) => {
  const { id, label, type, options, unit, min, max, info, placeholder } = definition;

  const renderInput = () => {
    switch (type) {
      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              id={id}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 py-3 px-4 pr-12 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-lg transition-all"
              placeholder={placeholder || '0'}
              min={min}
              max={max}
            />
            {unit && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">{unit}</span>
              </div>
            )}
          </div>
        );
      
      case 'select':
        return (
          <select
            id={id}
            value={value}
            onChange={(e) => {
              // Handle numeric values in selects if necessary
              const val = options?.find(o => String(o.value) === e.target.value)?.value;
              onChange(val);
            }}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 py-3 px-4 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-lg transition-all"
          >
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <div className="flex items-center justify-between py-3 cursor-pointer group" onClick={() => onChange(!value)}>
            <span className="text-base text-gray-700 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{label}</span>
            <div className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`mb-5 ${type === 'boolean' ? 'border-b border-gray-100 dark:border-gray-700 pb-2' : ''}`}>
      {type !== 'boolean' && (
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={id} className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
            {label}
          </label>
          {info && (
            <div className="group relative flex items-center cursor-help">
                <Info className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors" />
                <div className="absolute right-0 bottom-6 w-56 p-2 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-lg">
                    {info}
                </div>
            </div>
          )}
        </div>
      )}
      {renderInput()}
    </div>
  );
};