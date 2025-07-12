import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { OpenAIService } from '@/lib/services/openai-service';

/**
 * Route pour analyser un projet et suggérer automatiquement des impacts pertinents
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Gérer le cas où params pourrait être une promesse
    const projectId = params instanceof Promise ? (await params).id : params.id;

    // Récupérer les détails du projet
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        activities: true,
        components: true, // Correction: utiliser 'components' au lieu de 'environmentalComponents'
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    // Préparer les données pour l'analyse
    const analysisRequest = {
      projectName: project.name,
      projectDescription: project.description || undefined,
      activities: project.activities.map((a: { id: string; name: string; description: string | null; phase: string }) => ({
        id: a.id,
        name: a.name,
        description: a.description || undefined,
        phase: a.phase,
      })),
      components: project.components.map((c: { id: string; name: string; description: string | null; category: string }) => ({
        id: c.id,
        name: c.name,
        description: c.description || undefined,
        category: c.category,
      })),
    };

    // Analyser le projet avec OpenAI
    const analysisResult = await OpenAIService.analyzeProject(analysisRequest);

    // Supprimer tous les impacts existants pour ce projet
    await prisma.impact.deleteMany({
      where: {
        projectId
      }
    });

    // Créer les impacts suggérés dans la base de données
    const createdImpacts = [];
    for (const suggestedImpact of analysisResult.suggestedImpacts) {
      // Trouver l'activité et le composant correspondants pour obtenir leurs noms
      const activity = project.activities.find((a: { id: string }) => a.id === suggestedImpact.activityId);
      const component = project.components.find((c: { id: string }) => c.id === suggestedImpact.componentId);
      
      if (!activity || !component) {
        console.warn(`Activité ou composant non trouvé pour l'impact: ${suggestedImpact.activityId} - ${suggestedImpact.componentId}`);
        continue;
      }
      
      // Créer un nouvel impact
      const impact = await prisma.impact.create({
        data: {
          magnitude: suggestedImpact.magnitude,
          importance: suggestedImpact.importance,
          description: suggestedImpact.justification,
          projectId,
          activityId: suggestedImpact.activityId,
          environmentalComponentId: suggestedImpact.componentId,
        },
      });
      
      // Ajouter l'impact avec les noms des activités et composants
      createdImpacts.push({
        ...impact,
        activityName: activity.name,
        componentName: component.name,
        activityPhase: activity.phase,
        componentCategory: component.category
      });
    }

    return NextResponse.json({
      message: 'Analyse du projet réussie',
      summary: analysisResult.summary,
      suggestedImpacts: analysisResult.suggestedImpacts.map((impact: any) => {
        const activity = project.activities.find((a: { id: string }) => a.id === impact.activityId);
        const component = project.components.find((c: { id: string }) => c.id === impact.componentId);
        
        return {
          ...impact,
          activityName: activity?.name || 'Activité inconnue',
          componentName: component?.name || 'Composant inconnu',
          activityPhase: activity?.phase || '',
          componentCategory: component?.category || ''
        };
      }),
      createdImpacts,
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse du projet:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse du projet' },
      { status: 500 }
    );
  }
}
