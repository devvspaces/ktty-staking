import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';


const useCopy = () => {
  const toast = useToast();
  const copy = useCallback((value: string) => {
    return async () => {
      try {
        await navigator.clipboard.writeText(value);
        toast({
          title: 'Copied',
          description: value,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch {
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            toast({
              title: 'Copied',
              description: value,
              status: 'success',
              duration: 2000,
              isClosable: true,
            });
            console.log('Fallback: Copied to clipboard:', value);
          } else {
            console.error('Fallback: Unable to copy');
          }
        } catch (err) {
          console.error('Fallback: Unable to copy', err);
        }
        
        document.body.removeChild(textArea);
      }
    };
  }, [toast]);

  return copy;
};

export default useCopy;