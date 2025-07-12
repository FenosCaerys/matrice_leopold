"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

interface Project {
  id: string;
  name: string;
  description: string | null;
}

interface AnalysisResult {
  summary: string;
  suggestedImpacts: {
    activityId: string;
    componentId: string;
    activityName?: string;
    componentName?: string;
    activityPhase?: string;
    componentCategory?: string;
    magnitude: number;
    importance: number;
    justification: string;
  }[];
  createdImpacts: any[];
}

export default function AnalyzeProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Fonction pour analyser le projet
  const analyzeProject = async () => {
    setAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'analyse du projet');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'analyse');
    } finally {
      setAnalyzing(false);
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
        <div className="flex justify-between items-center mb-4">
          <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline inline-block">
            &larr; Retour au projet
          </Link>
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-bold">Analyse automatique du projet: {project.name}</h1>
        {project.description && (
          <p className="text-gray-600 dark:text-gray-300 mt-2">{project.description}</p>
        )}
      </header>

      <main>
        {!result ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="mb-6">
              L'analyse automatique va identifier les interactions pertinentes entre les activités et les composantes environnementales de votre projet, 
              puis attribuer une magnitude et une importance à chaque impact identifié.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md mb-6">
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Comment ça fonctionne</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-blue-700 dark:text-blue-300">
                <li>L'IA analysera les activités et composantes environnementales de votre projet</li>
                <li>Elle identifiera 25-50 interactions pertinentes parmi toutes les combinaisons possibles</li>
                <li>Pour chaque interaction, elle attribuera une magnitude (-10 à +10) et une importance (1 à 10)</li>
                <li>Les impacts identifiés seront automatiquement ajoutés à votre matrice</li>
                <li>Une synthèse narrative des principaux enjeux environnementaux sera générée</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md mb-6">
              <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Comprendre les scores d'impact</h2>
              <div className="mt-2 space-y-3 text-yellow-700 dark:text-yellow-300">
                <div>
                  <h3 className="font-medium">Magnitude (-10 à +10)</h3>
                  <p>La magnitude représente l'ampleur de l'impact sur l'environnement :</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li><strong>Valeurs négatives</strong> (-10 à -1) : Impacts négatifs sur l'environnement, -10 étant le plus sévère</li>
                    <li><strong>Valeurs positives</strong> (+1 à +10) : Bénéfices environnementaux, +10 étant le plus bénéfique</li>
                    <li><strong>Zéro</strong> : Aucun impact significatif</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium">Importance (1 à 10)</h3>
                  <p>L'importance indique la signification de l'impact dans le contexte global du projet :</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li><strong>1-3</strong> : Importance faible, impact local ou temporaire</li>
                    <li><strong>4-7</strong> : Importance moyenne, impact notable mais gérable</li>
                    <li><strong>8-10</strong> : Importance élevée, impact critique nécessitant une attention particulière</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={analyzeProject}
                disabled={analyzing}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium"
              >
                {analyzing ? 'Analyse en cours...' : 'Lancer l\'analyse automatique'}
              </button>
              {analyzing && (
                <p className="mt-4 text-gray-600">
                  L'analyse peut prendre jusqu'à une minute, veuillez patienter...
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">Synthèse du projet</h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <p className="whitespace-pre-line">{result.summary}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Impacts identifiés</h2>
              <p className="mb-4">
                {result.createdImpacts.length} nouveaux impacts ont été créés sur {result.suggestedImpacts.length} impacts identifiés.
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="py-2 px-4 border-b text-left">Activité</th>
                      <th className="py-2 px-4 border-b text-left">Composante</th>
                      <th className="py-2 px-4 border-b text-center">Magnitude</th>
                      <th className="py-2 px-4 border-b text-center">Importance</th>
                      <th className="py-2 px-4 border-b text-left">Justification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.suggestedImpacts.map((impact, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-2 px-4 border-b">{impact.activityName || impact.activityId}</td>
                        <td className="py-2 px-4 border-b">{impact.componentName || impact.componentId}</td>
                        <td className={`py-2 px-4 border-b text-center font-medium ${
                          impact.magnitude < 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {impact.magnitude}
                        </td>
                        <td className="py-2 px-4 border-b text-center">{impact.importance}</td>
                        <td className="py-2 px-4 border-b">{impact.justification}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => analyzeProject()}
                  disabled={analyzing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  {analyzing ? 'Analyse en cours...' : 'Relancer l\'analyse'}
                </button>
                
                <Link
                  href={`/projects/${projectId}`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Voir la matrice mise à jour
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
