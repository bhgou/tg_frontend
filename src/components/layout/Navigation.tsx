import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, ShoppingBag, User} from 'lucide-react';
import { cn } from '../../utils/cn';

export const Navigation: React.FC = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/cases', icon: Package, label: 'Кейсы' },
    { path: '/market', icon: ShoppingBag, label: 'Рынок' },
    { path: '/inventory', icon: Package, label: 'Инвентарь' },
    { path: '/profile', icon: User, label: 'Профиль' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-white/10">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center p-2 transition-colors',
                isActive
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};