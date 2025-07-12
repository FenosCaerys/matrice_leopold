import OpenAI from 'openai';

// Initialisation du client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types pour l'analyse d'impact
export interface ImpactAnalysisRequest {
  activityName: string;
  activityDescription?: string;
  componentName: string;
  componentCategory: string;
  componentDescription?: string;
  magnitude?: number; // Optionnel car l'IA peut le déterminer
  importance?: number; // Optionnel car l'IA peut le déterminer
}

export interface ImpactAnalysisResult {
  analysis: string;
  magnitude: number;
  importance: number;
  mitigationMeasures: string[];
  justification: string;
}

// Types pour l'analyse de projet
export interface ProjectAnalysisRequest {
  projectName: string;
  projectDescription?: string;
  activities: {
    id: string;
    name: string;
    description?: string;
    phase: string;
  }[];
  components: {
    id: string;
    name: string;
    description?: string;
    category: string;
  }[];
}

export interface ProjectAnalysisResult {
  suggestedImpacts: {
    activityId: string;
    componentId: string;
    magnitude: number;
    importance: number;
    justification: string;
  }[];
  summary: string;
}

export interface PGESGenerationRequest {
  projectName: string;
  projectDescription?: string;
  impacts: {
    activityName: string;
    activityPhase: string;
    componentName: string;
    componentCategory: string;
    magnitude: number;
    importance: number;
    analysis?: string;
  }[];
}

export interface PGESGenerationResult {
  summary: string;
  prioritizedImpacts: {
    activityName: string;
    componentName: string;
    magnitude: number;
    importance: number;
    priority: 'Élevée' | 'Moyenne' | 'Faible';
  }[];
  recommendations: {
    category: string;
    measures: string[];
  }[];
  monitoringPlan: {
    indicator: string;
    frequency: string;
    responsibleParty: string;
  }[];
}

/**
 * Service pour analyser les impacts environnementaux en utilisant l'API OpenAI
 */
export class OpenAIService {
  /**
   * Analyse un impact environnemental spécifique ou génère une évaluation
   * @param impact Les détails de l'impact à analyser
   * @returns Une analyse détaillée avec magnitude, importance et mesures d'atténuation
   */
  public static async analyzeImpact(impact: ImpactAnalysisRequest): Promise<ImpactAnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(impact);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4", // Utiliser le modèle le plus avancé disponible
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en évaluation d'impact environnemental spécialisé dans l'utilisation de la matrice de Léopold. Votre tâche est d'analyser l'interaction entre une activité de projet et une composante environnementale, puis d'attribuer une magnitude et une importance à cet impact, de le justifier et de proposer des mesures d'atténuation appropriées."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || "";
      
      // Traiter la réponse pour extraire l'analyse, la magnitude, l'importance et les mesures d'atténuation
      const analysisResult = this.parseAnalysisResponse(content, impact);
      
      return analysisResult;
    } catch (error) {
      console.error("Erreur lors de l'analyse avec OpenAI:", error);
      throw new Error("Échec de l'analyse d'impact. Veuillez réessayer plus tard.");
    }
  }

  /**
   * Analyse un projet et suggère les impacts pertinents à évaluer
   * @param project Les détails du projet à analyser
   * @returns Une liste d'impacts suggérés avec leur évaluation préliminaire
   */
  public static async analyzeProject(project: ProjectAnalysisRequest): Promise<ProjectAnalysisResult> {
    try {
      const prompt = this.buildProjectAnalysisPrompt(project);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4", // Utiliser le modèle le plus avancé disponible
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en évaluation d'impact environnemental spécialisé dans l'utilisation de la matrice de Léopold. Votre tâche est d'identifier les interactions pertinentes entre les activités d'un projet et les composantes environnementales, puis de suggérer une évaluation préliminaire de ces impacts."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || "";
      
      // Traiter la réponse pour extraire les impacts suggérés
      return this.parseProjectAnalysisResponse(content, project);
    } catch (error) {
      console.error("Erreur lors de l'analyse du projet avec OpenAI:", error);
      throw new Error("Échec de l'analyse du projet. Veuillez réessayer plus tard.");
    }
  }

  /**
   * Génère un Plan de Gestion Environnementale et Sociale (PGES) pour un projet
   * @param request Les détails du projet et ses impacts
   * @returns Un PGES complet avec priorisation des impacts et recommandations
   */
  public static async generatePGES(request: PGESGenerationRequest): Promise<PGESGenerationResult> {
    try {
      const prompt = this.buildPGESPrompt(request);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4", // Utiliser le modèle le plus avancé disponible
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en gestion environnementale et sociale spécialisé dans l'élaboration de Plans de Gestion Environnementale et Sociale (PGES) pour des projets de génie civil. Votre tâche est de prioriser les impacts identifiés et de proposer des mesures de gestion adaptées."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || "";
      
      // Traiter la réponse pour extraire le PGES
      return this.parsePGESResponse(content);
    } catch (error) {
      console.error("Erreur lors de la génération du PGES avec OpenAI:", error);
      throw new Error("Échec de la génération du PGES. Veuillez réessayer plus tard.");
    }
  }

  /**
   * Construit le prompt pour l'analyse d'impact
   */
  private static buildAnalysisPrompt(impact: ImpactAnalysisRequest): string {
    const hasPredefinedValues = impact.magnitude !== undefined && impact.importance !== undefined;
    
    return `
Analyser l'impact environnemental suivant selon la méthodologie de la matrice de Léopold:

ACTIVITÉ DU PROJET:
- Nom: ${impact.activityName}
${impact.activityDescription ? `- Description: ${impact.activityDescription}` : ''}

COMPOSANTE ENVIRONNEMENTALE AFFECTÉE:
- Nom: ${impact.componentName}
- Catégorie: ${impact.componentCategory}
${impact.componentDescription ? `- Description: ${impact.componentDescription}` : ''}

${hasPredefinedValues ? `ÉVALUATION DE L'IMPACT:
- Magnitude: ${impact.magnitude} (échelle de -10 à +10)
- Importance: ${impact.importance} (échelle de 1 à 10)

Veuillez fournir:
1. Une justification détaillée de cette évaluation, expliquant pourquoi cet impact a cette magnitude et cette importance.
2. Une analyse approfondie des conséquences potentielles de cet impact.
3. Une liste de mesures d'atténuation spécifiques et concrètes qui pourraient être mises en œuvre.` : 
`Veuillez évaluer cet impact et fournir:
1. Une magnitude sur une échelle de -10 à +10 (négatif pour les impacts défavorables, positif pour les impacts favorables, jamais 0).
2. Une importance sur une échelle de 1 à 10 (1 = peu important, 10 = très important).
3. Une justification détaillée de cette évaluation.
4. Une analyse approfondie des conséquences potentielles de cet impact.
5. Une liste de mesures d'atténuation spécifiques et concrètes qui pourraient être mises en œuvre.`}

Format de réponse souhaité:
${hasPredefinedValues ? '' : 'MAGNITUDE: [Valeur numérique entre -10 et +10, sauf 0]\nIMPORTANCE: [Valeur numérique entre 1 et 10]\n'}
JUSTIFICATION: [Justification de l'évaluation]
ANALYSE: [Votre analyse détaillée]
MESURES D'ATTÉNUATION:
- [Mesure 1]
- [Mesure 2]
- [etc.]
`;
  }

  /**
   * Construit le prompt pour l'analyse de projet
   */
  private static buildProjectAnalysisPrompt(project: ProjectAnalysisRequest): string {
    // Construire les listes d'activités et de composantes
    const activitiesList = project.activities.map(a => 
      `- ID: ${a.id}, Nom: ${a.name}, Phase: ${a.phase}${a.description ? `, Description: ${a.description}` : ''}`
    ).join('\n');
    
    const componentsList = project.components.map(c => 
      `- ID: ${c.id}, Nom: ${c.name}, Catégorie: ${c.category}${c.description ? `, Description: ${c.description}` : ''}`
    ).join('\n');
    
    return `
Analyser le projet suivant et identifier les interactions pertinentes entre les activités et les composantes environnementales selon la méthodologie de la matrice de Léopold:

PROJET:
- Nom: ${project.projectName}
${project.projectDescription ? `- Description: ${project.projectDescription}` : ''}

ACTIVITÉS DU PROJET:
${activitiesList}

COMPOSANTES ENVIRONNEMENTALES:
${componentsList}

Veuillez identifier les interactions pertinentes (25-50 sur l'ensemble des possibilités) entre les activités et les composantes environnementales, et fournir pour chacune:
1. L'ID de l'activité et l'ID de la composante concernées
2. Une magnitude estimée sur une échelle de -10 à +10 (négatif pour les impacts défavorables, positif pour les impacts favorables, jamais 0)
3. Une importance estimée sur une échelle de 1 à 10 (1 = peu important, 10 = très important)
4. Une brève justification de cette évaluation (1-2 phrases)

Veuillez également fournir une synthèse narrative globale du projet et de ses principaux enjeux environnementaux.

Format de réponse souhaité:
IMPACTS SUGGÉRÉS:
1. Activité ID: [ID], Composante ID: [ID], Magnitude: [Valeur], Importance: [Valeur], Justification: [Brève justification]
2. Activité ID: [ID], Composante ID: [ID], Magnitude: [Valeur], Importance: [Valeur], Justification: [Brève justification]
[etc.]

SYNTHÈSE NARRATIVE:
[Votre synthèse narrative du projet et de ses principaux enjeux environnementaux]
`;
  }

  /**
   * Construit le prompt pour la génération du PGES
   */
  private static buildPGESPrompt(request: PGESGenerationRequest): string {
    // Construire la liste des impacts
    const impactsList = request.impacts.map(i => 
      `- Activité: ${i.activityName} (${i.activityPhase}), Composante: ${i.componentName} (${i.componentCategory}), ` +
      `Magnitude: ${i.magnitude}, Importance: ${i.importance}${i.analysis ? `, Analyse: ${i.analysis}` : ''}`
    ).join('\n');
    
    return `
Générer un Plan de Gestion Environnementale et Sociale (PGES) pour le projet suivant:

PROJET:
- Nom: ${request.projectName}
${request.projectDescription ? `- Description: ${request.projectDescription}` : ''}

IMPACTS IDENTIFIÉS:
${impactsList}

Veuillez fournir:
1. Une synthèse des principaux enjeux environnementaux et sociaux du projet
2. Une priorisation des impacts (élevée, moyenne, faible) basée sur leur magnitude et leur importance
3. Des recommandations de mesures correctives regroupées par catégorie (ex: eau, air, biodiversité, social)
4. Un plan de suivi avec des indicateurs, leur fréquence de mesure et les responsables

Format de réponse souhaité:
SYNTHÈSE:
[Votre synthèse des principaux enjeux]

PRIORISATION DES IMPACTS:
1. Activité: [Nom], Composante: [Nom], Magnitude: [Valeur], Importance: [Valeur], Priorité: [Élevée/Moyenne/Faible]
2. Activité: [Nom], Composante: [Nom], Magnitude: [Valeur], Importance: [Valeur], Priorité: [Élevée/Moyenne/Faible]
[etc.]

RECOMMANDATIONS:
1. Catégorie: [Nom de la catégorie]
   - [Mesure 1]
   - [Mesure 2]
   [etc.]
2. Catégorie: [Nom de la catégorie]
   - [Mesure 1]
   - [Mesure 2]
   [etc.]

PLAN DE SUIVI:
1. Indicateur: [Nom de l'indicateur], Fréquence: [Fréquence de mesure], Responsable: [Partie responsable]
2. Indicateur: [Nom de l'indicateur], Fréquence: [Fréquence de mesure], Responsable: [Partie responsable]
[etc.]
`;
  }

  /**
   * Analyse la réponse d'OpenAI pour extraire l'analyse d'impact
   */
  private static parseAnalysisResponse(content: string, request: ImpactAnalysisRequest): ImpactAnalysisResult {
    // Extraction de la magnitude (si elle n'est pas déjà fournie)
    let magnitude = request.magnitude !== undefined ? request.magnitude : 0;
    if (request.magnitude === undefined) {
      const magnitudeMatch = content.match(/MAGNITUDE:\s*([+-]?\d+)/i);
      if (magnitudeMatch) {
        magnitude = parseInt(magnitudeMatch[1]);
      }
    }
    
    // Extraction de l'importance (si elle n'est pas déjà fournie)
    let importance = request.importance !== undefined ? request.importance : 5;
    if (request.importance === undefined) {
      const importanceMatch = content.match(/IMPORTANCE:\s*(\d+)/i);
      if (importanceMatch) {
        importance = parseInt(importanceMatch[1]);
      }
    }
    
    // Extraction de la justification
    const justificationMatch = content.match(/JUSTIFICATION:(.*?)(?=ANALYSE:|$)/s);
    const justification = justificationMatch ? justificationMatch[1].trim() : '';
    
    // Extraction de l'analyse
    const analysisMatch = content.match(/ANALYSE:(.*?)(?=MESURES D'ATTÉNUATION:|$)/s);
    const analysis = analysisMatch ? analysisMatch[1].trim() : content;

    // Extraction des mesures d'atténuation
    const measuresMatch = content.match(/MESURES D'ATTÉNUATION:(.*?)$/s);
    let mitigationMeasures: string[] = [];
    
    if (measuresMatch) {
      mitigationMeasures = measuresMatch[1]
        .split('-')
        .map(measure => measure.trim())
        .filter(measure => measure.length > 0);
    }

    return {
      magnitude,
      importance,
      justification,
      analysis,
      mitigationMeasures
    };
  }

  /**
   * Analyse la réponse d'OpenAI pour extraire l'analyse de projet
   */
  private static parseProjectAnalysisResponse(content: string, project: ProjectAnalysisRequest): ProjectAnalysisResult {
    const suggestedImpacts: ProjectAnalysisResult['suggestedImpacts'] = [];
    
    // Extraction des impacts suggérés
    const impactsSection = content.match(/IMPACTS SUGGÉRÉS:(.*?)(?=SYNTHÈSE NARRATIVE:|$)/s);
    if (impactsSection) {
      const impactsText = impactsSection[1].trim();
      const impactRegex = /Activité ID:\s*([^,]+),\s*Composante ID:\s*([^,]+),\s*Magnitude:\s*([+-]?\d+),\s*Importance:\s*(\d+),\s*Justification:\s*([^\n]+)/g;
      
      let match;
      while ((match = impactRegex.exec(impactsText)) !== null) {
        const [, activityId, componentId, magnitudeStr, importanceStr, justification] = match;
        
        suggestedImpacts.push({
          activityId: activityId.trim(),
          componentId: componentId.trim(),
          magnitude: parseInt(magnitudeStr),
          importance: parseInt(importanceStr),
          justification: justification.trim()
        });
      }
    }
    
    // Extraction de la synthèse narrative
    const summaryMatch = content.match(/SYNTHÈSE NARRATIVE:(.*?)$/s);
    const summary = summaryMatch ? summaryMatch[1].trim() : '';
    
    return {
      suggestedImpacts,
      summary
    };
  }

  /**
   * Analyse la réponse d'OpenAI pour extraire le PGES
   */
  private static parsePGESResponse(content: string): PGESGenerationResult {
    // Extraction de la synthèse
    const summaryMatch = content.match(/SYNTHÈSE:(.*?)(?=PRIORISATION DES IMPACTS:|$)/s);
    const summary = summaryMatch ? summaryMatch[1].trim() : '';
    
    // Extraction des impacts priorisés
    const prioritizedImpacts: PGESGenerationResult['prioritizedImpacts'] = [];
    const impactsSection = content.match(/PRIORISATION DES IMPACTS:(.*?)(?=RECOMMANDATIONS:|$)/s);
    if (impactsSection) {
      const impactsText = impactsSection[1].trim();
      const impactRegex = /Activité:\s*([^,]+),\s*Composante:\s*([^,]+),\s*Magnitude:\s*([+-]?\d+),\s*Importance:\s*(\d+),\s*Priorité:\s*(Élevée|Moyenne|Faible)/g;
      
      let match;
      while ((match = impactRegex.exec(impactsText)) !== null) {
        const [, activityName, componentName, magnitudeStr, importanceStr, priority] = match;
        
        prioritizedImpacts.push({
          activityName: activityName.trim(),
          componentName: componentName.trim(),
          magnitude: parseInt(magnitudeStr),
          importance: parseInt(importanceStr),
          priority: priority as 'Élevée' | 'Moyenne' | 'Faible'
        });
      }
    }
    
    // Extraction des recommandations
    const recommendations: PGESGenerationResult['recommendations'] = [];
    const recommendationsSection = content.match(/RECOMMANDATIONS:(.*?)(?=PLAN DE SUIVI:|$)/s);
    if (recommendationsSection) {
      const recommendationsText = recommendationsSection[1].trim();
      const categoryRegex = /Catégorie:\s*([^\n]+)\n([\s\S]*?)(?=\d+\.\s*Catégorie:|$)/g;
      
      let categoryMatch;
      while ((categoryMatch = categoryRegex.exec(recommendationsText)) !== null) {
        const [, category, measuresText] = categoryMatch;
        const measures = measuresText
          .split('-')
          .map(measure => measure.trim())
          .filter(measure => measure.length > 0);
        
        recommendations.push({
          category: category.trim(),
          measures
        });
      }
    }
    
    // Extraction du plan de suivi
    const monitoringPlan: PGESGenerationResult['monitoringPlan'] = [];
    const monitoringSection = content.match(/PLAN DE SUIVI:(.*?)$/s);
    if (monitoringSection) {
      const monitoringText = monitoringSection[1].trim();
      const indicatorRegex = /Indicateur:\s*([^,]+),\s*Fréquence:\s*([^,]+),\s*Responsable:\s*([^\n]+)/g;
      
      let indicatorMatch;
      while ((indicatorMatch = indicatorRegex.exec(monitoringText)) !== null) {
        const [, indicator, frequency, responsibleParty] = indicatorMatch;
        
        monitoringPlan.push({
          indicator: indicator.trim(),
          frequency: frequency.trim(),
          responsibleParty: responsibleParty.trim()
        });
      }
    }
    
    return {
      summary,
      prioritizedImpacts,
      recommendations,
      monitoringPlan
    };
  }
}
