import React from 'react';
import {
    CreditCard,
    ShoppingBag,
    FileText,
    User,
    LogOut,
    Menu,
    X
} from 'lucide-react';

interface StudentLayoutProps {
    children: React.ReactNode;
    activeTab: 'id' | 'partners' | 'requests' | 'family';
    onTabChange: (tab: 'id' | 'partners' | 'requests' | 'family') => void;
    onLogout?: () => void;
    userName: string;
    userPhoto?: string;
    headerAction?: React.ReactNode;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    onLogout,
    userName,
    userPhoto,
    headerAction
}) => {
    const navItems = [
        { id: 'id', label: 'Carteirinha', icon: CreditCard },
        { id: 'partners', label: 'Clube de Vantagens', icon: ShoppingBag },
        { id: 'family', label: 'Família', icon: User }, // Replaced Profile with Family/Dependents context or just distinct
        { id: 'requests', label: 'Solicitações', icon: FileText },
    ] as const;

    return (
        <div className="min-h-screen bg-transparent flex flex-col lg:flex-row font-inter">

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-scrimba-navy/80 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 h-screen sticky top-0 px-6 py-8 justify-between z-20 shadow-sm transition-all">
                <div>
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-bold text-lg">U</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-slate-800 tracking-tight">Olá, {userName.split(' ')[0]}</h1>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Bem-vindo ao data foundation UniPass.</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group
                                    ${activeTab === item.id
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon
                                    size={20}
                                    className={`transition-colors ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}
                                />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div>
                    {/* User Mini Profile in Sidebar */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                        <img
                            src={userPhoto || "https://ui-avatars.com/api/?name=" + userName}
                            alt="User"
                            className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                            <p className="text-[10px] text-green-600 font-bold uppercase">Online</p>
                        </div>
                    </div>

                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors"
                    >
                        <LogOut size={20} />
                        Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 min-h-screen relative overflow-y-auto pb-24 lg:pb-0 pt-20 lg:pt-0">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white dark:bg-scrimba-navy/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 p-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between shadow-sm transition-all">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">U</span>
                        </div>
                        <h1 className="font-bold text-slate-800">Olá, {userName.split(' ')[0]}</h1>
                    </div>
                    <div className="flex items-center gap-1">
                        {headerAction}
                        {headerAction && onLogout && <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>}
                        {onLogout && (
                            <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-50 transition-colors">
                                <LogOut size={20} />
                            </button>
                        )}
                    </div>
                </header>

                <div className="p-4 lg:p-10 max-w-6xl mx-auto animate-fade-in">
                    {children}
                </div>
            </main>

            {/* MOBILE BOTTOM NAV */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-scrimba-navy/90 backdrop-blur-lg border-t border-slate-200 dark:border-white/5 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-area-bottom transition-all">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}
                    >
                        <div className={`p-1.5 rounded-full transition-all ${activeTab === item.id ? 'bg-indigo-50 translate-y-[-2px]' : ''}`}>
                            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                        </div>
                        <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                    </button>
                ))}
            </div>
        </div >
    );
};
