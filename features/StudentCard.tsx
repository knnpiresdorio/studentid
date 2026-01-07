
import React, { useState } from 'react';
import { Student } from '../types';
import { RotateCw, CheckCircle2, XCircle, WifiOff, ShieldCheck, GraduationCap } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  offlineMode?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, offlineMode }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const statusColor = student.isActive ? 'text-green-400' : 'text-red-400';
  const statusBorder = student.isActive ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-red-500/50';

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${student.id}`;

  return (
    <div className="w-full max-w-sm mx-auto perspective-1000 h-[600px] cursor-pointer group" onClick={handleFlip}>
      <div className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>

        {/* Front of Card */}
        <div className="absolute w-full h-full backface-hidden rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-white/10 ring-1 ring-white/5">

          {/* Ambient Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow delay-700"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
          </div>

          {/* Content Layer */}
          <div className="relative z-10 flex flex-col h-full bg-white/5 backdrop-blur-sm">

            {/* Header */}
            <div className="p-6 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-white/10">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h1 className="text-white font-bold text-xl leading-none tracking-tight font-display">UniPass</h1>
                  <p className="text-blue-200/60 text-[10px] uppercase tracking-widest mt-1 font-medium">Identidade Digital</p>
                </div>
              </div>
              {offlineMode && <WifiOff className="text-white/50 w-5 h-5" />}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center -mt-6">
              {/* Photo Ring */}
              <div className="relative mb-8 group-hover:scale-105 transition-transform duration-500">
                <div className={`absolute inset-0 rounded-full border-[3px] ${statusBorder} animate-pulse-slow`}></div>
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.fullName}
                    className="w-48 h-48 rounded-full border-4 border-slate-900 shadow-2xl object-cover bg-slate-800 relative z-10"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full border-4 border-slate-900 shadow-2xl bg-slate-800 flex items-center justify-center text-slate-500 relative z-10">
                    <GraduationCap size={64} opacity={0.3} />
                  </div>
                )}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-20">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg backdrop-blur-md border border-white/10 flex items-center gap-1.5 ${student.isActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                    {student.isActive ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} />}
                    {student.isActive ? 'ATIVO' : 'INATIVO'}
                  </span>
                </div>
              </div>

              {/* Identity Info */}
              <div className="text-center w-full px-8 space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                  {student.userType || 'ALUNO'}
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight line-clamp-2 drop-shadow-sm">{student.fullName}</h2>
                <p className="text-indigo-200/80 text-sm font-medium tracking-wide">
                  {student.userType === 'ALUNO' || !student.userType ? student.course : (student.course || 'Corporativo')}
                </p>
              </div>

              {/* Data Grid */}
              <div className="w-full px-6 mt-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md hover:bg-white/10 transition-colors">
                    <p className="text-[10px] text-blue-200/50 uppercase tracking-wider mb-1 font-bold">Matrícula</p>
                    <p className="text-white font-mono text-sm tracking-wide">{student.registrationNumber}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md hover:bg-white/10 transition-colors">
                    <p className="text-[10px] text-blue-200/50 uppercase tracking-wider mb-1 font-bold">CPF</p>
                    <p className="text-white font-mono text-sm tracking-wide">{student.cpf}</p>
                  </div>
                  <div className="col-span-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-white/10 rounded-2xl p-3 flex justify-between items-center group/inst">
                    <div>
                      <p className="text-[10px] text-blue-200/50 uppercase tracking-wider mb-1 font-bold">Instituição</p>
                      <p className="text-white text-xs font-semibold tracking-wide">{student.schoolName}</p>
                    </div>
                    <ShieldCheck className="text-indigo-400/50 group-hover/inst:text-indigo-300 transition-colors" size={20} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 text-center mt-auto">
              <p className="text-[10px] text-white/50 font-medium mb-3 tracking-widest uppercase">
                Válido até: <span className="text-white/90">
                  {student.validUntil && !isNaN(new Date(student.validUntil).getTime())
                    ? new Date(student.validUntil).toLocaleDateString('pt-BR')
                    : 'Não Informada'}
                </span>
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-300 text-xs font-bold bg-white/5 py-2 px-4 rounded-full mx-auto w-fit border border-white/5 hover:bg-white/10 transition-all shadow-lg hover:shadow-blue-500/10">
                <RotateCw size={14} />
                <span>Toque para ver o QR Code</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card (QR Code) */}
        <div className="absolute w-full h-full backface-hidden rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-white/10 rotate-y-180 flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

          <div className="text-center mb-8 relative z-10">
            <h3 className="font-bold text-white text-xl tracking-tight">Validação Digital</h3>
            <p className="text-xs text-slate-400 mt-1">Apresente este código para parceiros</p>
            <div className="mt-2 inline-block px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              Categoria: {student.userType || 'ALUNO'}
            </div>
          </div>

          <div className="relative z-10 p-1 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 shadow-2xl">
            <div className="bg-white p-4 rounded-xl">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
            </div>
          </div>

          <div className="mt-8 text-center w-full relative z-10">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm mx-4">
              <p className="text-[10px] text-blue-300/50 uppercase tracking-widest mb-2 font-bold">Código de Verificação</p>
              <p className="text-2xl font-mono font-bold text-white tracking-[0.2em]">{student.id.split('-')[0].toUpperCase()}</p>
            </div>
          </div>

          <div className="absolute bottom-8 flex items-center gap-2 text-slate-500 text-xs cursor-pointer hover:text-white transition-colors z-10">
            <RotateCw size={12} />
            <span>Voltar para carteira</span>
          </div>

          {/* Background Mesh */}
          <div className="absolute inset-0 z-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
