"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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
  activity: {
    id: string;
    name: string;
    description: string | null;
    phase: string;
  };
  environmentalComponent: {
    id: string;
    name: string;
    description: string | null;
    category: string;
  };
}

export default function ImpactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const impactId = params.impactId as string;

  const [impact, setImpact] = useState<Impact | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les détails de l'impact
  useEffect(() => {
    const fetchImpact = async () => {
      try {
        // Récupérer tous les impacts du projet
        const response = await fetch(`/api/projects/${projectId}/impacts`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des impacts');
        }
        
        const impacts = await response.json();
        const foundImpact = impacts.find((imp: Impact) => imp.id === impactId);
        
        if (!foundImpact) {
          throw new Error('Impact non trouvé');
        }
        
        setImpact(foundImpact);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchImpact();
  }, [projectId, impactId]);

  // Fonction pour analyser l'impact avec OpenAI
  const analyzeImpact = async () => {
    if (!impact) return;
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/impacts/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          impactId: impact.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'analyse de l\'impact');
      }

      const data = await response.json();
      setImpact(data.impact);
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
          <p>Chargement des détails de l'impact...</p>
        </div>
      </div>
    );
  }

  if (error || !impact) {
    return (
      <div className="min-h-screen p-8 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error || "Impact non trouvé"}</p>
          <Link href={`/projects/${projectId}`} className="text-sm underline mt-2 inline-block">
            Retour au projet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline mb-2 inline-block">
          &larr; Retour à la matrice
        </Link>
        <h1 className="text-2xl font-bold">Détails de l'impact</h1>
      </header>

      <main>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Activité</h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium">{impact.activity.name}</h3>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                    {impact.activity.phase}
                  </span>
                </div>
                {impact.activity.description && (
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{impact.activity.description}</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Composante environnementale</h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium">{impact.environmentalComponent.name}</h3>
                  <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs">
                    {impact.environmentalComponent.category}
                  </span>
                </div>
                {impact.environmentalComponent.description && (
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{impact.environmentalComponent.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Évaluation de l'impact</h2>
            <div className="flex flex-wrap gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md flex-1">
                <h3 className="text-lg font-medium mb-2">Magnitude</h3>
                <div className={`text-3xl font-bold ${
                  impact.magnitude < 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {impact.magnitude}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {impact.magnitude < 0 
                    ? 'Impact négatif (défavorable)' 
                    : 'Impact positif (favorable)'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md flex-1">
                <h3 className="text-lg font-medium mb-2">Importance</h3>
                <div className="text-3xl font-bold">{impact.importance}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {impact.importance <= 3 
                    ? 'Faible importance' 
                    : impact.importance <= 7 
                      ? 'Importance modérée' 
                      : 'Haute importance'}
                </p>
              </div>
            </div>
          </div>

          {impact.description && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <p>{impact.description}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Analyse et mesures d'atténuation</h2>
          
          {!impact.aiAnalysis ? (
            <div className="text-center py-6">
              <p className="mb-4">Aucune analyse n'a encore été générée pour cet impact.</p>
              <button
                onClick={analyzeImpact}
                disabled={analyzing}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                {analyzing ? 'Analyse en cours...' : 'Analyser avec IA'}
              </button>
              {error && (
                <p className="text-red-600 mt-2">{error}</p>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Analyse</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                  <p className="whitespace-pre-line">{impact.aiAnalysis}</p>
                </div>
              </div>
              
              {impact.mitigationMeasures && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Mesures d'atténuation recommandées</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <ul className="list-disc pl-5 space-y-1">
                      {impact.mitigationMeasures.split('\n- ').map((measure, index) => (
                        measure.trim() && <li key={index}>{measure.replace('- ', '')}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="mt-6 text-right">
                <button
                  onClick={analyzeImpact}
                  disabled={analyzing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  {analyzing ? 'Analyse en cours...' : 'Régénérer l\'analyse'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
