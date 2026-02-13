import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { PlusIcon } from '@heroicons/react/16/solid';

interface GameUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameUpdateModal: React.FC<GameUpdateModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className='bg-zinc-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-zinc-700'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex justify-between items-start mb-4'>
              <h2 className='text-2xl font-bold text-white'>
                Game Balancing Update - February 13, 2026
              </h2>
              <button
                onClick={onClose}
                className='text-zinc-400 hover:text-white transition-colors'
                aria-label='Close modal'
              >
                <XMarkIcon className='w-6 h-6' />
              </button>
            </div>

            {/* Content */}
            <div className='space-y-4 text-zinc-200'>
              <div>
                <h3 className='text-md font-semibold text-white mb-2'>
                  First, thanks!
                </h3>
                <div className='mb-4'>
                  This game has grown by about 10x in the last week or so and
                  I'm very grateful for everyone sharing this. I've recieved a
                  lot of feedback and hopefully have addressed most of that in
                  this update.
                </div>
                <hr className='h-[1px] bg-gray-700 border-none mb-3' />
                <h3 className='text-md font-semibold text-white mb-2'>
                  Update Info
                </h3>
                <ul className='list-disc pl-5 space-y-2 text-sm'>
                  <li>
                    <strong>More Game Details/Genres:</strong> The
                    "Details/Genres" information for games has been{' '}
                    <b>significantly</b> expanded and improved to provide more
                    helpful context.
                  </li>
                  <li>
                    <strong>Adjusted Reveal Costs:</strong> To reflect the
                    information update:
                    <ul className='list-disc pl-5 mt-1'>
                      <li>Screenshot reveal cost increased to 65</li>
                      <li>
                        Details/Genres are now grouped, revealed for 35 points
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Free Reveals Introduced:</strong> Some (usually
                    lesser-known) games now include a "free" reveal that doesn't
                    cost any points. Games with free reveals are marked with a{' '}
                    <span className='pr-1.5 pl-[2px] py-0.5 rounded bg-green-700 text-white text-xs inline-flex items-center font-semibold gap-0.5'>
                      <PlusIcon className='w-4 h-4' />
                      <span>Free</span>
                    </span>{' '}
                    badge.
                  </li>
                  <li>
                    <strong>Improved Game Selection:</strong> Lesser-known games
                    will appear more frequently in daily puzzles, typically with
                    a free reveal. This should hopefully resolve the problem
                    where if you didn't know the developer you were kind of
                    screwed.
                  </li>
                </ul>
              </div>
              <div className='pt-4 border-t border-zinc-700'>
                <button
                  onClick={onClose}
                  className='w-full px-4 py-2 rounded bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold'
                >
                  Got it! 👍
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameUpdateModal;
