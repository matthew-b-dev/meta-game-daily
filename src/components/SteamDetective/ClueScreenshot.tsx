import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import FsLightbox from 'fslightbox-react';
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
  const [lightboxToggler, setLightboxToggler] = useState(false);

  // Determine which screenshot is currently the large one
  const largeScreenshot = bothShown ? secondaryScreenshot : screenshot;
  const isMobileViewport = window.innerWidth < 640;
  // Handle click on large screenshot - only on mobile
  const handleLargeScreenshotClick = () => {
    // Check if viewport is mobile (width < 642)
    if (isMobileViewport) {
      setLightboxToggler(!lightboxToggler);
    }
  };

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
                className={`overflow-hidden rounded-lg relative ${isMobileViewport ? 'cursor-pointer' : 'cursor-default'}`}
                style={{ aspectRatio: '16/9' }}
                onClick={handleLargeScreenshotClick}
              >
                <motion.img
                  key={secondaryScreenshot}
                  src={secondaryScreenshot}
                  alt='Game screenshot'
                  className='w-full h-full object-cover block'
                  initial={{ filter: 'blur(10px)', opacity: 0 }}
                  animate={{
                    filter: isMobileViewport
                      ? 'blur(0px) brightness(1.25)'
                      : 'blur(0px) brightness(1)',
                    opacity: 1,
                  }}
                  exit={{ filter: 'blur(10px)', opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
                {isMobileViewport && (
                  <div className='absolute top-2 right-2 bg-black/50 rounded-md p-2 pointer-events-none'>
                    <ArrowsPointingOutIcon className='w-8 h-8 text-white drop-shadow-lg' />
                  </div>
                )}
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
              className={`overflow-hidden rounded-lg relative ${bothShown ? 'cursor-pointer group' : isMobileViewport ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ aspectRatio: '16/9' }}
              onClick={
                bothShown ? onSwapScreenshots : handleLargeScreenshotClick
              }
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
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={2}
                    stroke='currentColor'
                    className='w-6 h-6'
                    style={{ transform: 'rotate(90deg)' }}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M4 7h16M4 7l4-4m-4 4l4 4M20 17H4m16 0l-4 4m4-4l-4-4'
                    />
                  </svg>
                </div>
              )}
              {!bothShown && isMobileViewport && (
                <div className='absolute top-2 right-2 bg-black/50 rounded-md p-2 pointer-events-none'>
                  <ArrowsPointingOutIcon className='w-8 h-8 text-white drop-shadow-lg' />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lightbox for mobile only */}
      <FsLightbox toggler={lightboxToggler} sources={[largeScreenshot]} />
    </motion.div>
  );
};
