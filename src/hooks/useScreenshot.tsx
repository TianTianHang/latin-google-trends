import html2canvas from 'html2canvas';
import { useCallback } from 'react';

interface UseScreenshotReturn {
  downloadScreenshot: (element: HTMLElement, fileName?: string) => Promise<void>;
}

const useScreenshot = (): UseScreenshotReturn => {
  const downloadScreenshot = useCallback(async (element: HTMLElement, fileName = 'screenshot') => {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  }, []);

  return { downloadScreenshot };
};

export default useScreenshot;