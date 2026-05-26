import { useState, useEffect } from 'react';

export default function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('cr-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cr-theme', theme);
  }, [theme]);

  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
}
