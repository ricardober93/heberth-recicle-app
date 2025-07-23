import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const Card = ({ title, children, footer, className = '' }: CardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="bg-green-600 text-white px-4 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;