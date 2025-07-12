import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { impactSchema } from '@/lib/validations/leopold-matrix';
import { z } from 'zod';

// GET /api/projects/[id]/impacts - Récupérer tous les impacts d'un projet
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
    
    // Récupérer les impacts du projet avec leurs relations
    const impacts = await prisma.impact.findMany({
      where: { projectId },
      include: {
        activity: true,
        environmentalComponent: true,
      },
      orderBy: { importance: 'desc' },
    });
    
    return NextResponse.json(impacts);
  } catch (error) {
    console.error('Erreur lors de la récupération des impacts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des impacts' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/impacts - Créer un nouvel impact pour un projet
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
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
    const validatedData = impactSchema.parse({
      ...body,
      projectId,
    });
    
    // Vérifier si l'activité existe et appartient au projet
    const activity = await prisma.activity.findFirst({
      where: {
        id: validatedData.activityId,
        projectId,
      },
    });
    
    if (!activity) {
      return NextResponse.json(
        { error: 'Activité non trouvée ou n\'appartient pas à ce projet' },
        { status: 404 }
      );
    }
    
    // Vérifier si la composante environnementale existe et appartient au projet
    const component = await prisma.environmentalComponent.findFirst({
      where: {
        id: validatedData.environmentalComponentId,
        projectId,
      },
    });
    
    if (!component) {
      return NextResponse.json(
        { error: 'Composante environnementale non trouvée ou n\'appartient pas à ce projet' },
        { status: 404 }
      );
    }
    
    // Création de l'impact
    const impact = await prisma.impact.create({
      data: validatedData,
    });
    
    return NextResponse.json(impact, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'impact:', error);
    
    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'impact' },
      { status: 500 }
    );
  }
}
