import * as XLSX from 'xlsx';

export interface ExcelExportParams {
  expertiseAmount: number;
  franchiseType: 'variable' | 'fixe';
  fixedAmount: number;
  baseAmount: number;
  ratePercent: number;
  maxCap: number;
  hasMaxCap: boolean;
  degressivityRate: number; // e.g. 10, 20, 30, 40, 50, or 0
  franchiseFinale: number;
  partAssureur: number;
}

export function generateInsuranceExcelFile(params: ExcelExportParams) {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // FEUILLE 1 : CALCULATEUR PROPORTIONNEL DYNAMIQUE
  // ==========================================
  const s1Data: (string | number)[][] = [
    ['CALCULATEUR DE FRANCHISE SINISTRE - MODÈLE OFFICIEL'],
    ['Ce fichier contient les formules automatiques pour le calcul de franchise assurance.'],
    [],
    ['1. PARAMÈTRES DU DOSSIER (À SAISIR)', 'VALEUR', 'UNITÉ / AIDE'],
    ['Montant des réparations / Rapport d’expertise', params.expertiseAmount || 1500, 'EUR TTC'],
    ['Base fixe de la franchise', params.baseAmount || 88, 'EUR'],
    ['Pourcentage applicable', (params.ratePercent || 8) / 100, '%'],
    ['Plafond maximum (0 si aucun)', params.hasMaxCap ? (params.maxCap || 208) : 0, 'EUR (0 si sans max)'],
    ['Taux de dégressivité', (params.degressivityRate || 0) / 100, '% (ex: 10%, 20%, 30%...)'],
    [],
    ['2. RÉSULTATS DU CALCUL AUTOMATIQUE', 'FORMULE EXCEL', 'MONTANT (€)'],
    ['Base fixe appliquée', '=B6', 0],
    ['Part proportionnelle calculée', '=ROUND(B5*B7, 2)', 0],
    ['Sous-total avant plafond', '=B12+B13', 0],
    ['Franchise brute (après plafond éventuel)', '=IF(B8>0, MIN(B8, B14), B14)', 0],
    ['Économie accordée par la dégressivité', '=ROUND(B15*B9, 2)', 0],
    ['FRANCHISE NETTE À DÉDUIRE', '=ROUND(B15*(1-B9), 2)', 0],
    ['PRISE EN CHARGE COMPAGNIE', '=MAX(0, B5-B17)', 0],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(s1Data);

  // Set formulas properly for SheetJS
  ws1['C12'] = { t: 'n', f: 'B6' };
  ws1['C13'] = { t: 'n', f: 'ROUND(B5*B7, 2)' };
  ws1['C14'] = { t: 'n', f: 'C12+C13' };
  ws1['C15'] = { t: 'n', f: 'IF(B8>0, MIN(B8, C14), C14)' };
  ws1['C16'] = { t: 'n', f: 'ROUND(C15*B9, 2)' };
  ws1['C17'] = { t: 'n', f: 'ROUND(C15*(1-B9), 2)' };
  ws1['C18'] = { t: 'n', f: 'MAX(0, B5-C17)' };

  ws1['!cols'] = [{ wch: 44 }, { wch: 22 }, { wch: 26 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Franchise Proportionnelle');

  // ==========================================
  // FEUILLE 2 : CALCULATEUR FRANCHISE FIXE
  // ==========================================
  const s2Data: (string | number)[][] = [
    ['CALCULATEUR DE FRANCHISE FIXE AVEC DÉGRESSIVITÉ'],
    [],
    ['PARAMÈTRES DU DOSSIER', 'VALEUR', 'UNITÉ'],
    ['Montant des réparations', params.expertiseAmount || 1500, 'EUR TTC'],
    ['Franchise contractuelle fixe', params.fixedAmount || 300, 'EUR'],
    ['Taux de dégressivité', (params.degressivityRate || 0) / 100, '% (10%, 20%, 30%...)'],
    [],
    ['RÉSULTATS', 'FORMULE EXCEL', 'MONTANT (€)'],
    ['Franchise brute contractuelle', '=B5', 0],
    ['Réduction dégressivité', '=ROUND(B5*B6, 2)', 0],
    ['FRANCHISE NETTE À RETENIR', '=ROUND(B5*(1-B6), 2)', 0],
    ['INDEMNITÉ COMPAGNIE', '=MAX(0, B4-C11)', 0],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(s2Data);
  ws2['C9'] = { t: 'n', f: 'B5' };
  ws2['C10'] = { t: 'n', f: 'ROUND(B5*B6, 2)' };
  ws2['C11'] = { t: 'n', f: 'ROUND(B5*(1-B6), 2)' };
  ws2['C12'] = { t: 'n', f: 'MAX(0, B4-C11)' };

  ws2['!cols'] = [{ wch: 38 }, { wch: 20 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Franchise Fixe');

  // ==========================================
  // FEUILLE 3 : BARÈME COMPARATIF DE DÉGRESSIVITÉ (0% à 50%)
  // ==========================================
  const base = params.baseAmount || 88;
  const pct = (params.ratePercent || 8) / 100;
  const max = params.hasMaxCap ? (params.maxCap || 208) : 999999;
  const rep = params.expertiseAmount || 1500;

  const rawGross = Math.min(max, base + rep * pct);

  const rates = [0, 10, 20, 30, 40, 50];
  const s3Data: (string | number)[][] = [
    ['SIMULATION COMPARATIVE - BARÈMES DE DÉGRESSIVITÉ (0% À 50%)'],
    [`Pour un rapport de réparations de ${rep} € TTC (Règle : ${base}€ + ${params.ratePercent || 8}%, max ${params.hasMaxCap ? `${params.maxCap}€` : 'aucun'})`],
    [],
    [
      'Taux Dégressivité',
      'Franchise Brute (€)',
      'Réduction (€)',
      'Franchise Nette (€)',
      'Prise en charge Compagnie (€)',
      'Économie réalisée (€)',
    ],
  ];

  rates.forEach((r) => {
    const discount = Math.round(rawGross * (r / 100) * 100) / 100;
    const net = Math.round((rawGross - discount) * 100) / 100;
    const comp = Math.max(0, Math.round((rep - net) * 100) / 100);
    const ecoVsZero = discount;

    s3Data.push([
      r === 0 ? '0% (Standard)' : `${r} %`,
      rawGross,
      discount,
      net,
      comp,
      ecoVsZero,
    ]);
  });

  const ws3 = XLSX.utils.aoa_to_sheet(s3Data);
  ws3['!cols'] = [
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
    { wch: 28 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'Barème Dégressivité 0-50%');

  // ==========================================
  // FEUILLE 4 : MATRICE MULTI-MONTANTS D'EXPERTISE
  // ==========================================
  const sampleDamages = [500, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000];
  const s4Data: (string | number)[][] = [
    ['MATRICE MULTI-MONTANTS - FRANCHISE NETTE SELON LES RÉPARATIONS'],
    [`Règle appliquée : Base ${base} € + ${params.ratePercent || 8} % (Plafond Max : ${params.hasMaxCap ? `${params.maxCap} €` : 'Aucun'})`],
    [],
    ['Montant Dommages (€)', '0% (Sans dég.)', 'Dég. 10%', 'Dég. 20%', 'Dég. 30%', 'Dég. 40%', 'Dég. 50%'],
  ];

  sampleDamages.forEach((amt) => {
    const raw = Math.min(max, base + amt * pct);
    s4Data.push([
      amt,
      Math.round(raw * 100) / 100,
      Math.round(raw * 0.9 * 100) / 100,
      Math.round(raw * 0.8 * 100) / 100,
      Math.round(raw * 0.7 * 100) / 100,
      Math.round(raw * 0.6 * 100) / 100,
      Math.round(raw * 0.5 * 100) / 100,
    ]);
  });

  const ws4 = XLSX.utils.aoa_to_sheet(s4Data);
  ws4['!cols'] = [
    { wch: 24 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws4, 'Grille Multi-Montants');

  // Déclencher le téléchargement du fichier .xlsx
  const filename = `calculateur-franchise-sinistre-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
