import React from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface ShareButtonProps {
  userPercentile: number | null;
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
  onCopyToShare: () => void;
  isLoading?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  userPercentile,
  showConfirm,
  setShowConfirm,
  onCopyToShare,
  isLoading = false,
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
        className='w-full px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50'
        onClick={handleShareClick}
        disabled={isLoading}
      >
        <DocumentDuplicateIcon className='w-5 h-5' />
        {isLoading ? 'Loading scores...' : 'Copy to Clipboard'}
      </button>
    );
  }

  return (
    <motion.div
      className='space-y-2'
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <p className='text-center text-xs text-yellow-400 font-semibold'>
        Please confirm you want to share the worst score today.
      </p>
      <div className='flex gap-2'>
        <button
          className='flex-1 px-2 py-2 rounded bg-red-700 hover:bg-red-600 text-white text-xs font-semibold'
          onClick={handleShareClick}
        >
          People need to know
        </button>
        <button
          className='flex-1 px-2 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold'
          onClick={handleCancelShare}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
};

export default ShareButton;
