import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CasesGrid } from '../components/cases/CasesGrid';
import { useCaseStore } from '../store/case.store';
import { caseAPI } from '../services/api';

export const CasesPage: React.FC = () => {
  const navigate = useNavigate();
  const { cases, setCases } = useCaseStore();

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
  try {
    const response = await caseAPI.getCases();
    // response.cases доступен благодаря типизации
    setCases(response.cases || []);
  } catch (error) {
    console.error('Failed to load cases:', error);
  }
};

  const handleCaseSelect = (caseItem: any) => {
    navigate(`/case/${caseItem.id}`);
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
          <h1 className="text-2xl font-bold">Кейсы</h1>
        </div>
        <Button
          variant="glass"
          size="sm"
          icon={<Filter className="w-4 h-4" />}
        />
      </div>

      {/* Cases grid */}
      <CasesGrid cases={cases} onSelectCase={handleCaseSelect} />

      {/* Categories */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Категории</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: 'ad', label: 'Бесплатные', color: 'from-green-500 to-emerald-600' },
            { type: 'standard', label: 'Стандартные', color: 'from-blue-500 to-cyan-600' },
            { type: 'premium', label: 'Премиум', color: 'from-purple-500 to-pink-600' },
            { type: 'special', label: 'Специальные', color: 'from-orange-500 to-red-600' },
          ].map((category) => (
            <motion.div
              key={category.type}
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br ${category.color} rounded-2xl p-4 cursor-pointer`}
            >
              <h3 className="font-bold text-lg">{category.label}</h3>
              <p className="text-sm opacity-90 mt-1">От 100 CR</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};