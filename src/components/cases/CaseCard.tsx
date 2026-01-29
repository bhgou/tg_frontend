import React from 'react';
import { Gift, Coins, Tv } from 'lucide-react';
import { Card } from '../ui/Card';

interface CaseCardProps {
  caseItem: {
    id: number;
    name: string;
    type: 'ad' | 'standard' | 'premium';
    price: number | null;
    imageUrl: string | null;
    description: string | null;
  };
  onClick: () => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseItem, onClick }) => {
  const getCaseTypeColor = () => {
    switch (caseItem.type) {
      case 'ad': return 'case-ad';
      case 'standard': return 'case-standard';
      case 'premium': return 'case-premium';
      default: return '';
    }
  };

  const getCaseIcon = () => {
    switch (caseItem.type) {
      case 'ad': return <Tv className="w-5 h-5" />;
      case 'standard': return <Gift className="w-5 h-5" />;
      case 'premium': return <Gift className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  return (
    <Card
      hoverable
      glow={caseItem.type === 'premium'}
      onClick={onClick}
      className={`${getCaseTypeColor()} text-white relative overflow-hidden`}
    >
      <div className="absolute top-2 right-2">
        {getCaseIcon()}
      </div>
      
      <div className="text-center mb-3">
        <h3 className="font-bold text-lg mb-1">{caseItem.name}</h3>
        <p className="text-sm opacity-90">{caseItem.description}</p>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {caseItem.price ? (
          <>
            <Coins className="w-4 h-4" />
            <span className="font-bold">{caseItem.price} CR</span>
          </>
        ) : (
          <span className="font-bold">БЕСПЛАТНО</span>
        )}
      </div>
    </Card>
  );
};