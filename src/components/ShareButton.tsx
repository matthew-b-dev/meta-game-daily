import React from 'react';
import { ShareIcon } from '@heroicons/react/24/outline';

interface ShareButtonProps {
  userPercentile: number | null;
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
  onCopyToShare: () => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  userPercentile,
  showConfirm,
  setShowConfirm,
  onCopyToShare,
}) => {
  const handleShareClick = () => {
    // Show confirmation if user has worst score (0th percentile)
    if (userPercentile === 0 && !showConfirm) {
      setShowConfirm(true);
    } else {
      onCopyToShare();
      setShowConfirm(false);
    }
  };

  const handleCancelShare = () => {
    setShowConfirm(false);
  };

  if (!showConfirm) {
    return (
      <button
        className='w-full px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white text-sm font-semibold flex items-center justify-center gap-2'
        onClick={handleShareClick}
      >
        Copy to Share
        <ShareIcon className='w-5 h-5' />
      </button>
    );
  }

  return (
    <div className='space-y-2'>
      <p className='text-center text-xs text-yellow-400 font-semibold'>
        Please confirm you want to share the worst score today.
      </p>
      <div className='flex gap-2'>
        <button
          className='flex-1 px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-white text-xs font-semibold'
          onClick={handleShareClick}
        >
          I understand this will look bad for me
        </button>
        <button
          className='flex-1 px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold'
          onClick={handleCancelShare}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ShareButton;
