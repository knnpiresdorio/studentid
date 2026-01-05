import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';

interface Step {
    title: string;
    content: string;
    target?: string; // CSS selector
}

interface OnboardingTourProps {
    steps: Step[];
    onComplete: () => void;
    tourId: string;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, onComplete, tourId }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasCompleted = localStorage.getItem(`onboarding_${tourId}`);
        if (!hasCompleted) {
            setIsVisible(true);
        }
    }, [tourId]);

    if (!isVisible) return null;

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    const handleNext = () => {
        if (isLast) {
            localStorage.setItem(`onboarding_${tourId}`, 'true');
            setIsVisible(false);
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    const handleSkip = () => {
        localStorage.setItem(`onboarding_${tourId}`, 'true');
        setIsVisible(false);
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-1">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 dark:bg-slate-800'}`}
                                />
                            ))}
                        </div>
                        <button onClick={handleSkip} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                        {step.content}
                    </p>

                    <div className="flex gap-3 mt-auto">
                        {currentStep > 0 && (
                            <Button variant="secondary" onClick={handleBack} className="flex-1">
                                <ChevronLeft size={18} className="mr-2" /> Voltar
                            </Button>
                        )}
                        <Button
                            variant={isLast ? "indigo" : "primary"}
                            onClick={handleNext}
                            className="flex-1"
                        >
                            {isLast ? (
                                <>Começar <CheckCircle2 size={18} className="ml-2" /></>
                            ) : (
                                <>Próximo <ChevronRight size={18} className="ml-2" /></>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
