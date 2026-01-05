import React from 'react';
import { AlertTriangle, WifiOff, Camera } from 'lucide-react';
import { Student } from '../../../types';
import { StudentCard } from '../../StudentCard';

interface DigitalIDProps {
    studentData: Student;
    isOffline: boolean;
    onReportError: () => void;
    onUpdatePhoto: () => void;
    isDependentUser?: boolean;
}

export const DigitalID: React.FC<DigitalIDProps> = ({
    studentData,
    isOffline,
    onReportError,
    onUpdatePhoto,
    isDependentUser
}) => {
    return (
        <div className="animate-enter-slide-up">
            <div className="flex justify-between items-center mb-6 lg:mb-8">
                <div className="flex-1"></div>
            </div>

            <StudentCard student={studentData} offlineMode={isOffline} />

            <div className="mt-8 text-center space-y-4">
                <button
                    onClick={onReportError}
                    className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-2 mx-auto border border-transparent dark:border-white/10"
                >
                    <AlertTriangle size={14} /> Reportar erro nos dados
                </button>

                {isDependentUser && (
                    <p className="text-xs max-w-xs mx-auto text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/30">
                        Esta carteira está vinculada à conta de <strong>{studentData.parentName}</strong>.
                    </p>
                )}
                {isOffline && (
                    <div className="inline-flex mt-3 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-3 py-2 rounded-lg text-xs font-semibold items-center gap-2 border border-orange-100 dark:border-orange-900/30">
                        <WifiOff size={14} /> Modo Offline
                    </div>
                )}
            </div>
        </div>
    );
};
