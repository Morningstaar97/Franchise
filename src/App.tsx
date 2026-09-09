import React, { useState } from 'react';
import {
  Shield,
  TrendingDown,
  Sparkles,
  ArrowUpDown,
  Euro,
  Info,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { generateInsuranceExcelFile } from './utils/excelExport';

export default function App() {
  // Type de franchise : 'variable' ou 'fixe'
  const [franchiseType, setFranchiseType] = useState<'variable' | 'fixe'>('variable');

  // Mode de saisie pour la franchise variable :
  // 'applicable_directe' : Le collaborateur saisit directement la franchise applicable (ex: 88€ + 8% max 208€)
  // 'contractuelle_avec_degressivite' : Le collaborateur saisit la contractuelle (ex: 110€ + 10% max 260€) et choisit le %
  const [variableMode, setVariableMode] = useState<'applicable_directe' | 'contractuelle_avec_degressivite'>('applicable_directe');

  // Tous les montants démarrent STRICTEMENT VIDES afin que le collaborateur insère toutes les valeurs
  const [expertiseAmount, setExpertiseAmount] = useState<string>('');

  // Franchise Fixe
  const [fixedAmount, setFixedAmount] = useState<string>('');

  // Franchise Variable - Saisie directe de la franchise applicable
  const [appBase, setAppBase] = useState<string>('');
  const [appRate, setAppRate] = useState<string>('');
  const [appMax, setAppMax] = useState<string>('');
  const [appHasMax, setAppHasMax] = useState<boolean>(true);

  // Franchise Variable - Saisie contractuelle + dégressivité
  const [contractBase, setContractBase] = useState<string>('');
  const [contractRate, setContractRate] = useState<string>('');
  const [contractMax, setContractMax] = useState<string>('');
  const [contractHasMax, setContractHasMax] = useState<boolean>(true);

  // Taux de dégressivité (10%, 20%, 30%, 40%, 50% ou 0%)
  const [degressivityRate, setDegressivityRate] = useState<number>(0);
  const [customDegressivity, setCustomDegressivity] = useState<string>('');

  // Efface le "0" lors du focus / clic
  const handleFocus = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    if (value === '0') {
      setter('');
    }
    e.target.select();
  };

  // Parsing des montants
  const parsedExpertise = parseFloat(expertiseAmount) || 0;
  const parsedFixed = parseFloat(fixedAmount) || 0;

  const effectiveDegressivity = customDegressivity !== '' 
    ? (parseFloat(customDegressivity) || 0)
    : degressivityRate;

  // Calcul des composantes utilisées
  let baseUtilisee = 0;
  let rateUtilise = 0;
  let maxUtilise = 0;
  let hasMaxUtilise = true;

  if (variableMode === 'applicable_directe') {
    baseUtilisee = parseFloat(appBase) || 0;
    rateUtilise = parseFloat(appRate) || 0;
    maxUtilise = parseFloat(appMax) || 0;
    hasMaxUtilise = appHasMax;
  } else {
    const factor = Math.max(0, 1 - effectiveDegressivity / 100);
    const rawBase = parseFloat(contractBase) || 0;
    const rawRate = parseFloat(contractRate) || 0;
    const rawMax = parseFloat(contractMax) || 0;

    baseUtilisee = Math.round(rawBase * factor * 100) / 100;
    rateUtilise = Math.round(rawRate * factor * 100) / 100;
    maxUtilise = Math.round(rawMax * factor * 100) / 100;
    hasMaxUtilise = contractHasMax;
  }

  // Calculs détaillés
  let partFixe = 0;
  let partProportionnelle = 0;
  let totalAvantPlafond = 0;
  let isCapped = false;
  let franchiseFinale = 0;

  if (franchiseType === 'fixe') {
    if (effectiveDegressivity > 0) {
      franchiseFinale = Math.max(0, parsedFixed * (1 - effectiveDegressivity / 100));
    } else {
      franchiseFinale = parsedFixed;
    }
    partFixe = franchiseFinale;
  } else {
    partFixe = baseUtilisee;
    partProportionnelle = parsedExpertise * (rateUtilise / 100);
    totalAvantPlafond = partFixe + partProportionnelle;

    let result = totalAvantPlafond;

    if (hasMaxUtilise && maxUtilise > 0 && result > maxUtilise) {
      result = maxUtilise;
      isCapped = true;
    }

    if (parsedExpertise > 0 && result > parsedExpertise) {
      result = parsedExpertise;
    }

    franchiseFinale = Math.max(0, result);
  }

  const partAssureur = Math.max(0, parsedExpertise - franchiseFinale);

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const handleDownloadExcel = () => {
    generateInsuranceExcelFile({
      expertiseAmount: parsedExpertise,
      franchiseType,
      fixedAmount: parsedFixed,
      baseAmount: baseUtilisee,
      ratePercent: rateUtilise,
      maxCap: maxUtilise,
      hasMaxCap: hasMaxUtilise,
      degressivityRate: effectiveDegressivity,
      franchiseFinale,
      partAssureur,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-3 sm:p-6 text-slate-800">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* En-tête sobre et épuré avec bouton Télécharger Excel */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 font-display">
              Calculateur de Franchise Sinistre
            </h1>
          </div>

          <button
            type="button"
            onClick={handleDownloadExcel}
            title="Télécharger la version Excel (.xlsx) avec formules automatiques"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Excel (.xlsx)</span>
            <Download className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>

        {/* Corps principal : Saisie des données */}
        <div className="p-5 sm:p-6 space-y-5">

          {/* 1. Sélectionner le type de franchise */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Type de franchise sur le dossier
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFranchiseType('variable')}
                className={`py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  franchiseType === 'variable'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Franchise Proportionnelle</span>
              </button>

              <button
                type="button"
                onClick={() => setFranchiseType('fixe')}
                className={`py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  franchiseType === 'fixe'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpDown className="w-4 h-4 text-slate-500" />
                <span>Franchise Fixe</span>
              </button>
            </div>
          </div>

          {/* 2. Montant du rapport d'expertise / Dommages (entièrement vide au démarrage) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <label
              htmlFor="expertiseDamagesInput"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              2. Montant des réparations / Rapport d'expertise (€)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Euro className="w-5 h-5" />
              </div>
              <input
                id="expertiseDamagesInput"
                type="number"
                min="0"
                step="any"
                value={expertiseAmount}
                onFocus={(e) => handleFocus(expertiseAmount, setExpertiseAmount, e)}
                onChange={(e) => setExpertiseAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-11 pr-20 py-2.5 text-base font-bold text-slate-900 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none placeholder:font-normal placeholder:text-slate-400"
              />
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none select-none">
                EUR TTC
              </span>
            </div>
          </div>

          {/* 3. Insérer les valeurs de l'outil */}
          {franchiseType === 'variable' ? (
            <div className="space-y-4">
              {/* Choix du mode d'insertion pour le collaborateur */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  3. Insérer les valeurs de l'outil
                </label>
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setVariableMode('applicable_directe')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      variableMode === 'applicable_directe'
                        ? 'bg-white text-emerald-800 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Franchise applicable directe
                  </button>
                  <button
                    type="button"
                    onClick={() => setVariableMode('contractuelle_avec_degressivite')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      variableMode === 'contractuelle_avec_degressivite'
                        ? 'bg-white text-emerald-800 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Contractuelle + Dégressivité
                  </button>
                </div>
              </div>

              {/* Mode 1 : Saisie directe de la franchise applicable (ex: 88€ + 8% Max 208€) */}
              {variableMode === 'applicable_directe' ? (
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <div className="text-xs text-emerald-900 font-medium flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Recopiez les montants affichés sur la ligne <strong>« Franchise applicable »</strong> de votre outil :
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Montant minimum / Base */}
                    <div>
                      <label
                        htmlFor="appBaseInput"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Base fixe (€)
                      </label>
                      <div className="relative">
                        <input
                          id="appBaseInput"
                          type="number"
                          min="0"
                          step="any"
                          value={appBase}
                          onFocus={(e) => handleFocus(appBase, setAppBase, e)}
                          onChange={(e) => setAppBase(e.target.value)}
                          placeholder="Ex: 88"
                          className="w-full pl-3 pr-7 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <span className="absolute right-2.5 top-2 text-xs font-medium text-slate-400">€</span>
                      </div>
                    </div>

                    {/* Pourcentage */}
                    <div>
                      <label
                        htmlFor="appRateInput"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Pourcentage (%)
                      </label>
                      <div className="relative">
                        <input
                          id="appRateInput"
                          type="number"
                          min="0"
                          step="any"
                          value={appRate}
                          onFocus={(e) => handleFocus(appRate, setAppRate, e)}
                          onChange={(e) => setAppRate(e.target.value)}
                          placeholder="Ex: 8"
                          className="w-full pl-3 pr-7 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <span className="absolute right-2.5 top-2 text-xs font-medium text-slate-400">%</span>
                      </div>
                    </div>

                    {/* Plafond Maximum */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="appMaxInput"
                          className="text-xs font-semibold text-slate-700"
                        >
                          Plafond Max (€)
                        </label>
                        <button
                          type="button"
                          onClick={() => setAppHasMax(!appHasMax)}
                          className="text-[10px] text-emerald-700 hover:underline font-medium"
                        >
                          {appHasMax ? 'Avec max' : 'Sans max'}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          id="appMaxInput"
                          type="number"
                          min="0"
                          step="any"
                          disabled={!appHasMax}
                          value={appHasMax ? appMax : ''}
                          onFocus={(e) => handleFocus(appMax, setAppMax, e)}
                          onChange={(e) => setAppMax(e.target.value)}
                          placeholder={appHasMax ? "Ex: 208" : "Sans max"}
                          className={`w-full pl-3 pr-7 py-2 text-sm font-bold border border-slate-300 rounded-lg outline-none ${
                            appHasMax ? 'bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500' : 'bg-slate-200 text-slate-400'
                          }`}
                        />
                        {appHasMax && (
                          <span className="absolute right-2.5 top-2 text-xs font-medium text-slate-400">€</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode 2 : Saisie contractuelle + Choix de la dégressivité */
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                  <div className="text-xs text-slate-600 font-medium">
                    1. Renseignez la ligne <strong>« Franchise contractuelle »</strong> :
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="contractBaseInput"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Base fixe contrat (€)
                      </label>
                      <div className="relative">
                        <input
                          id="contractBaseInput"
                          type="number"
                          min="0"
                          step="any"
                          value={contractBase}
                          onFocus={(e) => handleFocus(contractBase, setContractBase, e)}
                          onChange={(e) => setContractBase(e.target.value)}
                          placeholder="Ex: 110"
                          className="w-full pl-3 pr-7 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <span className="absolute right-2.5 top-2 text-xs font-medium text-slate-400">€</span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contractRateInput"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Taux contrat (%)
                      </label>
                      <div className="relative">
                        <input
                          id="contractRateInput"
                          type="number"
                          min="0"
                          step="any"
                          value={contractRate}
                          onFocus={(e) => handleFocus(contractRate, setContractRate, e)}
                          onChange={(e) => setContractRate(e.target.value)}
                          placeholder="Ex: 10"
                          className="w-full pl-3 pr-7 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <span className="absolute right-2.5 top-2 text-xs font-medium text-slate-400">%</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="contractMaxInput"
                          className="text-xs font-semibold text-slate-700"
                        >
                          Plafond contrat (€)
                        </label>
                        <button
                          type="button"
                          onClick={() => setContractHasMax(!contractHasMax)}
                          className="text-[10px] text-emerald-700 hover:underline font-medium"
                        >
                          {contractHasMax ? 'Avec max' : 'Sans max'}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          id="contractMaxInput"
                          type="number"
                          min="0"
                          step="any"
                          disabled={!contractHasMax}
                          value={contractHasMax ? contractMax : ''}
                          onFocus={(e) => handleFocus(contractMax, setContractMax, e)}
                          onChange={(e) => setContractMax(e.target.value)}
                          placeholder={contractHasMax ? "Ex: 260" : "Sans max"}
                          className={`w-full pl-3 pr-7 py-2 text-sm font-bold border border-slate-300 rounded-lg outline-none ${
                            contractHasMax ? 'bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500' : 'bg-slate-200 text-slate-400'
                          }`}
                        />
                        {contractHasMax && (
                          <span className="absolute right-2.5 top-2 text-xs font-medium text-slate-400">€</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Choix du taux de dégressivité (10% à 50%) */}
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">
                        2. Taux de dégressivité accordé :
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        -{effectiveDegressivity}% appliqué
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {[10, 20, 30, 40, 50].map((rate) => {
                        const isSelected = customDegressivity === '' && degressivityRate === rate;
                        return (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => {
                              setCustomDegressivity('');
                              setDegressivityRate(rate);
                            }}
                            className={`py-2.5 rounded-lg border text-sm font-bold text-center transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {rate}%
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2.5 text-xs text-slate-500">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomDegressivity('');
                          setDegressivityRate(0);
                        }}
                        className={`px-2.5 py-1 rounded-lg border transition-all ${
                          customDegressivity === '' && degressivityRate === 0
                            ? 'bg-slate-800 text-white border-slate-800 font-semibold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        0% (Sans dégressivité)
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span>Autre % :</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={customDegressivity}
                          onFocus={(e) => handleFocus(customDegressivity, setCustomDegressivity, e)}
                          onChange={(e) => setCustomDegressivity(e.target.value)}
                          placeholder="%"
                          className="w-16 px-2 py-1 text-center font-bold border border-slate-300 rounded-lg text-xs bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Franchise Fixe */
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <div>
                <label
                  htmlFor="fixedFranchiseInput"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  3. Montant de la franchise fixe contractuelle (€)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Euro className="w-5 h-5" />
                  </div>
                  <input
                    id="fixedFranchiseInput"
                    type="number"
                    min="0"
                    step="any"
                    value={fixedAmount}
                    onFocus={(e) => handleFocus(fixedAmount, setFixedAmount, e)}
                    onChange={(e) => setFixedAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-11 pr-16 py-2.5 text-base font-bold text-slate-900 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none placeholder:font-normal placeholder:text-slate-400"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none select-none">
                    EUR
                  </span>
                </div>
              </div>

              {/* Taux de dégressivité sur franchise fixe */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Taux de dégressivité accordé :
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    -{effectiveDegressivity}% appliqué
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[10, 20, 30, 40, 50].map((rate) => {
                    const isSelected = customDegressivity === '' && degressivityRate === rate;
                    return (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => {
                          setCustomDegressivity('');
                          setDegressivityRate(rate);
                        }}
                        className={`py-2.5 rounded-lg border text-sm font-bold text-center transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {rate}%
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between gap-2 mt-2.5 text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomDegressivity('');
                      setDegressivityRate(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg border transition-all ${
                      customDegressivity === '' && degressivityRate === 0
                        ? 'bg-slate-800 text-white border-slate-800 font-semibold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    0% (Sans dégressivité)
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span>Autre % :</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={customDegressivity}
                      onFocus={(e) => handleFocus(customDegressivity, setCustomDegressivity, e)}
                      onChange={(e) => setCustomDegressivity(e.target.value)}
                      placeholder="%"
                      className="w-16 px-2 py-1 text-center font-bold border border-slate-300 rounded-lg text-xs bg-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. DÉTAIL DU CALCUL POUR LE GESTIONNAIRE */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
              Détail du calcul :
            </span>

            {franchiseType === 'variable' ? (
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>• Base fixe :</span>
                  <span className="font-semibold text-slate-900">{formatEuro(partFixe)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Part variable ({rateUtilise}% de {formatEuro(parsedExpertise)}) :</span>
                  <span className="font-semibold text-slate-900">+{formatEuro(partProportionnelle)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span>• Sous-total calculé :</span>
                  <span className="font-semibold text-slate-900">{formatEuro(totalAvantPlafond)}</span>
                </div>
                {hasMaxUtilise && maxUtilise > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>• Plafond maximum ({formatEuro(maxUtilise)}) :</span>
                    <span className={`font-semibold ${isCapped ? 'text-amber-700 font-bold' : 'text-emerald-700'}`}>
                      {isCapped ? `Atteint ➔ Plafonné à ${formatEuro(maxUtilise)}` : 'Non dépassé ✓'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>• Franchise fixe contractuelle :</span>
                  <span className="font-semibold text-slate-900">{formatEuro(parsedFixed)}</span>
                </div>
                {effectiveDegressivity > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>• Dégressivité (-{effectiveDegressivity}%) :</span>
                    <span className="font-semibold">-{formatEuro((parsedFixed * effectiveDegressivity) / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                  <span>• Franchise à retenir :</span>
                  <span className="text-emerald-900">{formatEuro(franchiseFinale)}</span>
                </div>
              </div>
            )}
          </div>

          {/* 5. RÉSULTAT FINAL */}
          <div>
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 text-center shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Montant de la franchise à déduire
              </div>

              <div className="text-4xl sm:text-5xl font-black text-emerald-900 tracking-tight font-display my-1.5">
                {formatEuro(franchiseFinale)}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-emerald-800 mt-2 font-medium">
                <span>
                  Réparations : <strong>{formatEuro(parsedExpertise)}</strong>
                </span>
                <span>•</span>
                <span className="text-emerald-900 font-bold">
                  Indemnité compagnie : {formatEuro(partAssureur)}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
