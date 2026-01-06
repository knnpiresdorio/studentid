import React from 'react';
import { School, Student, Partner } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ChevronRight, Settings } from 'lucide-react';

interface SchoolListProps {
    schools: School[];
    studentStats: { schoolId: string }[];
    partners: Partner[];
    onManageSchool: (school: School) => void;
}

export const SchoolList: React.FC<SchoolListProps> = ({
    schools,
    studentStats,
    partners,
    onManageSchool
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {schools.map(school => (
                <div key={school.id} className="bg-slate-900/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border border-white/5 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 group hover:-translate-y-1">
                    <div className="h-32 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 relative p-6 flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-2 bg-white/10 rounded-full backdrop-blur-xl hover:bg-white/20 cursor-pointer text-white">
                                <Settings size={16} />
                            </div>
                        </div>
                        <div className="absolute -bottom-3 right-6 w-20 h-20 bg-slate-900 rounded-2xl shadow-2xl border border-white/10 p-2 z-10 group-hover:scale-110 transition-transform duration-300">
                            <img src={school.logoUrl} className="w-full h-full object-contain rounded-xl bg-white" alt="Logo" />
                        </div>
                        <div className="z-10 text-white w-3/4">
                            <h3 className="font-bold text-xl leading-tight mb-2 drop-shadow-md text-white font-display">{school.name}</h3>
                            <Badge variant="indigo">{school.type}</Badge>
                        </div>
                    </div>
                    <div className="pt-10 px-6 pb-6">

                        <div className="mb-6 h-12">
                            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                {school.description || "Sem descrição disponível."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-950/50 rounded-xl p-3 text-center border border-white/5 group-hover:border-blue-500/20 transition-colors">
                                <span className="block text-2xl font-bold text-blue-400">{studentStats.filter(s => s.schoolId === school.id).length}</span>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Membros</span>
                            </div>
                            <div className="bg-slate-950/50 rounded-xl p-3 text-center border border-white/5 group-hover:border-purple-500/20 transition-colors">
                                <span className="block text-2xl font-bold text-purple-400">{partners.filter(p => p.schoolId === school.id).length}</span>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Parceiros</span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={() => onManageSchool(school)}
                                variant="secondary"
                                className="w-full"
                                rightIcon={<ChevronRight size={16} />}
                            >
                                Gerenciar Instituição
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
