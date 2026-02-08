import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Game } from '../types';

interface SortableGameItemProps {
  game: Game;
  id: string;
  index: number;
  isFrozen: boolean;
  isCorrect: boolean;
  isShaking: boolean;
  showHiddenInfo: boolean;
  variant: 'hltb' | 'score' | 'releaseYear';
}

export const SortableGameItem = ({
  game,
  id,
  isFrozen,
  isCorrect,
  isShaking,
  showHiddenInfo,
  variant,
}: SortableGameItemProps) => {
  const getHiddenInfo = () => {
    if (!showHiddenInfo) return null;

    if (variant === 'hltb' && game.hltb?.main) {
      return `Main Story: ${game.hltb.main}h`;
    } else if (variant === 'score' && game.score) {
      return `Score: ${game.score}`;
    } else if (variant === 'releaseYear' && game.releaseYear) {
      return `Released: ${game.releaseYear}`;
    }
    return null;
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isFrozen,
    animateLayoutChanges: (args) => {
      // Frozen items never animate
      if (isFrozen) return false;

      // Don't animate layout changes after a drag ends (wasDragging -> !isDragging)
      // This prevents the double animation issue
      if (args.wasDragging && !args.isDragging) {
        return false;
      }

      return defaultAnimateLayoutChanges(args);
    },
  });

  const style = {
    transform: CSS.Transform.toString(isFrozen ? null : transform),
    transition: isFrozen
      ? 'background-color 0.5s, border-color 0.5s, opacity 0.5s'
      : `${transition}, background-color 0.5s, border-color 0.5s, opacity 0.5s`,
    opacity: isDragging ? 0.5 : isCorrect && !showHiddenInfo ? 0.6 : 1,
    zIndex: isFrozen ? 2 : 3,
    touchAction: 'none', // Prevent browser scroll on touch
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative mb-2 rounded-lg border-2 min-h-[52px] select-none
        ${getHiddenInfo() ? 'py-[6px] px-4' : 'p-3'}
        ${
          isFrozen
            ? isCorrect
              ? 'bg-green-900 border-green-500 cursor-default'
              : 'bg-gray-700 border-gray-500 cursor-default'
            : 'bg-gray-800 border-gray-600 cursor-grab active:cursor-grabbing hover:border-blue-400'
        }
        ${isDragging ? 'z-50' : ''}
        ${isShaking ? 'animate-shake' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      <div className='flex items-center justify-between'>
        <div>
          <h3
            className={`font-semibold text-gray-100 ${getHiddenInfo() ? 'text-sm' : ''}`}
          >
            {game.name}
          </h3>
          {getHiddenInfo() && (
            <p className='text-xs text-gray-300'>{getHiddenInfo()}</p>
          )}
        </div>
        {isFrozen && isCorrect && (
          <div className='flex items-center gap-2 text-green-600'>
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <span className='text-sm text-white font-semibold'>Correct!</span>
          </div>
        )}
        {!isFrozen && (
          <div className='text-gray-400'>
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <circle cx='6' cy='4' r='1.5' />
              <circle cx='14' cy='4' r='1.5' />
              <circle cx='6' cy='10' r='1.5' />
              <circle cx='14' cy='10' r='1.5' />
              <circle cx='6' cy='16' r='1.5' />
              <circle cx='14' cy='16' r='1.5' />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
