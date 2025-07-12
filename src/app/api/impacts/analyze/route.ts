import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { OpenAIService, ImpactAnalysisRequest } from '@/lib/services/openai-service';
import { impactAnalysisSchema } from '@/lib/validations/leopold-matrix';
import { z } from 'zod';

// POST /api/impacts/analyze - Analyser un impact avec OpenAI
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validation avec Zod
    const { impactId } = impactAnalysisSchema.parse(body);
    
    // Récupérer l'impact avec ses relations
    const impact = await prisma.impact.findUnique({
      where: { id: impactId },
      include: {
        activity: true,
        environmentalComponent: true,
      },
    });
    
    if (!impact) {
      return NextResponse.json(
        { error: 'Impact non trouvé' },
        { status: 404 }
      );
    }
    
    // Préparer les données pour l'analyse
    const analysisRequest: ImpactAnalysisRequest = {
      activityName: impact.activity.name,
      activityDescription: impact.activity.description || undefined,
      componentName: impact.environmentalComponent.name,
      componentCategory: impact.environmentalComponent.category,
      componentDescription: impact.environmentalComponent.description || undefined,
      magnitude: impact.magnitude,
      importance: impact.importance,
    };
    
    // Appeler le service OpenAI pour analyser l'impact
    const analysisResult = await OpenAIService.analyzeImpact(analysisRequest);
    
    // Mettre à jour l'impact avec l'analyse
    const updatedImpact = await prisma.impact.update({
      where: { id: impactId },
      data: {
        aiAnalysis: analysisResult.analysis,
        mitigationMeasures: analysisResult.mitigationMeasures.join('\n- '),
      },
    });
    
    return NextResponse.json({
      impact: updatedImpact,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'impact:', error);
    
    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse de l\'impact' },
      { status: 500 }
    );
  }
}
