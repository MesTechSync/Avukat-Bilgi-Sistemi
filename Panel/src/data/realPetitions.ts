export interface RealPetition {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  keywords: string[];
  urgency: 'low' | 'medium' | 'high';
  complexity: 'basic' | 'intermediate' | 'advanced';
  estimatedCost: string;
  timeframe: string;
  variables: string[];
  template: string;
}

// Demo veriler kaldırıldı - production için temizlendi
export const realPetitions: RealPetition[] = [];