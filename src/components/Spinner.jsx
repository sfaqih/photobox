import React from 'react';
import clsx from 'clsx';

const Spinner = ({
  label = 'Loading...',
  children,
  overlay = false,
  size = 8,
  className = '',
  bgColor = 'bg-white/70', // default semi-transparent white
}) => {
  const spinner = (
    <div className={clsx(
      'flex flex-col items-center justify-center p-4 rounded-md shadow-md',
      bgColor
    )}>
      <div
        className={clsx(
          'animate-spin rounded-full border-t-4 border-b-4 border-blue-500',
          `w-${size} h-${size}`
        )}
      />
      {label && <p className="mt-2 text-sm text-gray-700">{label}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 flex items-center justify-center z-50">
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      {spinner}
      {children}
    </div>
  );
};

export default Spinner;
