import { motion } from 'framer-motion';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { screenshotVariants } from './utils';

interface ClueScreenshotProps {
  screenshot: string;
  secondaryScreenshot?: string;
  show: boolean;
  showSecondary?: boolean;
  onSwapScreenshots?: () => void;
}

export const ClueScreenshot: React.FC<ClueScreenshotProps> = ({
  screenshot,
  secondaryScreenshot,
  show,
  showSecondary = false,
  onSwapScreenshots,
}) => {
  const bothShown = showSecondary && secondaryScreenshot;

  return (
    <motion.div
      layout
      initial={false}
      animate={show ? 'visible' : 'hidden'}
      variants={screenshotVariants}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className='relative overflow-hidden'
    >
      <div className='px-4 py-4'>
        <div className='flex flex-col gap-3'>
          {/* Secondary Screenshot (main/large) - appears when clue 5 is shown */}
          {bothShown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <div
                className='overflow-hidden rounded-lg'
                style={{ aspectRatio: '16/9' }}
              >
                <motion.img
                  key={secondaryScreenshot}
                  src={secondaryScreenshot}
                  alt='Game screenshot'
                  className='w-full h-full object-cover block'
                  initial={{ filter: 'blur(10px)', opacity: 0 }}
                  animate={{ filter: 'blur(0px)', opacity: 1 }}
                  exit={{ filter: 'blur(10px)', opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* Primary Screenshot (thumbnail when both shown) */}
          <motion.div
            layout
            animate={{
              width: bothShown ? '20%' : '100%',
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className='flex-shrink-0'
          >
            <div
              className={`overflow-hidden rounded-lg relative ${bothShown ? 'cursor-pointer group' : ''}`}
              style={{ aspectRatio: '16/9' }}
              onClick={bothShown ? onSwapScreenshots : undefined}
            >
              <motion.img
                key={screenshot}
                src={screenshot}
                alt='Game screenshot'
                className={`w-full h-full object-cover block ${bothShown ? 'brightness-75 group-hover:brightness-90' : ''}`}
                initial={{ filter: 'blur(10px)', opacity: 0 }}
                animate={{ filter: 'blur(0px)', opacity: 1 }}
                exit={{ filter: 'blur(10px)', opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
              {bothShown && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                  <ArrowsPointingOutIcon className='w-8 h-8 text-white drop-shadow-lg' />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
