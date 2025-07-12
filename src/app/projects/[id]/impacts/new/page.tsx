"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Activity {
  id: string;
  name: string;
  phase: string;
}

interface EnvironmentalComponent {
  id: string;
  name: string;
  category: string;
}

export default function NewImpactPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  
  // Récupérer les paramètres de l'URL s'ils existent
  const preselectedActivityId = searchParams.get('activityId');
  const preselectedComponentId = searchParams.get('componentId');

  const [impact, setImpact] = useState({
    magnitude: 0,
    importance: 5,
    description: '',
    activityId: preselectedActivityId || '',
    environmentalComponentId: preselectedComponentId || '',
  });
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [components, setComponents] = useState<EnvironmentalComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les activités et composantes du projet
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les activités
        const activitiesResponse = await fetch(`/api/projects/${projectId}/activities`);
        if (!activitiesResponse.ok) {
          throw new Error('Erreur lors de la récupération des activités');
        }
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData);

        // Récupérer les composantes
        const componentsResponse = await fetch(`/api/projects/${projectId}/components`);
        if (!componentsResponse.ok) {
          throw new Error('Erreur lors de la récupération des composantes');
        }
        const componentsData = await componentsResponse.json();
        setComponents(componentsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/impacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...impact,
          projectId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de l\'impact');
      }

      // Rediriger vers la page du projet
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-3xl mx-auto">
        <div className="text-center py-12">
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline mb-2 inline-block">
          &larr; Retour à la matrice
        </Link>
        <h1 className="text-2xl font-bold">Ajouter un impact</h1>
      </header>

      <main>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {activities.length === 0 || components.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
            <p className="font-medium">Impossible de créer un impact</p>
            <p className="mt-1">
              Vous devez d'abord ajouter des activités et des composantes environnementales à votre projet.
            </p>
            <div className="mt-3 flex gap-3">
              <Link
                href={`/projects/${projectId}/activities/new`}
                className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded-md text-sm"
              >
                Ajouter des activités
              </Link>
              <Link
                href={`/projects/${projectId}/components/new`}
                className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded-md text-sm"
              >
                Ajouter des composantes
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label htmlFor="activityId" className="block mb-2 font-medium">
                Activité *
              </label>
              <select
                id="activityId"
                value={impact.activityId}
                onChange={(e) => setImpact({ ...impact, activityId: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                required
              >
                <option value="">Sélectionner une activité</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name} ({activity.phase})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="environmentalComponentId" className="block mb-2 font-medium">
                Composante environnementale *
              </label>
              <select
                id="environmentalComponentId"
                value={impact.environmentalComponentId}
                onChange={(e) => setImpact({ ...impact, environmentalComponentId: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                required
              >
                <option value="">Sélectionner une composante</option>
                {components.map((component) => (
                  <option key={component.id} value={component.id}>
                    {component.name} ({component.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="magnitude" className="block mb-2 font-medium">
                Magnitude * (-10 à +10, sauf 0)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="magnitude"
                  min="-10"
                  max="10"
                  step="1"
                  value={impact.magnitude === 0 ? 1 : impact.magnitude}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setImpact({ ...impact, magnitude: value === 0 ? 1 : value });
                  }}
                  className="w-full mr-4"
                />
                <span className="font-bold text-lg w-10 text-center">{impact.magnitude}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Négatif = impact défavorable, Positif = impact favorable
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="importance" className="block mb-2 font-medium">
                Importance * (1 à 10)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="importance"
                  min="1"
                  max="10"
                  step="1"
                  value={impact.importance}
                  onChange={(e) => setImpact({ ...impact, importance: parseInt(e.target.value) })}
                  className="w-full mr-4"
                />
                <span className="font-bold text-lg w-10 text-center">{impact.importance}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                1 = peu important, 10 = très important
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block mb-2 font-medium">
                Description de l'impact
              </label>
              <textarea
                id="description"
                value={impact.description}
                onChange={(e) => setImpact({ ...impact, description: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                rows={3}
                placeholder="Décrivez l'impact et sa justification..."
              />
            </div>

            <div className="flex justify-end">
              <Link
                href={`/projects/${projectId}`}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md mr-2"
              >
                Annuler
              </Link>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                disabled={submitting}
              >
                {submitting ? 'Création en cours...' : 'Créer l\'impact'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
