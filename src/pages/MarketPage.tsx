import React, { useState, useEffect } from 'react';
import { ArrowLeft, Filter, Search, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { marketAPI } from '../services/api';

export const MarketPage: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadListings();
  }, [filter]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const response = await marketAPI.getListings({
        page: 1,
        limit: 20
      });
      // Используем правильное поле из ответа
      setListings(response.listings || []);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const rarityMap: Record<string, string> = {
      'common': 'border-csgo-rarity-common text-csgo-rarity-common',
      'uncommon': 'border-csgo-rarity-uncommon text-csgo-rarity-uncommon',
      'rare': 'border-csgo-rarity-rare text-csgo-rarity-rare',
      'mythical': 'border-csgo-rarity-mythical text-csgo-rarity-mythical',
      'legendary': 'border-csgo-rarity-legendary text-csgo-rarity-legendary',
      'ancient': 'border-csgo-rarity-ancient text-csgo-rarity-ancient',
      'immortal': 'border-csgo-rarity-immortal text-csgo-rarity-immortal',
    };
    return rarityMap[rarity.toLowerCase()] || 'border-gray-500 text-gray-400';
  };

  const handleBuyItem = async (listingId: number) => {
    try {
      await marketAPI.buyItem(listingId);
      loadListings(); // Перезагружаем список
    } catch (error) {
      console.error('Failed to buy item:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="glass"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/')}
          />
          <h1 className="text-2xl font-bold">Рынок</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="glass"
            size="sm"
            icon={<Search className="w-4 h-4" />}
          />
          <Button
            variant="glass"
            size="sm"
            icon={<Filter className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {['all', 'skins', 'fragments', 'trending'].map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'primary' : 'glass'}
            size="sm"
            onClick={() => setFilter(filterType)}
          >
            {filterType === 'all' ? 'Все' : 
             filterType === 'skins' ? 'Скины' : 
             filterType === 'fragments' ? 'Фрагменты' : 'Тренды'}
          </Button>
        ))}
      </div>

      {/* Market stats */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="font-bold">Статистика рынка</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-400">24</div>
            <div className="text-sm text-gray-400">Продажи за день</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-400">1,245</div>
            <div className="text-sm text-gray-400">Активных лотов</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-400">15,670</div>
            <div className="text-sm text-gray-400">CR в обороте</div>
          </div>
        </div>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-3 animate-pulse">
              <div className="aspect-square bg-gray-800 rounded-lg mb-2" />
              <div className="h-4 bg-gray-800 rounded mb-2" />
              <div className="h-3 bg-gray-800 rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {listings.map((listing: any, index: number) => (
            <div
              key={listing.id}
              className="transition-transform hover:scale-105"
            >
              <Card hoverable className="p-3">
                <div className={`border-2 rounded-lg p-2 mb-2 ${getRarityColor(listing.rarity || 'common')}`}>
                  <div className="aspect-square bg-gray-800 rounded" />
                </div>
                
                <div className="mb-2">
                  <h3 className="font-bold text-sm truncate">{listing.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs font-bold ${getRarityColor(listing.rarity || 'common')}`}>
                      {(listing.rarity || 'COMMON').toUpperCase()}
                    </span>
                    {listing.is_fragment && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        {listing.fragments || 1}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-yellow-400 font-bold">{listing.price} CR</div>
                    <div className="text-xs text-gray-400">
                      от {listing.seller_name || 'Продавец'}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBuyItem(listing.id)}
                  >
                    Купить
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};