"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string | null;
}

interface PGESResult {
  summary: string;
  prioritizedImpacts: {
    activityName: string;
    componentName: string;
    magnitude: number;
    importance: number;
    priority: 'Élevée' | 'Moyenne' | 'Faible';
  }[];
  recommendations: {
    category: string;
    measures: string[];
  }[];
  monitoringPlan: {
    indicator: string;
    frequency: string;
    responsibleParty: string;
  }[];
}

export default function PGESPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<PGESResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');

  // Charger les détails du projet
  useEffect(() => {
    const fetchProject = async () => {
      try {
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

    fetchProject();
  }, [projectId]);

  // Fonction pour générer le PGES
  const generatePGES = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/pges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération du PGES');
      }

      const data = await response.json();
      setResult(data.pges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la génération du PGES');
    } finally {
      setGenerating(false);
    }
  };

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority: 'Élevée' | 'Moyenne' | 'Faible') => {
    switch (priority) {
      case 'Élevée':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Moyenne':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Faible':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p>Chargement des détails du projet...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen p-8 max-w-4xl mx-auto">
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
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline mb-2 inline-block">
          &larr; Retour au projet
        </Link>
        <h1 className="text-2xl font-bold">Plan de Gestion Environnementale et Sociale (PGES)</h1>
        <h2 className="text-xl mt-2">Projet: {project.name}</h2>
        {project.description && (
          <p className="text-gray-600 mt-2">{project.description}</p>
        )}
      </header>

      <main>
        {!result ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="mb-6">
              Le Plan de Gestion Environnementale et Sociale (PGES) est un document qui définit les mesures d'atténuation, 
              de compensation et de suivi des impacts environnementaux et sociaux identifiés dans la matrice de Léopold.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md mb-6">
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Le PGES comprendra</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-blue-700 dark:text-blue-300">
                <li>Une synthèse des principaux enjeux environnementaux et sociaux du projet</li>
                <li>Une priorisation des impacts (élevée, moyenne, faible) basée sur leur magnitude et importance</li>
                <li>Des recommandations de mesures correctives regroupées par catégorie</li>
                <li>Un plan de suivi avec des indicateurs, leur fréquence de mesure et les responsables</li>
              </ul>
            </div>
            
            <div className="text-center">
              <button
                onClick={generatePGES}
                disabled={generating}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium"
              >
                {generating ? 'Génération en cours...' : 'Générer le PGES'}
              </button>
              {generating && (
                <p className="mt-4 text-gray-600">
                  La génération peut prendre jusqu'à une minute, veuillez patienter...
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Onglets de navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <ul className="flex flex-wrap -mb-px">
                <li className="mr-2">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`inline-block p-4 rounded-t-lg ${
                      activeTab === 'summary'
                        ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                        : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                    }`}
                  >
                    Synthèse
                  </button>
                </li>
                <li className="mr-2">
                  <button
                    onClick={() => setActiveTab('impacts')}
                    className={`inline-block p-4 rounded-t-lg ${
                      activeTab === 'impacts'
                        ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                        : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                    }`}
                  >
                    Impacts prioritaires
                  </button>
                </li>
                <li className="mr-2">
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`inline-block p-4 rounded-t-lg ${
                      activeTab === 'recommendations'
                        ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                        : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                    }`}
                  >
                    Recommandations
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('monitoring')}
                    className={`inline-block p-4 rounded-t-lg ${
                      activeTab === 'monitoring'
                        ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                        : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                    }`}
                  >
                    Plan de suivi
                  </button>
                </li>
              </ul>
            </div>

            {/* Contenu des onglets */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              {activeTab === 'summary' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Synthèse des enjeux environnementaux et sociaux</h2>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <p className="whitespace-pre-line">{result.summary}</p>
                  </div>
                </div>
              )}

              {activeTab === 'impacts' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Impacts prioritaires</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="py-2 px-4 border-b text-left">Activité</th>
                          <th className="py-2 px-4 border-b text-left">Composante</th>
                          <th className="py-2 px-4 border-b text-center">Magnitude</th>
                          <th className="py-2 px-4 border-b text-center">Importance</th>
                          <th className="py-2 px-4 border-b text-center">Priorité</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.prioritizedImpacts.map((impact, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-2 px-4 border-b">{impact.activityName}</td>
                            <td className="py-2 px-4 border-b">{impact.componentName}</td>
                            <td className={`py-2 px-4 border-b text-center font-medium ${
                              impact.magnitude < 0 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {impact.magnitude}
                            </td>
                            <td className="py-2 px-4 border-b text-center">{impact.importance}</td>
                            <td className="py-2 px-4 border-b">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(impact.priority)}`}>
                                {impact.priority}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Recommandations et mesures correctives</h2>
                  <div className="space-y-6">
                    {result.recommendations.map((rec, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                        <h3 className="text-lg font-medium mb-2">Catégorie: {rec.category}</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {rec.measures.map((measure, idx) => (
                            <li key={idx}>{measure}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'monitoring' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Plan de suivi</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="py-2 px-4 border-b text-left">Indicateur</th>
                          <th className="py-2 px-4 border-b text-left">Fréquence</th>
                          <th className="py-2 px-4 border-b text-left">Responsable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.monitoringPlan.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-2 px-4 border-b">{item.indicator}</td>
                            <td className="py-2 px-4 border-b">{item.frequency}</td>
                            <td className="py-2 px-4 border-b">{item.responsibleParty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="mt-6 text-right">
                <button
                  onClick={generatePGES}
                  disabled={generating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  {generating ? 'Génération en cours...' : 'Régénérer le PGES'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
