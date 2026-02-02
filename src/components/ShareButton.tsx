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
    onCopyToShare();
  };

  return (
    <button
      className='w-full px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50'
      onClick={handleShareClick}
      disabled={isLoading}
    >
      <DocumentDuplicateIcon className='w-5 h-5' />
      {isLoading ? 'Loading scores...' : 'Copy for Sharing'}
    </button>
  );
};

export default ShareButton;
