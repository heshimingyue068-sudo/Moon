import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { Search, Plus, Filter, MoreVertical, CheckSquare, X } from 'lucide-react';
import { LifecyclePhase, BrandTodo, Brand } from '../types';

export const Brands: React.FC = () => {
  const { brands } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<LifecyclePhase | 'ALL'>('ALL');
  const [activeTodoModal, setActiveTodoModal] = useState<Brand | null>(null);

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhase = phaseFilter === 'ALL' || brand.currentPhase === phaseFilter;
    return matchesSearch && matchesPhase;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">品牌管理 (全生命周期)</h1>
        <button className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          新增品牌
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="搜索品牌名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="flex items-center text-sm text-slate-500">
            <Filter className="mr-2 h-4 w-4" />
            阶段筛选:
          </div>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as LifecyclePhase | 'ALL')}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="ALL">全部阶段</option>
            <option value="ONBOARDING">第一阶段：接入与上架</option>
            <option value="OPERATING">第二阶段：运营监控</option>
            <option value="FINANCE">第三阶段：财务与复盘</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            onClick={() => navigate(`/brands/${brand.id}`)}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-indigo-300"
          >
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img src={brand.logo} alt={brand.name} className="h-12 w-12 rounded-full border border-slate-200 object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{brand.name}</h3>
                    <p className="text-sm text-slate-500">{brand.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {brand.todos && brand.todos.filter(t => !t.completed).length > 0 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTodoModal(brand);
                      }}
                      className="inline-flex items-center justify-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 ring-1 ring-inset ring-rose-500/10 hover:bg-rose-100 transition-colors"
                    >
                      <CheckSquare className="mr-1 h-3.5 w-3.5" />
                      {brand.todos.filter(t => !t.completed).length} 待办
                    </button>
                  )}
                  <button className="text-slate-400 hover:text-slate-600" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-2 mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-500 font-medium">当前阶段</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      brand.currentPhase === 'ONBOARDING' ? 'bg-blue-100 text-blue-800' :
                      brand.currentPhase === 'OPERATING' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {brand.currentPhase === 'ONBOARDING' ? '1. 接入与上架' :
                       brand.currentPhase === 'OPERATING' ? '2. 运营监控' : '3. 财务与复盘'}
                  </span>
                </div>
                
                {/* Progress bar visual indicator based on phase */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden flex">
                  <div className={`h-1.5 ${brand.currentPhase === 'ONBOARDING' ? 'bg-blue-500 w-1/3' : brand.currentPhase === 'OPERATING' ? 'bg-indigo-500 w-2/3' : 'bg-emerald-500 w-full'}`}></div>
                </div>
              </div>

              <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-4 pt-4 border-t border-slate-100">
                <div>
                  <dt className="text-xs font-medium text-slate-500">负责人</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{brand.manager}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">健康度</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      brand.healthStatus === 'HEALTHY' ? 'bg-green-100 text-green-800' :
                      brand.healthStatus === 'AT_RISK' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {brand.healthStatus === 'HEALTHY' ? '健康' :
                       brand.healthStatus === 'AT_RISK' ? '预警' : '危机'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ))}
      </div>

      {/* Todo Modal */}
      {activeTodoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <img src={activeTodoModal.logo} alt={activeTodoModal.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                <h3 className="text-lg font-bold text-slate-900">待办事项</h3>
              </div>
              <button 
                onClick={() => setActiveTodoModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTodoModal.todos && activeTodoModal.todos.length > 0 ? (
                <ul className="space-y-3">
                  {activeTodoModal.todos.map(todo => (
                    <li key={todo.id} className="flex items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex-shrink-0 mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={todo.completed} 
                          readOnly
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" 
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {todo.text}
                        </p>
                        {todo.dueDate && (
                          <p className="text-xs text-slate-500 mt-1">截止日期: {todo.dueDate}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-slate-500 py-4">暂无待办事项</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => {
                  setActiveTodoModal(null);
                  navigate(`/brands/${activeTodoModal.id}`);
                }}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                去处理
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
