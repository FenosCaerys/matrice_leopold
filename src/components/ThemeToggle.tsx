"use client";

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  // Initialiser le thème au chargement
  useEffect(() => {
    // Vérifier si un thème est déjà stocké
    const storedTheme = localStorage.getItem('theme');
    
    // Vérifier les préférences système si aucun thème n'est stocké
    if (!storedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      setTheme(storedTheme);
    }
  }, []);

  // Appliquer le thème quand il change
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Sauvegarder le thème dans localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Basculer entre les thèmes
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label={theme === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair'}
    >
      {theme === 'light' ? (
        // Icône lune pour le mode sombre
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        // Icône soleil pour le mode clair
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}
