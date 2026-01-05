import React, { useState, useEffect } from 'react';
import { Partner } from '../../../types';

export const useStudentBenefits = (partners: Partner[], schoolId: string | undefined) => {
    // UI State
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // Filter State
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem('unipass_favorites');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('unipass_favorites', JSON.stringify(favorites));
    }, [favorites]);

    // Network Listeners
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const toggleFavorite = (e: React.MouseEvent, partnerId: string) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(partnerId) ? prev.filter(id => id !== partnerId) : [...prev, partnerId]
        );
    };

    const myPartners = partners.filter(p => p.schoolId === schoolId);

    const filteredPartners = myPartners.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
        const matchesFavorite = !showFavoritesOnly || favorites.includes(p.id);

        return matchesSearch && matchesCategory && matchesFavorite;
    });

    return {
        selectedPartner,
        setSelectedPartner,
        searchQuery,
        setSearchQuery,
        isOffline,
        selectedCategory,
        setSelectedCategory,
        showFavoritesOnly,
        setShowFavoritesOnly,
        favorites,
        toggleFavorite,
        filteredPartners,
        myPartners
    };
};
