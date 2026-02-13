import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import GameUpdateModal from './GameUpdateModal';

interface Feb2026BalancingBannerProps {
  onDismiss?: () => void;
}

const Feb2026BalancingBanner: React.FC<Feb2026BalancingBannerProps> = ({
  onDismiss,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className='text-sm text-zinc-200'>
        <div className='mb-2 flex flex-col sm:flex-row sm:items-center gap-2'>
          <span>Major balancing update</span>
          <button
            onClick={() => setShowModal(true)}
            className='px-2 py-2 sm:py-1 rounded bg-transparent border border-blue-700/50 hover:bg-blue-700/10 text-blue-200 text-xs font-semibold transition-colors whitespace-nowrap self-start'
          >
            Full Details
          </button>
        </div>
        <div>
          <strong>TLDR:</strong> Genre/Game Details information has been{' '}
          <b>significantly</b> expanded. The concept of "Free" reveals has been
          introduced. Games that are lesser-known will appear much more often,
          typically with a free reveal.
        </div>
        <div className='mt-2'>
          <span>Thank you ❤️</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className='mt-2 px-2 py-1 rounded bg-transparent border-0 sm:border sm:border-blue-700/50 hover:bg-blue-700/10 text-blue-200 text-xs font-semibold transition-colors whitespace-nowrap flex items-center justify-center gap-1 w-full sm:w-auto'
          >
            <XMarkIcon className='w-3 h-3' />
            Dismiss
          </button>
        )}
      </div>
      <GameUpdateModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default Feb2026BalancingBanner;
