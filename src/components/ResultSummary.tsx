import React, { useState } from 'react';
import { CalculationResult, FranchiseConfig } from '../types';
import { formatEuro, formatPercent } from '../utils/calculator';
import {
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Copy,
  Check,
  BookmarkPlus,
} from 'lucide-react';

interface ResultSummaryProps {
  config: FranchiseConfig;
  result: CalculationResult;
  onSaveDossier: () => void;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({
  config,
  result,
  onSaveDossier,
}) => {
  const [copied, setCopied] = useState(false);

  const isVar = config.franchiseType === 'variable';
  const pctAssureur = result.expertiseAmount > 0
    ? (result.partAssureur / result.expertiseAmount) * 100
    : 0;

  const handleCopySummary = () => {
    const text = `--- SYNTHÈSE FRANCHISE DÉGRESSIVE ---
Montant de l'expertise : ${formatEuro(result.expertiseAmount)}
Formule : ${isVar ? `Variable (${config.variableBase}€ + ${config.variableRate}%, max ${config.maxCap}€)` : `Fixe (${config.fixedAmount}€)`}
Franchise brute : ${formatEuro(result.franchiseBrute)}${result.isCapped ? ' (Plafonnée)' : ''}
Dégressivité (${result.degressivityRate}%) : -${formatEuro(result.degressivityDiscount)}
-------------------------------------
FRANCHISE NETTE À PAYER : ${formatEuro(result.franchiseNette)}
Prise en charge Compagnie : ${formatEuro(result.partAssureur)} (${pctAssureur.toFixed(1)}%)
Reste à charge assuré : ${result.tauxResteACharge.toFixed(1)}%`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* En-tête statut */}
      <div className="bg-slate-900 text-white p-5 md:p-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Calcul instantané
          </span>
          {result.isCapped && (
            <span className="text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Plafond max de {config.maxCap} € atteint
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <div className="text-xs text-slate-400 mb-1">
              Franchise nette restant à payer (Assuré)
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              {formatEuro(result.franchiseNette)}
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-1">
              <span>Soit</span>
              <strong className="text-emerald-400">
                {result.tauxResteACharge.toFixed(1)} %
              </strong>
              <span>du montant total des dommages</span>
            </div>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
            <div className="text-xs text-slate-400 mb-1">
              Prise en charge par l'assurance
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-display">
              {formatEuro(result.partAssureur)}
            </div>
            <div className="text-xs text-slate-300 mt-1">
              ({pctAssureur.toFixed(1)} % couvert par la compagnie)
            </div>
          </div>
        </div>

        {/* Barre de répartition visuelle */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
              Assuré : {formatEuro(result.franchiseNette)}
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Assureur : {formatEuro(result.partAssureur)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, Math.max(0, result.tauxResteACharge))}%` }}
              className="bg-amber-400 transition-all duration-300"
              title={`Franchise assuré: ${result.tauxResteACharge.toFixed(1)}%`}
            />
            <div
              style={{ width: `${Math.min(100, Math.max(0, pctAssureur))}%` }}
              className="bg-emerald-500 transition-all duration-300"
              title={`Prise en charge assureur: ${pctAssureur.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>

      {/* Détails financiers */}
      <div className="p-5 md:p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Décomposition du calcul
        </h3>

        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
            <span className="text-slate-600 flex items-center gap-1.5">
              <span>Montant du rapport d'expertise</span>
            </span>
            <span className="font-semibold text-slate-900">
              {formatEuro(result.expertiseAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
            <span className="text-slate-600">
              {isVar ? (
                <span>
                  Franchise variable brute ({config.variableBase}€ + {config.variableRate}%)
                </span>
              ) : (
                <span>Franchise fixe initiale</span>
              )}
            </span>
            <div className="text-right">
              <span className="font-semibold text-slate-900">
                {formatEuro(result.franchiseBrute)}
              </span>
              {result.isCapped && (
                <div className="text-[10px] text-amber-600 font-medium">Plafonné à {config.maxCap}€</div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-emerald-700 bg-emerald-50/70 px-2.5 rounded-lg">
            <span className="font-medium flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>Dégressivité appliquée (-{result.degressivityRate}%)</span>
            </span>
            <span className="font-bold">
              -{formatEuro(result.degressivityDiscount)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 text-base font-bold text-slate-900">
            <span>Reste à charge net (Franchise finale)</span>
            <span className="text-emerald-700 font-display text-lg">
              {formatEuro(result.franchiseNette)}
            </span>
          </div>
        </div>

        {/* Boutons d'actions rapides */}
        <div className="pt-3 flex flex-wrap items-center gap-2 no-print">
          <button
            type="button"
            onClick={onSaveDossier}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors"
          >
            <BookmarkPlus className="w-4 h-4 text-slate-600" />
            <span>Enregistrer dossier</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Copier synthèse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
