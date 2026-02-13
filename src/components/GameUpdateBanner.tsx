import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface GameUpdateBannerProps {
  date: string; // Display date like "Feb 13, 2026"
  children: React.ReactNode;
  onDismiss: () => void;
}

const GameUpdateBanner: React.FC<GameUpdateBannerProps> = ({
  date,
  children,
  onDismiss,
}) => {
  return (
    <div className='mb-4 bg-blue-900/30 border border-blue-700/50 rounded-lg overflow-hidden flex flex-col'>
      {/* Date section - full width helmet with date and close button */}
      <div className='bg-blue-900/50 px-4 py-2 flex items-center justify-between border-b border-blue-700/50'>
        <span className='text-sm font-semibold text-blue-200'>{date}</span>
        <button
          onClick={onDismiss}
          className='text-blue-200 hover:text-white transition-colors px-3 py-1 -mr-3'
          aria-label='Dismiss banner'
        >
          <XMarkIcon className='w-5 h-5' />
        </button>
      </div>

      {/* Content section */}
      <div className='px-4 py-3'>{children}</div>
    </div>
  );
};

export default GameUpdateBanner;
