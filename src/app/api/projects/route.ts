import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { projectSchema } from '@/lib/validations/leopold-matrix';
import { z } from 'zod';

// GET /api/projects - Récupérer tous les projets
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Créer un nouveau projet
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validation avec Zod
    const validatedData = projectSchema.parse(body);
    
    // Création du projet dans la base de données
    const project = await prisma.project.create({
      data: validatedData,
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    
    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}
