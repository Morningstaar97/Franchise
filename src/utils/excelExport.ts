import * as XLSX from 'xlsx';
import { FranchiseConfig, CalculationResult, SavedDossier } from '../types';
import { calculateFranchise } from './calculator';

export function exportToExcel(
  config: FranchiseConfig,
  currentResult: CalculationResult,
  savedDossiers: SavedDossier[] = []
) {
  const wb = XLSX.utils.book_new();

  // 1. Feuille Principale : "Calculateur Franchise"
  const isVar = config.franchiseType === 'variable';
  const mainSheetData: (string | number)[][] = [
    ['CALCUL DE FRANCHISE DÉGRESSIVE D’ASSURANCE'],
    ['Généré automatiquement via le Calculateur Expert'],
    [],
    ['PARAMÈTRES DU DOSSIER', 'VALEUR', 'UNITÉ / DÉTAIL'],
    ["Montant du rapport d'expertise", config.expertiseAmount, '€'],
    ['Type de franchise', isVar ? 'Variable / Proportionnelle' : 'Fixe', ''],
  ];

  if (isVar) {
    mainSheetData.push(
      ['Base fixe franchise', config.variableBase, '€'],
      ["Taux sur montant d'expertise", config.variableRate / 100, '%'],
      ['Plafond maximum', config.hasMaxCap ? config.maxCap : 'Sans plafond', config.hasMaxCap ? '€' : ''],
      ['Formule brute appliquée', `Base (${config.variableBase}€) + ${config.variableRate}% * Expertise [Max: ${config.maxCap}€]`, '']
    );
  } else {
    mainSheetData.push(
      ['Montant de la franchise fixe', config.fixedAmount, '€']
    );
  }

  mainSheetData.push(
    ['Taux de dégressivité sélectionné', config.degressivityRate / 100, '%'],
    [],
    ['RÉSULTATS FINANCIERS', 'MONTANT (€)', 'PART DU DOMMAGE'],
    ['Franchise brute initiale', currentResult.franchiseBrute, ''],
    ['Économie dégressivité (réduction)', currentResult.degressivityDiscount, `${config.degressivityRate}% de réduction`],
    ['FRANCHISE NETTE À PAYER (ASSURÉ)', currentResult.franchiseNette, `${currentResult.tauxResteACharge.toFixed(2)} %`],
    ['PRISE EN CHARGE COMPAGNIE', currentResult.partAssureur, `${(100 - currentResult.tauxResteACharge).toFixed(2)} %`],
    [],
    ['FORMULE EXCEL ASSOCIÉE', '', ''],
    [
      'Formule directe :',
      isVar
        ? `=MIN(${config.hasMaxCap ? config.maxCap : 99999}; ${config.variableBase} + ${config.variableRate}% * B5) * (1 - B10)`
        : `=${config.fixedAmount} * (1 - B10)`,
      'Prend en compte la base, le % et la dégressivité'
    ]
  );

  const wsMain = XLSX.utils.aoa_to_sheet(mainSheetData);

  // Styling column widths
  wsMain['!cols'] = [
    { wch: 38 },
    { wch: 20 },
    { wch: 45 },
  ];

  XLSX.utils.book_append_sheet(wb, wsMain, 'Calculateur');

  // 2. Feuille : "Barème Dégressivité 5% à 9%"
  const rates = [0, 5, 6, 7, 8, 9, 10, 15];
  const baremeData: (string | number)[][] = [
    [`SIMULATION COMPARATIVE POUR UN RAPPORT DE ${config.expertiseAmount} €`],
    [`Type : ${isVar ? `Variable (${config.variableBase}€ + ${config.variableRate}%, max ${config.maxCap}€)` : `Fixe (${config.fixedAmount}€)`}`],
    [],
    [
      'Taux Dégressivité',
      'Franchise Brute (€)',
      'Réduction (€)',
      'Franchise Nette (€)',
      'Prise en charge Assureur (€)',
      'Économie vs Sans dégressivité (€)',
      '% Reste à charge'
    ],
  ];

  rates.forEach((rate) => {
    const res = calculateFranchise({ ...config, degressivityRate: rate });
    const zeroRes = calculateFranchise({ ...config, degressivityRate: 0 });
    const economie = zeroRes.franchiseNette - res.franchiseNette;

    baremeData.push([
      rate === 0 ? '0% (Standard)' : `${rate} %`,
      Number(res.franchiseBrute.toFixed(2)),
      Number(res.degressivityDiscount.toFixed(2)),
      Number(res.franchiseNette.toFixed(2)),
      Number(res.partAssureur.toFixed(2)),
      Number(economie.toFixed(2)),
      `${res.tauxResteACharge.toFixed(1)} %`
    ]);
  });

  const wsBareme = XLSX.utils.aoa_to_sheet(baremeData);
  wsBareme['!cols'] = [
    { wch: 20 },
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
    { wch: 28 },
    { wch: 32 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsBareme, 'Barème 5% à 9%');

  // 3. Feuille : "Matrice Multi-Montants"
  const sampleAmounts = [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000];
  const matrixData: (string | number)[][] = [
    ['MATRICE MULTI-MONTANTS (FRANCHISE NETTE EN FONCTION DU RAPPORT ET DE LA DÉGRESSIVITÉ)'],
    ['Base de calcul : ' + (isVar ? `Variable (${config.variableBase}€ + ${config.variableRate}%, max ${config.maxCap}€)` : `Fixe (${config.fixedAmount}€)`)],
    [],
    ['Montant Expertise (€)', 'Sans dég. (0%)', 'Dég. 5%', 'Dég. 6%', 'Dég. 7%', 'Dég. 8%', 'Dég. 9%']
  ];

  sampleAmounts.forEach((amt) => {
    const baseCfg = { ...config, expertiseAmount: amt };
    const f0 = calculateFranchise({ ...baseCfg, degressivityRate: 0 }).franchiseNette;
    const f5 = calculateFranchise({ ...baseCfg, degressivityRate: 5 }).franchiseNette;
    const f6 = calculateFranchise({ ...baseCfg, degressivityRate: 6 }).franchiseNette;
    const f7 = calculateFranchise({ ...baseCfg, degressivityRate: 7 }).franchiseNette;
    const f8 = calculateFranchise({ ...baseCfg, degressivityRate: 8 }).franchiseNette;
    const f9 = calculateFranchise({ ...baseCfg, degressivityRate: 9 }).franchiseNette;

    matrixData.push([
      amt,
      Number(f0.toFixed(2)),
      Number(f5.toFixed(2)),
      Number(f6.toFixed(2)),
      Number(f7.toFixed(2)),
      Number(f8.toFixed(2)),
      Number(f9.toFixed(2)),
    ]);
  });

  const wsMatrix = XLSX.utils.aoa_to_sheet(matrixData);
  wsMatrix['!cols'] = [
    { wch: 24 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Grille Multi-Montants');

  // 4. Feuille : "Dossiers Enregistrés" (si existants)
  if (savedDossiers.length > 0) {
    const dossiersData: (string | number)[][] = [
      ['HISTORIQUE DES DOSSIERS DE SINISTRE / EXPERTISE'],
      [],
      [
        'Réf. Dossier',
        'Date',
        'Client / Assuré',
        'Véhicule / Objet',
        'Montant Expertise (€)',
        'Type',
        'Taux Dégressivité',
        'Franchise Brute (€)',
        'Réduction (€)',
        'Franchise Nette (€)',
        'Prise en charge Assureur (€)'
      ]
    ];

    savedDossiers.forEach((d) => {
      dossiersData.push([
        d.reference,
        d.date,
        d.clientName || 'N/A',
        d.vehicleOrClaim || 'N/A',
        d.config.expertiseAmount,
        d.config.franchiseType === 'variable' ? 'Variable' : 'Fixe',
        `${d.config.degressivityRate} %`,
        Number(d.result.franchiseBrute.toFixed(2)),
        Number(d.result.degressivityDiscount.toFixed(2)),
        Number(d.result.franchiseNette.toFixed(2)),
        Number(d.result.partAssureur.toFixed(2))
      ]);
    });

    const wsDossiers = XLSX.utils.aoa_to_sheet(dossiersData);
    wsDossiers['!cols'] = [
      { wch: 16 },
      { wch: 14 },
      { wch: 22 },
      { wch: 20 },
      { wch: 22 },
      { wch: 14 },
      { wch: 18 },
      { wch: 20 },
      { wch: 16 },
      { wch: 20 },
      { wch: 26 },
    ];
    XLSX.utils.book_append_sheet(wb, wsDossiers, 'Historique Dossiers');
  }

  // Écriture et téléchargement
  const filename = `calcul-franchise-degressive-${Date.now().toString().slice(-6)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
