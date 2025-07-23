import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor={props.id}>
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border text-gray-700  ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;