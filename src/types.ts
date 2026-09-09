export type FranchiseType = 'fixe' | 'variable';

export interface FranchiseConfig {
  expertiseAmount: number; // Montant du rapport d'expertise (€)
  franchiseType: FranchiseType; // 'fixe' ou 'variable'
  fixedAmount: number; // Pour franchise fixe (ex: 300 €)
  variableBase: number; // Base fixe pour franchise variable (ex: 300 €)
  variableRate: number; // Taux variable en pourcentage (ex: 10 pour 10%)
  hasMaxCap: boolean; // Plafond actif ou non
  maxCap: number; // Plafond max (ex: 600 €)
  hasMinFloor: boolean; // Seuil plancher actif ou non
  minFloor: number; // Plancher min (ex: 300 €)
  degressivityRate: number; // Taux de dégressivité en pourcentage (ex: 5 à 9%)
}

export interface CalculationResult {
  expertiseAmount: number;
  franchiseBrute: number;
  isCapped: boolean;
  isFloored: boolean;
  degressivityRate: number; // e.g. 5, 6, 7, 8, 9
  degressivityDiscount: number; // Montant économisé grâce à la dégressivité (€)
  franchiseNette: number; // Franchise finale à la charge de l'assuré (€)
  partAssureur: number; // Montant pris en charge par la compagnie (€)
  tauxResteACharge: number; // % du montant d'expertise payé par l'assuré
}

export interface ComparisonRow {
  rate: number;
  franchiseBrute: number;
  discount: number;
  franchiseNette: number;
  partAssureur: number;
  savingsVsZero: number;
  percentageSaved: number;
}

export interface SavedDossier {
  id: string;
  reference: string;
  date: string;
  clientName: string;
  vehicleOrClaim: string;
  config: FranchiseConfig;
  result: CalculationResult;
}
