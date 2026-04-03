import React from 'react';
import { Building2, Users, Settings, LogOut, Menu, Home, Briefcase, Image as ImageIcon, MessageSquare, FileText } from 'lucide-react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAppContext } from '../AppContext';

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const { companyEntities } = useAppContext();

  const navItems = [
    { id: '/', label: '数据看板', icon: Home },
    { id: '/workspace', label: '运营工作台', icon: Briefcase },
    { id: '/brands', label: '项目管理', icon: Briefcase },
    { id: '/brand-list', label: '品牌管理', icon: Building2 },
    { id: '/clients', label: '客户管理', icon: Users },
    { id: '/sops', label: 'SOP服务项', icon: FileText },
  ] as const;

  const getIsActive = (itemId: string) => {
    if (location.pathname === itemId) return true;
    if (itemId !== '/' && location.pathname.startsWith(`${itemId}/`)) return true;
    
    // Handle company details pages
    if (location.pathname.startsWith('/company/')) {
      const companyId = location.pathname.split('/')[2];
      const entity = companyEntities.find(e => e.id === companyId);
      if (entity) {
        if (entity.type === 'BRAND' && itemId === '/brand-list') return true;
        if (entity.type === 'CLIENT' && itemId === '/clients') return true;
      }
    }
    
    return false;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <span className="text-xl font-bold text-gray-800">Service Portal</span>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = getIsActive(item.id);
              return (
                <NavLink
                  key={item.id}
                  to={item.id}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900">
              <LogOut className="w-5 h-5 mr-3 text-gray-400" />
              退出登录 (Logout)
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 md:hidden">
          <span className="text-xl font-bold text-gray-800">Service Portal</span>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
