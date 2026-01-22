import React, { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface ResetPuzzleButtonProps {
  onResetPuzzle: () => void;
}

const ResetPuzzleButton: React.FC<ResetPuzzleButtonProps> = ({
  onResetPuzzle,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!showConfirm) {
    return (
      <button
        className='text-red-500 hover:text-red-400 text-sm underline cursor-pointer focus:outline-none !border-transparent flex items-center gap-1'
        onClick={() => setShowConfirm(true)}
      >
        <ArrowPathIcon className='w-4 h-4 -scale-x-100' />
        Reset today's puzzle
      </button>
    );
  }

  return (
    <div className='flex flex-col items-center gap-2'>
      <span className='text-sm text-gray-300'>
        Are you sure you want to reset today's puzzle?
      </span>
      <div className='flex gap-2'>
        <button
          className='px-4 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1'
          onClick={() => {
            setShowConfirm(false);
            onResetPuzzle();
          }}
        >
          <ArrowPathIcon className='w-4 h-4 -scale-x-100' />
          Confirm Reset
        </button>
        <button
          className='px-4 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold'
          onClick={() => setShowConfirm(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ResetPuzzleButton;
