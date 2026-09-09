import React from 'react';
import { FranchiseConfig } from '../types';
import { generateComparisonRows, formatEuro } from '../utils/calculator';
import { Table, Check, ArrowRight } from 'lucide-react';

interface ComparisonMatrixProps {
  config: FranchiseConfig;
  onSelectRate: (rate: number) => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  config,
  onSelectRate,
}) => {
  const comparisonRates = [0, 5, 6, 7, 8, 9];
  const rows = generateComparisonRows(config, comparisonRates);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 font-display">
              Barème Comparatif Dégressivité (5% à 9%)
            </h3>
            <p className="text-xs text-slate-500">
              Impact direct de chaque taux de réduction sur le montant d'expertise actuel ({formatEuro(config.expertiseAmount)})
            </p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 self-start sm:self-auto">
          Cliquez sur un taux pour l'appliquer
        </span>
      </div>

      <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Taux Dégressivité</th>
              <th className="py-2.5 px-3">Franchise Brute</th>
              <th className="py-2.5 px-3 text-emerald-700">Réduction Dégressivité</th>
              <th className="py-2.5 px-3 font-bold text-slate-800">Franchise Nette</th>
              <th className="py-2.5 px-3">Prise en charge Assureur</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const isSelected = config.degressivityRate === row.rate;
              const isZero = row.rate === 0;

              return (
                <tr
                  key={row.rate}
                  onClick={() => onSelectRate(row.rate)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-50/80 font-medium'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-bold ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isZero
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isZero ? '0% (Standard)' : `-${row.rate}%`}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Actif
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-600">
                    {formatEuro(row.franchiseBrute)}
                  </td>

                  <td className="py-3 px-3 text-emerald-700 font-semibold">
                    {isZero ? (
                      <span className="text-slate-400 font-normal">0,00 €</span>
                    ) : (
                      <span>-{formatEuro(row.discount)}</span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`text-sm font-bold ${
                        isSelected ? 'text-emerald-800' : 'text-slate-900'
                      }`}
                    >
                      {formatEuro(row.franchiseNette)}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {formatEuro(row.partAssureur)}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRate(row.rate);
                      }}
                      className={`text-xs px-2 py-1 rounded-lg transition-all inline-flex items-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{isSelected ? 'Sélectionné' : 'Appliquer'}</span>
                      {!isSelected && <ArrowRight className="w-3 h-3" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
        <p>
          💡 Plus le taux de dégressivité est élevé (jusqu'à 9%), plus la franchise nette à payer par l'assuré diminue.
        </p>
        <span className="text-emerald-700 font-medium">
          Économie max (9% vs 0%) : +{formatEuro(rows[rows.length - 1]?.savingsVsZero || 0)}
        </span>
      </div>
    </div>
  );
};
