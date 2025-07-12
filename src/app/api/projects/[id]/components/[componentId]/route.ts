import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { environmentalComponentSchema } from '@/lib/validations/leopold-matrix';
import { z } from 'zod';

// Schéma pour la validation des paramètres d'URL
const paramsSchema = z.object({
  id: z.string().uuid(),
  componentId: z.string().uuid(),
});

// GET /api/projects/[id]/components/[componentId] - Récupérer une composante environnementale spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; componentId: string } }
) {
  try {
    // Valider les paramètres d'URL
    const { id: projectId, componentId } = params instanceof Promise ? paramsSchema.parse(await params) : paramsSchema.parse(params);
    
    // Vérifier si la composante existe et appartient au projet
    const component = await prisma.environmentalComponent.findFirst({
      where: {
        id: componentId,
        projectId: projectId,
      },
    });
    
    if (!component) {
      return NextResponse.json(
        { error: 'Composante environnementale non trouvée ou n\'appartient pas à ce projet' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(component);
  } catch (error) {
    console.error('Erreur lors de la récupération de la composante environnementale:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la composante environnementale' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/components/[componentId] - Modifier une composante environnementale existante
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; componentId: string } }
) {
  try {
    // Valider les paramètres d'URL
    const { id: projectId, componentId } = params instanceof Promise ? paramsSchema.parse(await params) : paramsSchema.parse(params);
    const body = await req.json();
    
    // Valider les données de la requête
    const validatedData = environmentalComponentSchema.parse(body);
    
    // Vérifier si la composante existe et appartient au projet
    const existingComponent = await prisma.environmentalComponent.findFirst({
      where: {
        id: componentId,
        projectId: projectId,
      },
    });
    
    if (!existingComponent) {
      return NextResponse.json(
        { error: 'Composante environnementale non trouvée ou n\'appartient pas à ce projet' },
        { status: 404 }
      );
    }
    
    // Mettre à jour la composante
    const updatedComponent = await prisma.environmentalComponent.update({
      where: { id: componentId },
      data: validatedData,
    });
    
    return NextResponse.json(updatedComponent);
  } catch (error) {
    console.error('Erreur lors de la modification de la composante environnementale:', error);
    
    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la composante environnementale' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/components/[componentId] - Supprimer une composante environnementale
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; componentId: string } }
) {
  try {
    // Valider les paramètres d'URL
    const { id: projectId, componentId } = params instanceof Promise ? paramsSchema.parse(await params) : paramsSchema.parse(params);
    
    // Vérifier si la composante existe et appartient au projet
    const existingComponent = await prisma.environmentalComponent.findFirst({
      where: {
        id: componentId,
        projectId: projectId,
      },
    });
    
    if (!existingComponent) {
      return NextResponse.json(
        { error: 'Composante environnementale non trouvée ou n\'appartient pas à ce projet' },
        { status: 404 }
      );
    }
    
    // Vérifier si la composante est utilisée dans des impacts
    const impactsUsingComponent = await prisma.impact.findFirst({
      where: {
        environmentalComponentId: componentId,
      },
    });
    
    if (impactsUsingComponent) {
      // Supprimer d'abord tous les impacts associés à cette composante
      await prisma.impact.deleteMany({
        where: {
          environmentalComponentId: componentId,
        },
      });
    }
    
    // Supprimer la composante
    await prisma.environmentalComponent.delete({
      where: { id: componentId },
    });
    
    return NextResponse.json({ message: 'Composante environnementale supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la composante environnementale:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la composante environnementale' },
      { status: 500 }
    );
  }
}
