import React from 'react';
import { TrendingUp, CheckCircle, Users, ScanLine, BarChart, AlertCircle } from 'lucide-react';
import { Partner, MemberType, AuditLog, School } from '../../../types';
import { usePartnerMetrics } from '../hooks/usePartnerMetrics';

// --- CHART COMPONENTS ---
const SparklineArea = ({ data, color = "emerald" }: { data: number[], color?: string }) => {
    const max = Math.max(...data, 1);
    const min = 0;
    const height = 40;
    const width = 100;
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / (max - min)) * height;
        return `${x},${y}`;
    }).join(' ');

    const fillPath = `${points} ${width},${height} 0,${height}`;

    const colors: Record<string, string> = {
        emerald: "text-emerald-500 fill-emerald-500/10 stroke-emerald-500",
        blue: "text-blue-500 fill-blue-500/10 stroke-blue-500",
        amber: "text-amber-500 fill-amber-500/10 stroke-amber-500"
    };

    const colorClass = colors[color] || colors.emerald;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-12 overflow-visible ${colorClass}`}>
            <path d={`M ${fillPath}`} fill="currentColor" stroke="none" className="opacity-20" />
            <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const SparklineBar = ({ data, color = "amber" }: { data: number[], color?: string }) => {
    const max = Math.max(...data, 1);
    const height = 40;
    const width = 100;
    const barWidth = (width / data.length) * 0.6;
    const gap = (width / data.length) * 0.4;

    const colors: Record<string, string> = {
        emerald: "fill-emerald-500",
        blue: "fill-blue-500",
        amber: "fill-amber-500"
    };

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-12 ${colors[color] || colors.amber}`}>
            {data.map((val, i) => {
                const h = (val / max) * height;
                const x = i * (width / data.length) + gap / 2;
                return (
                    <rect
                        key={i}
                        x={x}
                        y={height - h}
                        width={barWidth}
                        height={h}
                        rx="2"
                        className="opacity-80 hover:opacity-100 transition-opacity"
                    />
                );
            })}
        </svg>
    );
};

interface MetricsDashboardProps {
    partner: Partner;
    auditLogs: AuditLog[];
    schools: School[];
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
    partner,
    auditLogs,
    schools
}) => {
    const {
        validationsThisWeek,
        validationsLast7Days,
        benefitsLast7Days,
        totalBenefits,
        estimatedSavings,
        dailySavingsData,
        uniqueStudents,
        usageByMemberType,
        profileCompleteness,
        sortedUsage,
        maxUsage
    } = usePartnerMetrics(partner, auditLogs, schools);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Dashboard de Métricas</h2>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{new Date().toLocaleDateString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CheckCircle size={80} className="text-slate-900" />
                    </div>
                    <div className="flex w-full justify-between items-end mb-4">
                        <div>
                            <h3 className="text-4xl font-bold text-slate-900 mb-1">{validationsThisWeek}</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Validações (Semana)</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            +18% <TrendingUp size={12} />
                        </div>
                    </div>
                    <div className="-mx-2 -mb-2">
                        <SparklineArea data={validationsLast7Days} color="emerald" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                        <TrendingUp size={24} />
                    </div>
                    <div className="flex w-full justify-between items-end mb-4">
                        <div>
                            <h3 className="text-4xl font-bold text-slate-900 mb-1">R$ {estimatedSavings.toFixed(2)}</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Economia Gerada (ROI)</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            ROI Positivo
                        </div>
                    </div>
                    <div className="-mx-2 -mb-2">
                        <SparklineArea data={dailySavingsData.some(v => v > 0) ? dailySavingsData : [10, 25, 15, 40, 30, 60, 45]} color="emerald" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                        <Users size={24} />
                    </div>
                    <div className="flex w-full justify-between items-end mb-4">
                        <div>
                            <h3 className="text-4xl font-bold text-slate-900 mb-1">{uniqueStudents}</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Membros Alcançados</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                            Fiéis: {Math.round((totalBenefits / (uniqueStudents || 1)) * 10) / 10}x
                        </div>
                    </div>
                    <div className="-mx-2 -mb-2">
                        <SparklineArea data={benefitsLast7Days} color="blue" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Saúde do Perfil</h3>
                            <p className="text-slate-500 text-sm">Complete seu perfil para atrair mais membros.</p>
                        </div>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${profileCompleteness === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {profileCompleteness}%
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${partner.logoUrl ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                            <span className="text-sm text-slate-600">Logo do Estabelecimento</span>
                            {partner.logoUrl ? <CheckCircle size={14} className="text-emerald-500 ml-auto" /> : <AlertCircle size={14} className="text-amber-500 ml-auto" />}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${partner.bannerUrl ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                            <span className="text-sm text-slate-600">Foto de Capa (Banner)</span>
                            {partner.bannerUrl ? <CheckCircle size={14} className="text-emerald-500 ml-auto" /> : <AlertCircle size={14} className="text-amber-500 ml-auto" />}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${partner.description ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                            <span className="text-sm text-slate-600">Descrição Detalhada</span>
                            {partner.description ? <CheckCircle size={14} className="text-emerald-500 ml-auto" /> : <AlertCircle size={14} className="text-amber-500 ml-auto" />}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${partner.instagramUrl || partner.phoneNumber ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                            <span className="text-sm text-slate-600">Canais de Contato</span>
                            {partner.instagramUrl || partner.phoneNumber ? <CheckCircle size={14} className="text-emerald-500 ml-auto" /> : <AlertCircle size={14} className="text-amber-500 ml-auto" />}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${partner.activePromotions?.length ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                            <span className="text-sm text-slate-600">Promoções Ativas</span>
                            {partner.activePromotions?.length ? <CheckCircle size={14} className="text-emerald-500 ml-auto" /> : <AlertCircle size={14} className="text-amber-500 ml-auto" />}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Uso de Benefícios por Escola</h3>
                            <p className="text-slate-500 text-sm">Monitorize quais escolas mais utilizam seus benefícios.</p>
                        </div>
                        <button className="text-indigo-600 font-bold text-sm hover:underline">Exportar CSV</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-wider">Uso por Categoria</p>
                            <div className="space-y-2">
                                {Object.entries(MemberType).map(([key, value]) => {
                                    const count = usageByMemberType[value] || 0;
                                    const percent = totalBenefits > 0 ? (count / totalBenefits) * 100 : 0;
                                    return (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-600">{value}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 transition-all duration-1000"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 w-8 text-right">{count}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-wider">Top Escolas</p>
                            <div className="space-y-2">
                                {sortedUsage.slice(0, 3).map(([school, count]) => (
                                    <div key={school} className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">{school}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-1000"
                                                    style={{ width: `${((count as number) / maxUsage) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 w-8 text-right">{count as number}</span>
                                        </div>
                                    </div>
                                ))}
                                {sortedUsage.length === 0 && (
                                    <p className="text-[10px] text-slate-400 italic py-4 text-center">Aguardando dados...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Análise de Fidelidade e Fluxo</h3>
                            <p className="text-slate-500 text-sm">Entenda o comportamento e a recorrência dos membros.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Retention Section */}
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-4 tracking-wider">Visão de Retenção (Novos vs Recorrentes)</p>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-xs text-emerald-600 font-bold mb-1">Novos</p>
                                    <p className="text-2xl font-bold text-slate-900">{usePartnerMetrics(partner, auditLogs, schools).newVsReturningData[0]}</p>
                                </div>
                                <div className="flex-1 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <p className="text-xs text-blue-600 font-bold mb-1">Recorrentes</p>
                                    <p className="text-2xl font-bold text-slate-900">{usePartnerMetrics(partner, auditLogs, schools).newVsReturningData[1]}</p>
                                </div>
                            </div>
                            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                {(() => {
                                    const metrics = usePartnerMetrics(partner, auditLogs, schools);
                                    const total = metrics.newVsReturningData[0] + metrics.newVsReturningData[1] || 1;
                                    const newPercent = (metrics.newVsReturningData[0] / total) * 100;
                                    const returningPercent = (metrics.newVsReturningData[1] / total) * 100;
                                    return (
                                        <>
                                            <div className="h-full bg-emerald-500" style={{ width: `${newPercent}%` }} title={`Novos: ${Math.round(newPercent)}%`} />
                                            <div className="h-full bg-blue-500" style={{ width: `${returningPercent}%` }} title={`Recorrentes: ${Math.round(returningPercent)}%`} />
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">First Time</span>
                                <span className="text-[10px] font-bold text-blue-600 uppercase">Loyal Fans</span>
                            </div>
                        </div>

                        {/* Peak Hours Section */}
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-4 tracking-wider">Horários de Pico (Fluxo por Hora)</p>
                            <div className="h-32 flex items-end gap-1.5 px-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 shadow-inner">
                                {usePartnerMetrics(partner, auditLogs, schools).peakHoursData.map((count, hour) => {
                                    const max = Math.max(...usePartnerMetrics(partner, auditLogs, schools).peakHoursData, 1);
                                    const h = (count / max) * 100;
                                    const isCurrentHour = new Date().getHours() === hour;
                                    return (
                                        <div
                                            key={hour}
                                            className="flex-1 group relative"
                                            title={`${hour}h: ${count} usos`}
                                        >
                                            <div
                                                className={`w-full rounded-t-sm transition-all duration-300 ${isCurrentHour ? 'bg-indigo-600' : 'bg-slate-300 group-hover:bg-indigo-400'}`}
                                                style={{ height: `${h}%` }}
                                            />
                                            {hour % 4 === 0 && (
                                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-400">
                                                    {hour}h
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-slate-400 italic mt-6 text-center">Baseado em utilizações de benefícios nas últimas 24h.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
