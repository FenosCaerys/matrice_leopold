"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

// Types
interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  activities: Activity[];
  components: EnvironmentalComponent[];
  impacts: Impact[];
}

interface Activity {
  id: string;
  name: string;
  description: string | null;
  phase: string;
  projectId: string;
}

interface EnvironmentalComponent {
  id: string;
  name: string;
  description: string | null;
  category: string;
  projectId: string;
}

interface Impact {
  id: string;
  magnitude: number;
  importance: number;
  description: string | null;
  mitigationMeasures: string | null;
  aiAnalysis: string | null;
  projectId: string;
  activityId: string;
  environmentalComponentId: string;
  activity: Activity;
  environmentalComponent: EnvironmentalComponent;
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'activities' | 'components'>('matrix');

  // Fonction pour charger les données du projet
  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du projet');
      }
      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données du projet au chargement initial
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p>Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen p-8 max-w-6xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error || "Projet non trouvé"}</p>
          <Link href="/" className="text-sm underline mt-2 inline-block">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
              &larr; Retour aux projets
            </Link>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-300 mt-2">{project.description}</p>
            )}
          </div>
          <div className="flex space-x-2 items-center">
            <ThemeToggle />
            <Link href={`/projects/${projectId}/analyze`} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Analyse automatique
            </Link>
            <Link href={`/projects/${projectId}/pges`} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Générer PGES
            </Link>
          </div>
        </div>
      </header>

      <div className="mb-6">
        <nav className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-2 px-4 ${
              activeTab === 'matrix'
                ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Matrice de Léopold
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-2 px-4 ${
              activeTab === 'activities'
                ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activités ({project.activities.length})
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`py-2 px-4 ${
              activeTab === 'components'
                ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Composantes ({project.components.length})
          </button>
        </nav>
      </div>

      <main>
        {activeTab === 'matrix' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Matrice de Léopold</h2>
              <button
                onClick={() => router.push(`/projects/${projectId}/impacts/new`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Ajouter un impact
              </button>
            </div>

            {project.activities.length === 0 || project.components.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
                <p className="font-medium">La matrice ne peut pas être affichée</p>
                <p className="mt-1">
                  Vous devez d'abord ajouter des activités et des composantes environnementales à votre projet.
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => setActiveTab('activities')}
                    className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded-md text-sm"
                  >
                    Ajouter des activités
                  </button>
                  <button
                    onClick={() => setActiveTab('components')}
                    className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded-md text-sm"
                  >
                    Ajouter des composantes
                  </button>
                </div>
              </div>
            ) : project.impacts.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md">
                <p>Aucun impact n'a encore été défini pour ce projet.</p>
                <button
                  onClick={() => router.push(`/projects/${projectId}/analyze`)}
                  className="mt-2 bg-blue-200 hover:bg-blue-300 text-blue-800 px-3 py-1 rounded-md text-sm"
                >
                  Lancer l'analyse automatique
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr>
                      <th className="border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900">
                        Activités ↓ \ Composantes →
                      </th>
                      {project.components.map((component) => (
                        <th
                          key={component.id}
                          className="border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900 text-sm"
                        >
                          {component.name}
                          <div className="text-xs text-gray-500">{component.category}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {project.activities.map((activity) => (
                      <tr key={activity.id}>
                        <td className="border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900 font-medium">
                          {activity.name}
                          <div className="text-xs text-gray-500">{activity.phase}</div>
                        </td>
                        {project.components.map((component) => {
                          const impact = project.impacts.find(
                            (i) => i.activityId === activity.id && i.environmentalComponentId === component.id
                          );
                          return (
                            <td
                              key={`${activity.id}-${component.id}`}
                              className="border border-gray-200 dark:border-gray-700 p-2 text-center"
                            >
                              {impact ? (
                                <div
                                  className={`cursor-pointer p-1 rounded ${
                                    impact.magnitude < 0
                                      ? 'bg-red-100 dark:bg-red-900'
                                      : impact.magnitude > 0
                                      ? 'bg-green-100 dark:bg-green-900'
                                      : ''
                                  }`}
                                  onClick={() => router.push(`/projects/${projectId}/impacts/${impact.id}`)}
                                >
                                  <div className="font-bold">{impact.magnitude}</div>
                                  <div className="text-sm">{impact.importance}</div>
                                </div>
                              ) : (
                                <div className="text-gray-300 text-xs">-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {project.impacts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Légende</h3>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="inline-block w-4 h-4 bg-red-100 dark:bg-red-900 mr-1"></span>
                    Impact négatif (magnitude négative)
                  </div>
                  <div>
                    <span className="inline-block w-4 h-4 bg-green-100 dark:bg-green-900 mr-1"></span>
                    Impact positif (magnitude positive)
                  </div>
                  <div>Format: Magnitude / Importance</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activities' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Activités du projet</h2>
              <button
                onClick={() => router.push(`/projects/${projectId}/activities/new`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Ajouter une activité
              </button>
            </div>

            {project.activities.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                <p className="mb-4">Aucune activité n'a encore été définie pour ce projet.</p>
                <button
                  onClick={() => router.push(`/projects/${projectId}/activities/new`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Ajouter une première activité
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium">{activity.name}</h3>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                        {activity.phase}
                      </span>
                    </div>
                    {activity.description && <p className="mt-2 text-gray-600 dark:text-gray-300">{activity.description}</p>}
                    <div className="mt-3 flex justify-end space-x-4">
                      <button
                        onClick={async () => {
                          if (window.confirm('Êtes-vous sûr de vouloir supprimer cette activité ? Cette action supprimera également tous les impacts associés.'))
                          {
                            try {
                              const response = await fetch(`/api/projects/${projectId}/activities/${activity.id}`, {
                                method: 'DELETE',
                              });
                              
                              if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.error || 'Erreur lors de la suppression');
                              }
                              
                              // Recharger les données du projet
                              fetchProject();
                            } catch (err) {
                              alert(err instanceof Error ? err.message : 'Une erreur est survenue');
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                      <button
                        onClick={() => router.push(`/projects/${projectId}/activities/${activity.id}/edit`)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'components' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Composantes environnementales</h2>
              <button
                onClick={() => router.push(`/projects/${projectId}/components/new`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Ajouter une composante
              </button>
            </div>

            {project.components.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                <p className="mb-4">Aucune composante environnementale n'a encore été définie pour ce projet.</p>
                <button
                  onClick={() => router.push(`/projects/${projectId}/components/new`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Ajouter une première composante
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.components.map((component) => (
                  <div
                    key={component.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium">{component.name}</h3>
                      <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs">
                        {component.category}
                      </span>
                    </div>
                    {component.description && (
                      <p className="mt-2 text-gray-600 dark:text-gray-300">{component.description}</p>
                    )}
                    <div className="mt-3 flex justify-end space-x-4">
                      <button
                        onClick={async () => {
                          if (window.confirm('Êtes-vous sûr de vouloir supprimer cette composante environnementale ? Cette action supprimera également tous les impacts associés.'))
                          {
                            try {
                              const response = await fetch(`/api/projects/${projectId}/components/${component.id}`, {
                                method: 'DELETE',
                              });
                              
                              if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.error || 'Erreur lors de la suppression');
                              }
                              
                              // Recharger les données du projet
                              fetchProject();
                            } catch (err) {
                              alert(err instanceof Error ? err.message : 'Une erreur est survenue');
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                      <button
                        onClick={() => router.push(`/projects/${projectId}/components/${component.id}/edit`)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
