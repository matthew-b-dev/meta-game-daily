import { useMemo } from 'react';
import { getSundayShuffleGames } from './utils';
import { gameDetails } from './game_details';

const ShuffleGame = () => {
  const sundayShuffleGames = useMemo(() => {
    const result = getSundayShuffleGames(gameDetails, 'hltb');
    return result;
  }, []);

  return (
    <div className='mb-8'>
      <div className='text-center'>
        <h2
          className='text-xl sm:text-2xl font-black'
          style={{
            fontFamily: 'Playfair Display, serif',
            letterSpacing: '0.02em',
          }}
        >
          The Biweekly Shuffle
        </h2>
      </div>
      <div>{sundayShuffleGames.map((game) => game.name).join(', ')}</div>
    </div>
  );
};

export default ShuffleGame;
