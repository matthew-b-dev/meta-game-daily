import React from 'react';
import ExpandableRow from './ExpandableRow';
import type { Game } from '../App';
import type { GameState } from '../utils';

interface GameTableProps {
  dailyGames: Game[];
  correctGuesses: string[];
  revealedGames: string[];
  onDeduct: (amount: number) => void;
  onGameRevealed: (gameName: string) => void;
  gameStates: { [gameName: string]: GameState };
  updateGameState: (gameName: string, state: Partial<GameState>) => void;
}

const GameTable: React.FC<GameTableProps> = ({
  dailyGames,
  correctGuesses,
  revealedGames,
  onDeduct,
  onGameRevealed,
  gameStates,
  updateGameState,
}) => {
  return (
    <table className="w-full border-collapse rounded-lg shadow-lg overflow-hidden">
      <thead>
        <tr className="border-b border-zinc-700 bg-zinc-800">
          <th className="p-2 w-12"></th>
          <th className="text-left p-2">Game</th>
          <th className="text-left p-2">Year</th>
          <th className="text-left p-2">Developer(s)</th>
          <th className="text-left p-2">Points</th>
        </tr>
      </thead>
      <tbody>
        {dailyGames.map((game, idx) => (
          <ExpandableRow
            key={game.name}
            game={game}
            onDeduct={onDeduct}
            correctGuesses={correctGuesses}
            revealedGames={revealedGames}
            isLast={idx === dailyGames.length - 1}
            onGameRevealed={onGameRevealed}
            gameState={gameStates[game.name]}
            updateGameState={updateGameState}
          />
        ))}
      </tbody>
    </table>
  );
};

export default GameTable;
