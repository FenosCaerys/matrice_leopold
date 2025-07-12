"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  // Charger les projets au chargement de la page
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des projets');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Gérer la création d'un nouveau projet
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du projet');
      }

      const createdProject = await response.json();
      setProjects([createdProject, ...projects]);
      setNewProject({ name: '', description: '' });
      setShowNewProject(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-2">Matrice de Léopold</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Outil d'évaluation des impacts environnementaux pour les projets de génie civil
        </p>
      </header>

      <main>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Mes Projets</h2>
          <button 
            onClick={() => setShowNewProject(!showNewProject)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            {showNewProject ? 'Annuler' : 'Nouveau Projet'}
          </button>
        </div>

        {/* Formulaire de création de projet */}
        {showNewProject && (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8 shadow-md">
            <h3 className="text-xl font-medium mb-4">Créer un nouveau projet</h3>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-2 font-medium">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  required
                  minLength={3}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block mb-2 font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Créer le projet
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-sm underline ml-2"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Liste des projets */}
        {loading ? (
          <div className="text-center py-8">
            <p>Chargement des projets...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
            <h3 className="text-xl font-medium mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Commencez par créer un nouveau projet pour utiliser la matrice de Léopold.
            </p>
            <button
              onClick={() => setShowNewProject(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Créer mon premier projet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                href={`/projects/${project.id}`}
                key={project.id}
                className="block bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                {project.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    Créé le {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    Voir la matrice
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">
        <p>Matrice de Léopold - Outil d'évaluation des impacts environnementaux</p>
        <p className="mt-2 text-sm">
          Basé sur la méthodologie développée par Luna B. Leopold et al. (1971)
        </p>
      </footer>
    </div>
  );
}
