import { useEffect, useState } from 'react';

const STORAGE_KEY = 'shopport-theme';

export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggle() {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }

  return { theme, toggle };
}