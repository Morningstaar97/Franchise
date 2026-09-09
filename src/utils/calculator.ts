import { FranchiseConfig, CalculationResult, ComparisonRow } from '../types';

export function calculateFranchise(config: FranchiseConfig): CalculationResult {
  const {
    expertiseAmount,
    franchiseType,
    fixedAmount,
    variableBase,
    variableRate,
    hasMaxCap,
    maxCap,
    hasMinFloor,
    minFloor,
    degressivityRate,
  } = config;

  let rawFranchise = 0;
  let isCapped = false;
  let isFloored = false;

  if (franchiseType === 'fixe') {
    rawFranchise = fixedAmount;
    if (hasMaxCap && rawFranchise > maxCap) {
      rawFranchise = maxCap;
      isCapped = true;
    }
    if (hasMinFloor && rawFranchise < minFloor) {
      rawFranchise = minFloor;
      isFloored = true;
    }
  } else {
    // Variable: Base + (Taux% * Montant de l'expertise)
    const computed = variableBase + (expertiseAmount * (variableRate / 100));
    rawFranchise = computed;

    if (hasMaxCap && computed > maxCap) {
      rawFranchise = maxCap;
      isCapped = true;
    }
    if (hasMinFloor && rawFranchise < minFloor) {
      rawFranchise = minFloor;
      isFloored = true;
    }
  }

  // Bounded by total expertise if repairs are smaller than deductible
  const franchiseBrute = Math.min(rawFranchise, expertiseAmount);

  // Calcul de la dégressivité
  const safeDegressivityRate = Math.max(0, degressivityRate);
  const degressivityDiscount = (franchiseBrute * safeDegressivityRate) / 100;
  const franchiseNette = Math.max(0, franchiseBrute - degressivityDiscount);
  const partAssureur = Math.max(0, expertiseAmount - franchiseNette);
  const tauxResteACharge = expertiseAmount > 0 ? (franchiseNette / expertiseAmount) * 100 : 0;

  return {
    expertiseAmount,
    franchiseBrute,
    isCapped,
    isFloored,
    degressivityRate: safeDegressivityRate,
    degressivityDiscount,
    franchiseNette,
    partAssureur,
    tauxResteACharge,
  };
}

export function generateComparisonRows(config: FranchiseConfig, customRates: number[] = [5, 6, 7, 8, 9]): ComparisonRow[] {
  return customRates.map((rate) => {
    const res = calculateFranchise({ ...config, degressivityRate: rate });
    const zeroRes = calculateFranchise({ ...config, degressivityRate: 0 });
    const savingsVsZero = zeroRes.franchiseNette - res.franchiseNette;
    const percentageSaved = zeroRes.franchiseNette > 0 ? (savingsVsZero / zeroRes.franchiseNette) * 100 : 0;

    return {
      rate,
      franchiseBrute: res.franchiseBrute,
      discount: res.degressivityDiscount,
      franchiseNette: res.franchiseNette,
      partAssureur: res.partAssureur,
      savingsVsZero,
      percentageSaved,
    };
  });
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatPercent(rate: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rate || 0) + ' %';
}

/**
 * Génère la formule Excel prête à l'emploi selon les paramètres configurés
 */
export function generateExcelFormulas(config: FranchiseConfig) {
  const isVar = config.franchiseType === 'variable';
  const cap = config.hasMaxCap ? config.maxCap : null;
  const base = isVar ? config.variableBase : config.fixedAmount;
  const ratePct = config.variableRate / 100;

  // En supposant que:
  // A2 = Montant expertise
  // B2 = Taux dégressivité (ex: 5% ou 0,05)

  let rawFormulaFR = '';
  let rawFormulaEN = '';

  if (isVar) {
    if (cap !== null) {
      rawFormulaFR = `=MIN(${cap}; ${base} + ${config.variableRate}% * A2) * (1 - B2)`;
      rawFormulaEN = `=MIN(${cap}, ${base} + ${config.variableRate}% * A2) * (1 - B2)`;
    } else {
      rawFormulaFR = `=(${base} + ${config.variableRate}% * A2) * (1 - B2)`;
      rawFormulaEN = `=(${base} + ${config.variableRate}% * A2) * (1 - B2)`;
    }
  } else {
    rawFormulaFR = `=${base} * (1 - B2)`;
    rawFormulaEN = `=${base} * (1 - B2)`;
  }

  return {
    rawFormulaFR,
    rawFormulaEN,
    explanation: [
      { cell: 'A2', description: "Montant du rapport d'expertise (€)" },
      { cell: 'B2', description: 'Taux de dégressivité (ex: 5% ou 0,05)' },
      {
        cell: 'C2',
        description: isVar
          ? `Franchise nette avec base ${base} € + ${config.variableRate}% d'expertise${cap ? ` plafonné à ${cap} €` : ''} déduit de la dégressivité`
          : `Franchise fixe de ${base} € déduite de la dégressivité`,
      },
    ],
  };
}
