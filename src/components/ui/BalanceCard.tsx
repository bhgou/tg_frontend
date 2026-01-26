import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Coins } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  className?: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance, className }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`glass-effect rounded-2xl p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-400">Баланс</div>
            <div className="text-2xl font-bold text-yellow-400">{balance} CR</div>
          </div>
        </div>
        <Wallet className="w-6 h-6 text-gray-400" />
      </div>
    </motion.div>
  );
};