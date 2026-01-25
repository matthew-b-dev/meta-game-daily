import { PlusIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { motion } from 'framer-motion';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80'
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className='bg-zinc-900 rounded-lg p-8 max-w-md w-full mx-4'
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className='text-2xl font-bold text-center mb-6'>How to play</h2>
        <ul className='space-y-3 mb-6 text-left list-disc pl-6 text-sm'>
          <li>
            The goal of this daily puzzle is to{' '}
            <b>guess the name of all 5 games</b>. You are provided with some
            up-front information: Release year and Developer(s).
          </li>
          <li>
            You can submit a guess for any game at any time.{' '}
            <b>You have 10 total guesses</b>.
          </li>
          <li>
            If you need more information about a game, expand it with the{' '}
            <div className='p-1 rounded bg-gray-700 inline h-6 relative bottom-[-2px]'>
              <PlusIcon className='w-5 h-5 inline relative top-[-2px]' />
            </div>{' '}
            button. <b>Revealing information will deduct points</b> from your
            total score.
          </li>
          <li>
            The game is complete when either all games have been revealed or all
            guesses have been exhausted.
          </li>
          <li>
            You can read more detailed information on the{' '}
            <a
              href='https://github.com/matthew-b-dev/meta-game-daily'
              target='_blank'
              rel='noopener noreferrer'
              className='text-yellow-500 underline hover:text-yellow-400'
            >
              GitHub page
            </a>
            .
          </li>
        </ul>
        <button
          className='w-full px-4 py-2 rounded bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold'
          onClick={onClose}
        >
          Got it! 👍
        </button>
      </motion.div>
    </motion.div>
  );
};

export default HelpModal;
