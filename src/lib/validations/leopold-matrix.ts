import { z } from 'zod';

// Validation pour les projets
export const projectSchema = z.object({
  name: z.string().min(3, { message: "Le nom du projet doit contenir au moins 3 caractères" }),
  description: z.string().optional(),
});

// Validation pour les activités
export const activitySchema = z.object({
  name: z.string().min(3, { message: "Le nom de l'activité doit contenir au moins 3 caractères" }),
  description: z.string().optional(),
  phase: z.enum(['preparation', 'construction', 'exploitation', 'maintenance'], {
    message: "La phase doit être l'une des suivantes : préparation, construction, exploitation, maintenance"
  }),
  projectId: z.string().uuid({ message: "L'ID du projet doit être un UUID valide" }),
});

// Validation pour les composantes environnementales
export const environmentalComponentSchema = z.object({
  name: z.string().min(3, { message: "Le nom de la composante doit contenir au moins 3 caractères" }),
  description: z.string().optional(),
  category: z.enum(['physique', 'biologique', 'social', 'economique'], {
    message: "La catégorie doit être l'une des suivantes : physique, biologique, social, économique"
  }),
  projectId: z.string().uuid({ message: "L'ID du projet doit être un UUID valide" }),
});

// Validation pour les impacts
export const impactSchema = z.object({
  magnitude: z.number().int().min(-10).max(10).refine(val => val !== 0, {
    message: "La magnitude doit être comprise entre -10 et +10, et ne peut pas être 0"
  }),
  importance: z.number().int().min(1).max(10),
  description: z.string().optional(),
  mitigationMeasures: z.string().optional(),
  projectId: z.string().uuid({ message: "L'ID du projet doit être un UUID valide" }),
  activityId: z.string().uuid({ message: "L'ID de l'activité doit être un UUID valide" }),
  environmentalComponentId: z.string().uuid({ message: "L'ID de la composante environnementale doit être un UUID valide" }),
});

// Schéma pour la création d'une matrice complète
export const createMatrixSchema = z.object({
  project: projectSchema,
  activities: z.array(activitySchema.omit({ projectId: true })).min(1),
  components: z.array(environmentalComponentSchema.omit({ projectId: true })).min(1),
});

// Schéma pour l'analyse d'impact
export const impactAnalysisSchema = z.object({
  impactId: z.string().uuid(),
  description: z.string().min(10),
});
