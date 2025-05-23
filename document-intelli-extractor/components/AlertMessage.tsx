
import React from 'react';

interface AlertMessageProps {
  message: string | null;
  type?: 'error' | 'success' | 'info';
}

const AlertMessage: React.FC<AlertMessageProps> = ({ message, type = 'error' }) => {
  if (!message) {
    return null;
  }

  let bgColor = 'bg-red-100 border-red-400 text-red-700';
  if (type === 'success') {
    bgColor = 'bg-green-100 border-green-400 text-green-700';
  } else if (type === 'info') {
    bgColor = 'bg-blue-100 border-blue-400 text-blue-700';
  }

  return (
    <div className={`border-l-4 p-4 my-4 ${bgColor}`} role="alert">
      <p className="font-bold">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
      <p>{message}</p>
    </div>
  );
};

export default AlertMessage;
