import React, { useState } from 'react';
import { SavedDossier, FranchiseConfig, CalculationResult } from '../types';
import { formatEuro } from '../utils/calculator';
import { X, BookmarkPlus, Trash2, FolderOpen, Download, Calendar, Car, User } from 'lucide-react';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDossiers: SavedDossier[];
  currentConfig: FranchiseConfig;
  currentResult: CalculationResult;
  onSaveCurrent: (metadata: { reference: string; clientName: string; vehicleOrClaim: string }) => void;
  onLoadDossier: (dossier: SavedDossier) => void;
  onDeleteDossier: (id: string) => void;
  onExportExcel: () => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  isOpen,
  onClose,
  savedDossiers,
  currentConfig,
  currentResult,
  onSaveCurrent,
  onLoadDossier,
  onDeleteDossier,
  onExportExcel,
}) => {
  const [reference, setReference] = useState(`DOS-${Math.floor(1000 + Math.random() * 9000)}`);
  const [clientName, setClientName] = useState('');
  const [vehicleOrClaim, setVehicleOrClaim] = useState('');

  if (!isOpen) return null;

  const handleSubmitSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCurrent({
      reference: reference.trim() || `DOS-${Date.now().toString().slice(-4)}`,
      clientName: clientName.trim(),
      vehicleOrClaim: vehicleOrClaim.trim(),
    });
    setReference(`DOS-${Math.floor(1000 + Math.random() * 9000)}`);
    setClientName('');
    setVehicleOrClaim('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Gestion des Dossiers d'Expertise
              </h3>
              <p className="text-xs text-slate-500">
                Enregistrez et consultez vos simulations de franchise
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Formulaire de sauvegarde rapide */}
          <form
            onSubmit={handleSubmitSave}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BookmarkPlus className="w-4 h-4 text-emerald-600" />
                Enregistrer la simulation actuelle
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Franchise : {formatEuro(currentResult.franchiseNette)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Réf. Dossier
                </label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  placeholder="Ex: DOS-7841"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Nom Client / Assuré
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  placeholder="Ex: M. Dupont"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Véhicule / Immat.
                </label>
                <input
                  type="text"
                  value={vehicleOrClaim}
                  onChange={(e) => setVehicleOrClaim(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  placeholder="Ex: Peugeot 308 - AA-123-BB"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Sauvegarder ce dossier</span>
              </button>
            </div>
          </form>

          {/* Liste des dossiers existants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Dossiers enregistrés ({savedDossiers.length})
              </h4>
              {savedDossiers.length > 0 && (
                <button
                  type="button"
                  onClick={onExportExcel}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Exporter tous les dossiers (.xlsx)</span>
                </button>
              )}
            </div>

            {savedDossiers.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Aucun dossier enregistré pour le moment. Utilisez le formulaire ci-dessus pour archiver vos calculs d'expertise.
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedDossiers.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 font-display">
                          {d.reference}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {d.config.franchiseType === 'variable' ? 'Variable' : 'Fixe'}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                          Dég. -{d.config.degressivityRate}%
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        {d.clientName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {d.clientName}
                          </span>
                        )}
                        {d.vehicleOrClaim && (
                          <span className="flex items-center gap-1">
                            <Car className="w-3 h-3 text-slate-400" />
                            {d.vehicleOrClaim}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {d.date}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 pt-0.5">
                        Expertise : <strong>{formatEuro(d.config.expertiseAmount)}</strong> •
                        Franchise nette : <strong className="text-emerald-700">{formatEuro(d.result.franchiseNette)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadDossier(d);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Charger
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteDossier(d.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Supprimer ce dossier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
