import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { projectSchema } from '@/lib/validations/leopold-matrix';
import { z } from 'zod';

// GET /api/projects/[id] - Récupérer un projet spécifique avec ses activités et composantes
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Utiliser params.id comme une promesse
    const projectId = params.id;
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        activities: true,
        components: true,
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
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du projet' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Mettre à jour un projet
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Utiliser params.id comme une promesse
    const projectId = params.id;
    const body = await req.json();
    
    // Validation avec Zod
    const validatedData = projectSchema.parse(body);
    
    // Vérifier si le projet existe
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Mise à jour du projet
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: validatedData,
    });
    
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    
    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du projet' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Supprimer un projet
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Utiliser params.id comme une promesse
    const projectId = params.id;
    
    // Vérifier si le projet existe
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Suppression du projet (les relations seront supprimées en cascade grâce à onDelete: Cascade)
    await prisma.project.delete({
      where: { id: projectId },
    });
    
    return NextResponse.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du projet' },
      { status: 500 }
    );
  }
}
