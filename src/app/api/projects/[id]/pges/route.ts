import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { OpenAIService } from '@/lib/services/openai-service';

/**
 * Route pour générer un Plan de Gestion Environnementale et Sociale (PGES) pour un projet
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Utiliser params.id comme une promesse
    const projectId = params.id;

    // Récupérer les détails du projet avec ses impacts
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        impacts: {
          include: {
            activity: true,
            environmentalComponent: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    if (project.impacts.length === 0) {
      return NextResponse.json(
        { error: 'Le projet ne contient aucun impact à analyser' },
        { status: 400 }
      );
    }

    // Préparer les données pour la génération du PGES
    const pgesRequest = {
      projectName: project.name,
      projectDescription: project.description || undefined,
      impacts: project.impacts.map((impact: {
        activity: { name: string; phase: string };
        environmentalComponent: { name: string; category: string };
        magnitude: number;
        importance: number;
        aiAnalysis: string | null;
      }) => ({
        activityName: impact.activity.name,
        activityPhase: impact.activity.phase,
        componentName: impact.environmentalComponent.name,
        componentCategory: impact.environmentalComponent.category,
        magnitude: impact.magnitude,
        importance: impact.importance,
        analysis: impact.aiAnalysis || undefined,
      })),
    };

    // Générer le PGES avec OpenAI
    const pgesResult = await OpenAIService.generatePGES(pgesRequest);

    // Enregistrer le PGES dans la base de données
    // Note: Il faudrait ajouter un champ PGES au modèle Project dans le schéma Prisma
    // Pour l'instant, on retourne simplement le résultat

    return NextResponse.json({
      message: 'Génération du PGES réussie',
      pges: pgesResult,
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PGES:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PGES' },
      { status: 500 }
    );
  }
}
