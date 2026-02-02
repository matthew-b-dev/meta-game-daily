import { motion } from 'framer-motion';
import { getReviewColorClass, clueVariants } from './utils';
import type { ReviewSummary } from '../../types';

interface ClueDetailsProps {
  allReviewSummary: ReviewSummary;
  releaseDate: string;
  developer: string;
  publisher: string;
  show: boolean;
}

export const ClueDetails: React.FC<ClueDetailsProps> = ({
  allReviewSummary,
  releaseDate,
  developer,
  publisher,
  show,
}) => {
  return (
    <motion.div
      layout
      initial={false}
      animate={show ? 'visible' : 'hidden'}
      variants={clueVariants}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className='overflow-hidden'
    >
      <div className='px-4 py-3'>
        {/* All Reviews */}
        <div className='flex items-start gap-2'>
          <div className='text-gray-400 text-xs uppercase min-w-[120px] pt-1'>
            All Reviews:
          </div>
          <div className='flex-1 flex gap-1'>
            <div
              className={`text-sm ${getReviewColorClass(allReviewSummary.rating)}`}
            >
              {allReviewSummary.rating}{' '}
              <span className='text-[#8f98a0] text-sm'>
                ({allReviewSummary.count.toLocaleString()})
              </span>
            </div>
          </div>
        </div>

        {/* Release Date */}
        <div className='flex items-start gap-2 mt-4'>
          <div className='text-gray-400 text-xs uppercase min-w-[120px] pt-[3px]'>
            Release Date:
          </div>
          <div className='text-[#c7d5e0] text-sm'>{releaseDate}</div>
        </div>

        {/* Developer */}
        <div className='flex items-start gap-2 mt-5'>
          <div className='text-gray-400 text-xs uppercase min-w-[120px] pt-[3px]'>
            Developer:
          </div>
          <div className='text-sm'>
            <span className='text-[#66c0f4]'>{developer}</span>
          </div>
        </div>

        {/* Publisher */}
        <div className='flex items-start gap-2'>
          <div className='text-gray-400 text-xs uppercase min-w-[120px] pt-[3px]'>
            Publisher:
          </div>
          <div className='text-sm'>
            <span className='text-[#66c0f4]'>{publisher}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
