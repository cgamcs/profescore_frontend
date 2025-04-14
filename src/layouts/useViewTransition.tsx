import { useNavigate } from 'react-router-dom';
import { MouseEvent } from 'react';

interface NavigateOptions {
  replace?: boolean;
}

/**
 * Custom hook to handle navigation with View Transitions API
 * @returns Object with navigate function
 */
export const useViewTransition = () => {
  const navigate = useNavigate();

  /**
   * Navigate to a new route with view transition if supported
   * @param path Path to navigate to
   * @param options Optional navigation options
   */
  const navigateWithTransition = (path: string, options?: NavigateOptions) => {
    if (document.startViewTransition) {
      // Forzar transición en el elemento raíz
      document.documentElement.style.viewTransitionName = 'root';

      const transition = document.startViewTransition(async () => {
        navigate(path, options);
        // Pequeño delay para sincronización
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      transition.finished.finally(() => {
        document.documentElement.style.viewTransitionName = '';
      });
    } else {
      navigate(path, options);
    }
  };
  /**
   * Handle link clicks with view transition
   * @param path Path to navigate to
   * @param event React mouse event
   */
  const handleLinkClick = (path: string, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigateWithTransition(path);
  };

  return { navigateWithTransition, handleLinkClick };
};

export default useViewTransition;
