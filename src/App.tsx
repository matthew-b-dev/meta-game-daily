import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { QuestionMarkCircleIcon } from '@heroicons/react/16/solid';
import { getUtcDateString } from './utils';
import GuessingGame from './GuessingGame';
import ShuffleGame from './ShuffleGame';
import SteamDetective from './SteamDetective';
import HelpModal from './components/HelpModal';
import Subtitle from './components/Subtitle';
import ResetPuzzleButton from './components/ResetPuzzleButton';

const App = () => {
  const [showHelp, setShowHelp] = useState(false);

  const dateString = getUtcDateString();
  const date = new Date(dateString + 'T00:00:00Z');
  const dayOfWeek = date.getUTCDay();

  const isShuffleGame = dayOfWeek === 0; // Sunday
  const isSteamDetective = dayOfWeek === 1; // Monday

  const isTestRoute = !!window.location.pathname.match(
    /\/test\/(\d{4}-\d{2}-\d{2})/,
  );

  const handleGlobalReset = () => {
    localStorage.removeItem('meta-game-daily-state');
    window.location.reload();
  };

  // Determine game mode for help modal
  const gameMode: 'guessing' | 'shuffle' | 'detective' = isShuffleGame
    ? 'shuffle'
    : isSteamDetective
      ? 'detective'
      : 'guessing';

  return (
    <div className='min-h-screen w-full flex flex-col diagonal-pattern-bg overflow-x-hidden'>
      <Toaster position='top-center' />
      <div className='flex flex-col items-center w-full px-1 sm:px-4 flex-1'>
        <div className='w-full max-w-[750px] p-2 sm:p-6'>
          <div
            className={`relative ${isShuffleGame || isSteamDetective ? 'mb-2 sm:mb-6' : 'mb-4 sm:mb-6'}`}
          >
            <div className='text-center sm:text-center flex flex-col items-start sm:items-center'>
              <h1
                className='text-lg sm:text-4xl mb-[-5px] sm:py-0 sm:mb-0 pl-1 sm:pl-0 font-black'
                style={{
                  fontFamily: 'Playfair Display, serif',
                  letterSpacing: '-0.04em',
                }}
              >
                MetaGame<span className='text-gray-300'>Daily</span>
              </h1>
              <p
                className='text-gray-400 text-sm hidden sm:block relative top-[-8px] left-[-4px]'
                style={{
                  letterSpacing: '-0.04em',
                }}
              >
                <span className='underline decoration-2 decoration-zinc-700'>
                  A daily <i>Video Games Industry</i> puzzle
                </span>
              </p>
              <Subtitle />
              {isTestRoute && (
                <div className='flex gap-2'>
                  <div>DEBUG:</div>
                  <ResetPuzzleButton onResetPuzzle={handleGlobalReset} />
                </div>
              )}
            </div>
            <button
              className='absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-1 px-2 bg-none sm:border-1 sm:border-gray-700 sm:px-3 sm:py-1'
              onClick={() => setShowHelp(true)}
            >
              <QuestionMarkCircleIcon className='h-6 w-6 sm:h-4 sm:w-4' />
              <span className='text-sm font-semibold hidden sm:inline relative top-[-1px]'>
                How to play
              </span>
            </button>
          </div>
          {isShuffleGame ? (
            <ShuffleGame />
          ) : isSteamDetective ? (
            <SteamDetective />
          ) : (
            <GuessingGame />
          )}
        </div>
      </div>
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        gameMode={gameMode}
      />
    </div>
  );
};

export default App;
