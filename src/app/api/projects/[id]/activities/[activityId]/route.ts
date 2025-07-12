import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { activitySchema } from '@/lib/validations/leopold-matrix';
import { z } from 'zod';

// Schéma pour la validation des paramètres d'URL
const paramsSchema = z.object({
  id: z.string().uuid(),
  activityId: z.string().uuid(),
});

// GET /api/projects/[id]/activities/[activityId] - Récupérer une activité spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    // Valider les paramètres d'URL
    const { id: projectId, activityId } = params instanceof Promise ? paramsSchema.parse(await params) : paramsSchema.parse(params);
    
    // Vérifier si l'activité existe et appartient au projet
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        projectId: projectId,
      },
    });
    
    if (!activity) {
      return NextResponse.json(
        { error: 'Activité non trouvée ou n\'appartient pas à ce projet' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error);
    
    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'activité' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/activities/[activityId] - Modifier une activité existante
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    // Valider les paramètres d'URL
    const { id: projectId, activityId } = params instanceof Promise ? paramsSchema.parse(await params) : paramsSchema.parse(params);
    const body = await req.json();
    
    // Valider les données de la requête
    const validatedData = activitySchema.parse(body);
    
    // Vérifier si l'activité existe et appartient au projet
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        projectId: projectId,
      },
    });
    
    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Activité non trouvée ou n\'appartient pas à ce projet' },
        { status: 404 }
      );
    }
    
    // Mettre à jour l'activité
    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: validatedData,
    });
    
    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error('Erreur lors de la modification de l\'activité:', error);
    
    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l\'activité' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/activities/[activityId] - Supprimer une activité
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    // Valider les paramètres d'URL
    const { id: projectId, activityId } = params instanceof Promise ? paramsSchema.parse(await params) : paramsSchema.parse(params);
    
    // Vérifier si l'activité existe et appartient au projet
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        projectId: projectId,
      },
    });
    
    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Activité non trouvée ou n\'appartient pas à ce projet' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'activité est utilisée dans des impacts
    const impactsUsingActivity = await prisma.impact.findFirst({
      where: {
        activityId: activityId,
      },
    });
    
    if (impactsUsingActivity) {
      // Supprimer d'abord tous les impacts associés à cette activité
      await prisma.impact.deleteMany({
        where: {
          activityId: activityId,
        },
      });
    }
    
    // Supprimer l'activité
    await prisma.activity.delete({
      where: { id: activityId },
    });
    
    return NextResponse.json({ message: 'Activité supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'activité' },
      { status: 500 }
    );
  }
}
