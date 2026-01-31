import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import { getSubtitle, getUtcDateString } from './utils';
import GuessingGame from './GuessingGame';
import ShuffleGame from './ShuffleGame';
import HelpModal from './components/HelpModal';

const App = () => {
  const subtitle = getSubtitle();
  const [showHelp, setShowHelp] = useState(false);

  const dateString = getUtcDateString();
  const date = new Date(dateString + 'T00:00:00Z');
  const isShuffleGame = date.getUTCDay() === 0;

  console.log(
    'Date string:',
    dateString,
    'isShuffleGame:',
    isShuffleGame,
    'UTC Day:',
    date.getUTCDay(),
  );

  return (
    <div className='min-h-screen bg-zinc-900 w-full flex flex-col min-h-screen diagonal-pattern-bg'>
      <Toaster position='top-center' />
      <div className='flex flex-col items-center w-full px-1 sm:px-4 flex-1'>
        <div className='w-full max-w-[750px] p-2 sm:p-6'>
          <div className='relative mb-6'>
            <div className='text-center'>
              <h1
                className='text-2xl sm:text-4xl font-black'
                style={{
                  fontFamily: 'Playfair Display, serif',
                  letterSpacing: '0.02em',
                }}
              >
                MetaGameDaily
              </h1>
              <p className='text-gray-400 text-sm mt-1'>
                A daily <i>Video Games Industry</i> puzzle
              </p>
              {subtitle.animated ? (
                <motion.p
                  className='text-gray-400 text-sm mt-1'
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: [0, -8, 8, -8, 8, -5, 5, 0],
                  }}
                  transition={{
                    duration: 1,
                    ease: 'easeOut',
                    x: {
                      duration: 0.5,
                      ease: 'easeInOut',
                      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
                    },
                  }}
                >
                  {subtitle.content}
                </motion.p>
              ) : (
                <p className='text-gray-400 text-sm mt-1'>{subtitle.content}</p>
              )}
            </div>
            <button
              className='absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-1 px-2'
              onClick={() => setShowHelp(true)}
            >
              <QuestionMarkCircleIcon className='w-8 h-8' />
              <span className='text-sm font-semibold hidden sm:inline'>
                How to play
              </span>
            </button>
          </div>
          {isShuffleGame ? <ShuffleGame /> : <GuessingGame />}
        </div>
      </div>
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        gameMode={isShuffleGame ? 'shuffle' : 'guessing'}
      />
    </div>
  );
};

export default App;
