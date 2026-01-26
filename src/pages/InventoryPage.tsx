import React, { useState, useEffect } from 'react';
import { ArrowLeft, Grid, List, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { inventoryAPI } from '../services/api';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadInventory();
  }, [filter]);

  const loadInventory = async () => {
    try {
      const response = await inventoryAPI.getInventory({
        type: filter === 'all' ? undefined : filter
      });
      setItems(response.items || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
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
          <h1 className="text-2xl font-bold">Инвентарь</h1>
          <span className="text-gray-400">({items.length})</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'glass'}
            size="sm"
            icon={<Grid className="w-4 h-4" />}
            onClick={() => setViewMode('grid')}
          />
          <Button
            variant={viewMode === 'list' ? 'primary' : 'glass'}
            size="sm"
            icon={<List className="w-4 h-4" />}
            onClick={() => setViewMode('list')}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {['all', 'skins', 'fragments'].map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'primary' : 'glass'}
            size="sm"
            onClick={() => setFilter(filterType)}
          >
            {filterType === 'all' ? 'Все' : 
             filterType === 'skins' ? 'Скины' : 'Фрагменты'}
          </Button>
        ))}
      </div>

      {/* Inventory items */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4">
          {items.map((item: any, index: number) => (
            <div
              key={item.id}
              className="transition-transform hover:scale-105"
            >
              <Card hoverable className="p-3">
                <div className={`border-2 rounded-lg p-2 mb-2 ${getRarityColor(item.rarity)}`}>
                  <div className="aspect-square bg-gray-800 rounded" />
                </div>
                <h3 className="font-bold text-sm truncate">{item.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs font-bold ${getRarityColor(item.rarity)}`}>
                    {item.rarity.toUpperCase()}
                  </span>
                  {item.price && (
                    <span className="text-yellow-400 text-sm font-bold">
                      {item.price} CR
                    </span>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any, index: number) => (
            <div
              key={item.id}
              className="transition-transform hover:scale-[1.02]"
            >
              <Card hoverable className="flex items-center gap-3 p-3">
                <div className={`w-16 h-16 border-2 rounded-lg p-1 ${getRarityColor(item.rarity)}`}>
                  <div className="w-full h-full bg-gray-800 rounded" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold ${getRarityColor(item.rarity)}`}>
                      {item.rarity.toUpperCase()}
                    </span>
                    {item.is_fragment && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        {item.fragments} фрагментов
                      </span>
                    )}
                  </div>
                </div>
                {item.price && (
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold">{item.price} CR</div>
                    <Button size="sm" className="mt-2">
                      Продать
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};