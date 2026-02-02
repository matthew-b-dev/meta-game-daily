import { motion } from 'framer-motion';
import { CensoredSteamGameTitle } from './CensoredSteamGameTitle';
import { clueVariants } from './utils';

interface ClueTitleProps {
  title: string;
  show: boolean;
  isComplete: boolean;
}

export const ClueTitle: React.FC<ClueTitleProps> = ({
  title,
  show,
  isComplete,
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
      <div className='px-4 pt-3 pb-1'>
        {isComplete ? (
          <div className='text-lg sm:text-xl'>{title}</div>
        ) : (
          <CensoredSteamGameTitle title={title} />
        )}
      </div>
    </motion.div>
  );
};
