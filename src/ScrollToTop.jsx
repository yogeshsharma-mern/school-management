import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
 
const ScrollToTop = ({ behavior = 'smooth' }) => {
  const { pathname, hash, search } = useLocation();
 
  useEffect(() => {
    if (hash) {
      // If navigating to an anchor, let the browser handle it after render
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior, block: 'start' });
        return;
      }
    }
 
    window.scrollTo({ top: 0, left: 0, behavior });
  }, [pathname, hash, search, behavior]);
 
  return null;
};
 
export default ScrollToTop;