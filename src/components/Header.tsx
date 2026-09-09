import React from 'react';
import { FileSpreadsheet, Printer, BookmarkCheck, Shield, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onExportExcel: () => void;
  savedCount: number;
  onOpenDossiers: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportExcel,
  savedCount,
  onOpenDossiers,
  onOpenHelp,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display">
                Calculateur de Franchise Dégressive
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Assurance & Expertise
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Simulation franchise fixe ou variable (300 € + 10% max 600 €) • Dégressivité 5% à 9% • Formules & Export Excel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end no-print">
          <button
            type="button"
            onClick={onOpenHelp}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Guide et formules"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenDossiers}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <BookmarkCheck className="w-4 h-4 text-slate-600" />
            <span>Dossiers</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-600 text-white text-xs font-bold rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Imprimer le rapport ou sauvegarder en PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimer</span>
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all hover:shadow"
            title="Télécharger la feuille Excel prête à l'emploi"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Télécharger Excel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
