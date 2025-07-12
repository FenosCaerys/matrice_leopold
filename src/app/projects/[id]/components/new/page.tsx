"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewComponentPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [component, setComponent] = useState({
    name: '',
    description: '',
    category: 'physique',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(component),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la composante');
      }

      // Rediriger vers la page du projet
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline mb-2 inline-block">
          &larr; Retour au projet
        </Link>
        <h1 className="text-2xl font-bold">Ajouter une composante environnementale</h1>
      </header>

      <main>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2 font-medium">
              Nom de la composante *
            </label>
            <input
              type="text"
              id="name"
              value={component.name}
              onChange={(e) => setComponent({ ...component, name: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              required
              minLength={3}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block mb-2 font-medium">
              Catégorie *
            </label>
            <select
              id="category"
              value={component.category}
              onChange={(e) => setComponent({ ...component, category: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              required
            >
              <option value="physique">Physique (air, eau, sol)</option>
              <option value="biologique">Biologique (faune, flore)</option>
              <option value="social">Social (santé, sécurité)</option>
              <option value="economique">Économique (emploi, revenus)</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block mb-2 font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={component.description}
              onChange={(e) => setComponent({ ...component, description: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              rows={3}
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
              disabled={loading}
            >
              {loading ? 'Création en cours...' : 'Créer la composante'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
