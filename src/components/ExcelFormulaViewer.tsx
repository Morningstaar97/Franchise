import React, { useState } from 'react';
import { FranchiseConfig } from '../types';
import { generateExcelFormulas } from '../utils/calculator';
import { FileSpreadsheet, Copy, Check, Download, ExternalLink, Code2 } from 'lucide-react';

interface ExcelFormulaViewerProps {
  config: FranchiseConfig;
  onExportExcel: () => void;
}

export const ExcelFormulaViewer: React.FC<ExcelFormulaViewerProps> = ({
  config,
  onExportExcel,
}) => {
  const [copiedFR, setCopiedFR] = useState(false);
  const [copiedEN, setCopiedEN] = useState(false);
  const [langTab, setLangTab] = useState<'fr' | 'en'>('fr');

  const { rawFormulaFR, rawFormulaEN } = generateExcelFormulas(config);

  const copyFormula = (formula: string, type: 'fr' | 'en') => {
    navigator.clipboard.writeText(formula);
    if (type === 'fr') {
      setCopiedFR(true);
      setTimeout(() => setCopiedFR(false), 2000);
    } else {
      setCopiedEN(true);
      setTimeout(() => setCopiedEN(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 font-display">
              Formules & Modèle Excel Prêt à l'Emploi
            </h3>
            <p className="text-xs text-slate-500">
              Copiez directement la formule dans votre tableur ou téléchargez le fichier .xlsx complet
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExportExcel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Générer le classeur Excel</span>
        </button>
      </div>

      {/* Onglets langue formule (Excel FR vs Excel EN/US) */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setLangTab('fr')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
              langTab === 'fr'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Excel Français (point-virgule ;)
          </button>
          <button
            type="button"
            onClick={() => setLangTab('en')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
              langTab === 'en'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Excel International (virgule ,)
          </button>
        </div>
      </div>

      {/* Boîte de formule */}
      <div className="relative rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-sm overflow-x-auto">
        <div className="flex items-center justify-between gap-4 mb-2 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <Code2 className="w-3.5 h-3.5" />
            Formule calculée pour la cellule Franchise Nette :
          </span>
          <button
            type="button"
            onClick={() =>
              copyFormula(langTab === 'fr' ? rawFormulaFR : rawFormulaEN, langTab)
            }
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors shrink-0"
          >
            {(langTab === 'fr' ? copiedFR : copiedEN) ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copiée !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier la formule</span>
              </>
            )}
          </button>
        </div>

        <div className="text-emerald-300 font-semibold selection:bg-emerald-800 selection:text-white py-1">
          {langTab === 'fr' ? rawFormulaFR : rawFormulaEN}
        </div>
      </div>

      {/* Structure recommandée des colonnes Excel */}
      <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Disposition recommandée des colonnes dans Excel :
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-white border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Colonne A (A2)</span>
            <span className="text-slate-600">Montant du rapport d'expertise</span>
            <div className="text-[11px] text-slate-400 mt-1">Exemple : 2 500 €</div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Colonne B (B2)</span>
            <span className="text-slate-600">Taux de dégressivité</span>
            <div className="text-[11px] text-slate-400 mt-1">Exemple : 5% ou 9%</div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
            <span className="font-bold text-emerald-900 block mb-1">Colonne C (C2)</span>
            <span className="text-emerald-800">Franchise finale à payer</span>
            <div className="text-[11px] text-emerald-600 mt-1">Collez la formule ci-dessus</div>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-500">
          💡 <strong>Prise en charge compagnie :</strong> Dans la colonne D2, mettez simplement la formule <code>=A2-C2</code> pour obtenir le remboursement pris en charge par l'assurance !
        </div>
      </div>
    </div>
  );
};
