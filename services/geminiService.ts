import { Partner } from '../types';

/**
 * MOCK Gemini Service
 * 
 * This service is a placeholder for the Google Gemini integration.
 * It simulates an AI response for partner suggestions.
 */

export const suggestPartners = async (query: string, partners: Partner[]): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple keyword matching for demo purposes
    const lowerQuery = query.toLowerCase();
    const matchedPartners = partners.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    );

    if (matchedPartners.length > 0) {
        return `Encontrei ${matchedPartners.length} parceiros que podem te interessar:\n\n` +
            matchedPartners.map(p => `- **${p.name}**: ${p.discount}`).join('\n');
    }

    return "Desculpe, não encontrei recomendações específicas para sua busca no momento. Tente buscar por categoria como 'Alimentação' ou 'Cinema'.";
};
