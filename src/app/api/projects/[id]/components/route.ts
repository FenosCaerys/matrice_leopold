import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { environmentalComponentSchema } from '@/lib/validations/leopold-matrix';
import { z } from 'zod';

// Schéma pour la validation des paramètres d'URL
const paramsSchema = z.object({
  id: z.string().uuid(),
});

// Schéma pour la validation des paramètres d'URL avec componentId
const componentParamsSchema = z.object({
  id: z.string().uuid(),
  componentId: z.string().uuid(),
});

// GET /api/projects/[id]/components - Récupérer toutes les composantes environnementales d'un projet
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    
    // Vérifier si le projet existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Récupérer les composantes environnementales du projet
    const components = await prisma.environmentalComponent.findMany({
      where: { projectId },
      orderBy: { category: 'asc' },
    });
    
    return NextResponse.json(components);
  } catch (error) {
    console.error('Erreur lors de la récupération des composantes environnementales:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des composantes environnementales' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/components - Créer une nouvelle composante environnementale pour un projet
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Valider les paramètres d'URL
    const { id: projectId } = params instanceof Promise ? paramsSchema.parse(await params) : paramsSchema.parse(params);
    const body = await req.json();
    
    // Vérifier si le projet existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Validation avec Zod
    const validatedData = environmentalComponentSchema.omit({ projectId: true }).parse(body);
    
    // Création de la composante environnementale
    const component = await prisma.environmentalComponent.create({
      data: {
        ...validatedData,
        projectId,
      },
    });
    
    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la composante environnementale:', error);
    
    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la composante environnementale' },
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
    const { id: projectId, componentId } = componentParamsSchema.parse(params);
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
    const { id: projectId, componentId } = componentParamsSchema.parse(params);
    
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
