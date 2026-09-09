import React from 'react';
import { FranchiseConfig, FranchiseType } from '../types';
import { Calculator, Sparkles, Percent, Euro, ArrowUpDown, Sliders } from 'lucide-react';

interface FranchiseFormProps {
  config: FranchiseConfig;
  onChange: (updated: FranchiseConfig) => void;
  onResetToDefaults: () => void;
}

export const FranchiseForm: React.FC<FranchiseFormProps> = ({
  config,
  onChange,
  onResetToDefaults,
}) => {
  const quickAmounts = [800, 1500, 2500, 3500, 4800];
  const degressivityPresets = [5, 6, 7, 8, 9];

  const handleAmountChange = (val: number) => {
    onChange({
      ...config,
      expertiseAmount: Math.max(0, val),
    });
  };

  const handleTypeChange = (type: FranchiseType) => {
    onChange({
      ...config,
      franchiseType: type,
    });
  };

  const handleDegressivityChange = (rate: number) => {
    onChange({
      ...config,
      degressivityRate: Math.max(0, Math.min(100, rate)),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 font-display">
              Paramètres du Dossier d'Expertise
            </h2>
            <p className="text-xs text-slate-500">
              Renseignez les données du rapport et les clauses du contrat
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onResetToDefaults}
          className="text-xs text-slate-500 hover:text-emerald-700 hover:underline flex items-center gap-1 transition-colors"
          title="Réinitialiser avec 300€ + 10% max 600€"
        >
          <span>Exemple par défaut</span>
        </button>
      </div>

      {/* 1. Montant du rapport d'expertise */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <label
            htmlFor="expertiseAmountInput"
            className="block text-sm font-semibold text-slate-800"
          >
            Montant du rapport d'expertise (€)
          </label>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            Dommages évalués
          </span>
        </div>

        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Euro className="w-5 h-5" />
          </div>
          <input
            id="expertiseAmountInput"
            type="number"
            min="0"
            step="50"
            value={config.expertiseAmount || ''}
            onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
            className="block w-full pl-10 pr-16 py-3 text-lg font-bold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            placeholder="Ex: 2500"
          />
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500 text-sm font-medium">
            EUR TTC
          </div>
        </div>

        {/* Montants rapides */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-400 mr-1">Exemples rapides :</span>
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleAmountChange(amt)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                config.expertiseAmount === amt
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {amt.toLocaleString('fr-FR')} €
            </button>
          ))}
        </div>
      </div>

      {/* 2. Type de franchise (Fixe ou Variable) */}
      <div className="space-y-3 mb-6">
        <label className="block text-sm font-semibold text-slate-800">
          Type de franchise contractuelle
        </label>

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('variable')}
            className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              config.franchiseType === 'variable'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Franchise Variable</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('fixe')}
            className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              config.franchiseType === 'fixe'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpDown className="w-4 h-4 text-slate-600" />
            <span>Franchise Fixe</span>
          </button>
        </div>

        {/* Paramètres selon le type */}
        {config.franchiseType === 'variable' ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Formule proportionnelle avec plafond</span>
              <span className="text-emerald-700 font-mono bg-emerald-100/70 px-2 py-0.5 rounded">
                Base + {config.variableRate}% (Max {config.maxCap} €)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Base fixe (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={config.variableBase}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        variableBase: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">€</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Pourcentage rapport (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={config.variableRate}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        variableRate: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600">
                    Plafond max (€)
                  </label>
                  <button
                    type="button"
                    onClick={() => onChange({ ...config, hasMaxCap: !config.hasMaxCap })}
                    className="text-[11px] text-emerald-700 underline"
                  >
                    {config.hasMaxCap ? 'Actif' : 'Désactivé'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    disabled={!config.hasMaxCap}
                    value={config.hasMaxCap ? config.maxCap : ''}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        maxCap: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    placeholder="Sans plafond"
                    className={`w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 ${
                      config.hasMaxCap ? 'bg-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  />
                  {config.hasMaxCap && (
                    <span className="absolute right-3 top-2 text-xs text-slate-400">€</span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 italic">
              Conformément à votre demande : base de <strong>{config.variableBase} €</strong> +{' '}
              <strong>{config.variableRate}%</strong> du rapport d'expertise, avec un plafond de{' '}
              <strong>{config.hasMaxCap ? `${config.maxCap} €` : 'illimité'}</strong>.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Montant fixe contractuel</span>
              <span className="text-slate-600 font-mono bg-slate-200/70 px-2 py-0.5 rounded">
                Montant invariable
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Franchise fixe (€)
              </label>
              <div className="relative max-w-xs">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={config.fixedAmount}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      fixedAmount: Math.max(0, parseFloat(e.target.value) || 0),
                    })
                  }
                  className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-slate-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">€</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-slate-400">Paliers habituels :</span>
              {[150, 250, 300, 380, 450, 600].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange({ ...config, fixedAmount: val })}
                  className={`px-2 py-0.5 text-xs rounded-md border ${
                    config.fixedAmount === val
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {val} €
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Dégressivité sélectionnable de 9% à 5% (critère central du prompt) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-800">
            Taux de Dégressivité (Sélectionnable de 5% à 9%)
          </label>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            Actuel : -{config.degressivityRate}%
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Choisissez le taux de réduction applicable à la franchise (ex: années d'ancienneté, clause sans sinistre ou geste commercial) :
        </p>

        {/* Chips de sélection directe 5% à 9% */}
        <div className="grid grid-cols-6 gap-1.5">
          <button
            type="button"
            onClick={() => handleDegressivityChange(0)}
            className={`py-2 px-1.5 text-xs font-semibold rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
              config.degressivityRate === 0
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px] text-slate-400">Sans</span>
            <span className="font-bold">0%</span>
          </button>

          {degressivityPresets.map((rate) => {
            const isSelected = config.degressivityRate === rate;
            return (
              <button
                key={rate}
                type="button"
                onClick={() => handleDegressivityChange(rate)}
                className={`py-2 px-1.5 text-xs font-semibold rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-200'
                    : 'bg-emerald-50/50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
                }`}
              >
                <span className="text-[10px] opacity-80">Palier</span>
                <span className="font-bold text-sm">-{rate}%</span>
              </button>
            );
          })}
        </div>

        {/* Curseur / saisie personnalisée fine */}
        <div className="pt-2 flex items-center gap-3">
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={config.degressivityRate}
              onChange={(e) => handleDegressivityChange(parseFloat(e.target.value) || 0)}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0%</span>
              <span className="font-medium text-emerald-700">5%</span>
              <span className="font-medium text-emerald-700">9%</span>
              <span>15%</span>
              <span>25%</span>
            </div>
          </div>

          <div className="w-20 relative shrink-0">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={config.degressivityRate}
              onChange={(e) => handleDegressivityChange(parseFloat(e.target.value) || 0)}
              className="w-full pl-2 pr-6 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg text-center"
            />
            <span className="absolute right-2 top-1.5 text-xs text-slate-400">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
