import React from 'react';
import { Accordion, type AccordionItem } from './Accordion';
import type { Game } from '../App';
import type { GameState } from '../utils';
import { GameContent } from './GameContent';

interface GameTableProps {
  dailyGames: Game[];
  correctGuesses: string[];
  revealedGames: string[];
  onDeduct: (amount: number) => void;
  onGameRevealed: (gameName: string) => void;
  gameStates: { [gameName: string]: GameState };
  updateGameState: (gameName: string, state: Partial<GameState>) => void;
}

const maskName = (name: string) =>
  name
    .replace(/[^ :-]/g, '*')
    .replace(/:/g, '\u00A0:\u00A0')
    .replace(/-/g, '\u00A0-\u00A0');

const GameTable: React.FC<GameTableProps> = ({
  dailyGames,
  correctGuesses,
  revealedGames,
  onDeduct,
  onGameRevealed,
  gameStates,
  updateGameState,
}) => {
  // Deduction values for each field
  const fieldDeductions: { [key: string]: number } = {
    score: 5,
    genres: 5,
    releaseDate: 5,
    platforms: 5,
    publishers: 30,
    screenshot: 50,
  };

  // List of revealable fields
  const revealFields = [
    'score',
    'genres',
    'releaseDate',
    'platforms',
    'publishers',
    'screenshot',
  ];

  // Create accordion items - recreated on every render to reflect state changes
  const accordionItems: AccordionItem[] = dailyGames.map((game, idx) => {
    const gameState = gameStates[game.name];
    const revealed = gameState?.revealed ?? {};
    const revealedTitle = gameState?.revealedTitle ?? false;
    const pointsDeducted = gameState?.pointsDeducted ?? 0;

    // Determine header background color class based on game state
    let headerClassName = '';
    let hoverHeaderClassName = '';
    if (correctGuesses.includes(game.name)) {
      headerClassName =
        'bg-green-600 text-white transition-colors duration-200';
      hoverHeaderClassName = 'bg-green-500';
    } else if (revealedTitle) {
      headerClassName = 'bg-red-700 text-white transition-colors duration-200';
      hoverHeaderClassName = 'bg-red-600';
    } else {
      headerClassName = 'bg-zinc-800 transition-colors duration-200';
      hoverHeaderClassName = 'bg-zinc-700';
    }

    // Calculate earned points and badge class
    const earnedPoints = 200 - pointsDeducted;
    let badgeClass = '';

    const isGuessed = correctGuesses.includes(game.name);
    if (earnedPoints === 0) {
      badgeClass = 'bg-red-800 text-white';
    } else if (isGuessed && earnedPoints === 200) {
      badgeClass = 'bg-green-700 text-white';
    } else if (isGuessed && earnedPoints < 200) {
      badgeClass = 'bg-yellow-500 text-black';
    } else {
      badgeClass = 'bg-zinc-700 text-white';
    }

    return {
      id: game.name,
      headerClassName,
      hoverHeaderClassName,
      isLast: idx === dailyGames.length - 1,
      header: (
        <div className='flex items-center gap-2 sm:gap-4 flex-1'>
          <div className='flex-1 grid grid-cols-[3fr_40px_2fr] sm:grid-cols-[4fr_40px_2fr_78px] gap-2 text-sm md:text-base items-center'>
            <div className='flex items-center'>
              {correctGuesses.includes(game.name) || revealedTitle
                ? game.name
                : maskName(game.name)}
            </div>
            <div className='flex items-center'>{game.releaseYear}</div>
            <div className='flex items-center'>
              {Array.isArray(game.developers)
                ? game.developers.join(', ')
                : game.developers}
            </div>
            <div className='hidden sm:flex sm:items-center'>
              <span
                className={`px-2 py-1 rounded font-semibold w-[40px] sm:w-[78px] inline-block text-center text-sm ${badgeClass}`}
              >
                {earnedPoints}
                <span className='display hidden sm:inline'>/200</span>
              </span>
            </div>
          </div>
        </div>
      ),
      content: (
        <GameContent
          game={game}
          gameState={gameState}
          correctGuesses={correctGuesses}
          revealedGames={revealedGames}
          onDeduct={onDeduct}
          onGameRevealed={onGameRevealed}
          updateGameState={updateGameState}
          revealed={revealed}
          revealedTitle={revealedTitle}
          pointsDeducted={pointsDeducted}
          fieldDeductions={fieldDeductions}
          revealFields={revealFields}
        />
      ),
    };
  });

  return <Accordion items={accordionItems} />;
};

export default GameTable;
