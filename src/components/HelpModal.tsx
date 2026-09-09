import React from 'react';
import { X, BookOpen, CheckCircle, ShieldAlert } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Guide : Franchise Dégressive en Assurance
              </h3>
              <p className="text-xs text-slate-500">
                Principes de calcul et fonctionnement contractuel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              1. Franchise Fixe vs Franchise Variable
            </h4>
            <p>
              • <strong>Franchise fixe :</strong> Un montant défini au contrat (ex. 300 €) déduit des indemnités quel que soit le coût des réparations.
            </p>
            <p>
              • <strong>Franchise variable / proportionnelle :</strong> Dépend du montant des réparations évaluées par l'expert d'assurance. Elle applique généralement une formule composée d'une <em>base fixe + un pourcentage</em> (ex. 300 € + 10% du rapport d'expertise), souvent encadrée par un <em>plafond maximal</em> (ex. 600 € max).
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              2. Qu'est-ce que la Dégressivité (5% à 9%) ?
            </h4>
            <p>
              La clause de franchise dégressive récompense la fidélité de l'assuré ou les années consécutives sans sinistre responsable (ou selon les conditions générales de la compagnie).
            </p>
            <p>
              Le taux de dégressivité sélectionné (par exemple 5%, 6%, 7%, 8% ou 9%) s'applique en réduction directe de la franchise brute calculée.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800">
              Franchise Nette = Franchise Brute × (1 - Taux de dégressivité)
            </div>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              3. Utilisation dans Excel
            </h4>
            <p>
              Dans un tableur Excel, si la cellule <code>A2</code> contient le montant de l'expertise et <code>B2</code> le taux de dégressivité (ex: 5% ou 0,05) :
            </p>
            <div className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px]">
              =MIN(600; 300 + 10% * A2) * (1 - B2)
            </div>
            <p>
              Cette formule prend automatiquement en compte la base de 300 €, le taux de 10%, le plafond de 600 € et la réduction dégressive.
            </p>
          </section>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};
