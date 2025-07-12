"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

interface EnvironmentalComponent {
  id: string;
  name: string;
  description: string | null;
  category: string;
  projectId: string;
}

export default function EditComponentPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const componentId = params.componentId as string;

  const [component, setComponent] = useState<EnvironmentalComponent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'physique',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les données du composant
  useEffect(() => {
    const fetchComponent = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/components/${componentId}`);
        if (!response.ok) {
          throw new Error('Composante environnementale non trouvée');
        }
        const data = await response.json();
        setComponent(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          category: data.category || 'physique',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la composante');
      } finally {
        setLoading(false);
      }
    };

    fetchComponent();
  }, [projectId, componentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/components/${componentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la modification de la composante environnementale');
      }

      // Rediriger vers la page du projet
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette composante environnementale ? Cette action supprimera également tous les impacts associés.')) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/components/${componentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de la composante environnementale');
      }

      // Rediriger vers la page du projet
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-3xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline inline-block">
              &larr; Retour au projet
            </Link>
            <ThemeToggle />
          </div>
          <h1 className="text-2xl font-bold">Chargement de la composante environnementale...</h1>
        </header>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !component) {
    return (
      <div className="min-h-screen p-8 max-w-3xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline inline-block">
              &larr; Retour au projet
            </Link>
            <ThemeToggle />
          </div>
          <h1 className="text-2xl font-bold">Erreur</h1>
        </header>
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline inline-block">
            &larr; Retour au projet
          </Link>
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-bold">Modifier la composante environnementale</h1>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nom de la composante *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Catégorie *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="physique">Physique</option>
            <option value="biologique">Biologique</option>
            <option value="social">Social</option>
            <option value="economique">Économique</option>
            <option value="culturel">Culturel</option>
          </select>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Suppression...' : 'Supprimer'}
          </button>
          
          <div className="flex space-x-2">
            <Link
              href={`/projects/${projectId}`}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Annuler
            </Link>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
