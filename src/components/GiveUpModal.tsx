import React from 'react';

interface GiveUpModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const GiveUpModal: React.FC<GiveUpModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80'
      onClick={onClose}
    >
      <div
        className='bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className='text-xl font-bold text-center mb-4'>Are you sure?</h2>
        <p className='text-center text-gray-300 mb-6'>
          Don't worry. You'll still receive points for the games you correctly
          guessed.
        </p>
        <div className='flex gap-3'>
          <button
            className='flex-1 px-4 py-2 rounded bg-red-700 hover:bg-red-600 text-white text-sm font-semibold'
            onClick={onConfirm}
          >
            Give Up
          </button>
          <button
            className='flex-1 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold'
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiveUpModal;
