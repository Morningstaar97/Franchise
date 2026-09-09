import React from 'react';
import { FranchiseConfig } from '../types';
import { calculateFranchise, formatEuro } from '../utils/calculator';
import { Layers } from 'lucide-react';

interface SensitivityGridProps {
  config: FranchiseConfig;
  onSelectAmountAndRate: (amount: number, rate: number) => void;
}

export const SensitivityGrid: React.FC<SensitivityGridProps> = ({
  config,
  onSelectAmountAndRate,
}) => {
  const amounts = [600, 1000, 1500, 2000, 2500, 3000, 4000, 5000];
  const rates = [5, 6, 7, 8, 9];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 font-display">
            Grille de Sensibilité Multi-Montants
          </h3>
          <p className="text-xs text-slate-500">
            Franchise nette calculée selon divers montants d'expertise et taux de dégressivité (5% à 9%)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Rapport d'expertise</th>
              <th className="py-2.5 px-3 text-slate-400">Sans dég. (0%)</th>
              {rates.map((r) => (
                <th
                  key={r}
                  className={`py-2.5 px-3 ${
                    config.degressivityRate === r
                      ? 'text-emerald-700 font-bold bg-emerald-50/50'
                      : 'text-slate-700'
                  }`}
                >
                  Dég. {r}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {amounts.map((amt) => {
              const isCurrentAmt = config.expertiseAmount === amt;
              const f0 = calculateFranchise({ ...config, expertiseAmount: amt, degressivityRate: 0 }).franchiseNette;

              return (
                <tr
                  key={amt}
                  className={`transition-colors ${
                    isCurrentAmt ? 'bg-slate-100/70 font-semibold' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    <span className="flex items-center gap-1.5">
                      {formatEuro(amt)}
                      {isCurrentAmt && (
                        <span className="text-[10px] bg-slate-800 text-white px-1.5 py-0.2 rounded">
                          Actuel
                        </span>
                      )}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-slate-500">
                    {formatEuro(f0)}
                  </td>

                  {rates.map((r) => {
                    const res = calculateFranchise({
                      ...config,
                      expertiseAmount: amt,
                      degressivityRate: r,
                    });
                    const isCellSelected = isCurrentAmt && config.degressivityRate === r;

                    return (
                      <td
                        key={r}
                        onClick={() => onSelectAmountAndRate(amt, r)}
                        className={`py-2.5 px-3 cursor-pointer transition-all ${
                          isCellSelected
                            ? 'bg-emerald-600 text-white font-bold rounded'
                            : config.degressivityRate === r
                            ? 'bg-emerald-50 text-emerald-800 font-medium'
                            : 'hover:text-emerald-700 hover:font-bold'
                        }`}
                        title={`Sélectionner ${amt} € avec ${r}% de dégressivité`}
                      >
                        {formatEuro(res.franchiseNette)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[11px] text-slate-400">
        💡 Cliquez sur n'importe quelle cellule pour appliquer directement ce montant et ce barème dans le calculateur principal.
      </div>
    </div>
  );
};
