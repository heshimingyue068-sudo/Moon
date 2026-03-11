import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, BookOpen, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navigation = [
  { name: '数据看板', href: '/', icon: LayoutDashboard },
  { name: '品牌管理', href: '/brands', icon: Target },
  { name: 'SOP 流程库', href: '/sops', icon: BookOpen },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-bold text-white tracking-tight">运营服务系统</h1>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-4 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    'group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'mr-3 h-5 w-5 shrink-0',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800">
        <button className="flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
          系统设置
        </button>
      </div>
    </div>
  );
};
