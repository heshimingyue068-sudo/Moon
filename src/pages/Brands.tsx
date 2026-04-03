import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { Search, Plus, Filter, MoreVertical, CheckSquare, X, ChevronRight, ChevronDown, Download, Settings } from 'lucide-react';
import { LifecyclePhase, BrandTodo, Brand } from '../types';
import { EntityServiceConfig } from '../components/EntityServiceConfig';

export const Brands: React.FC = () => {
  const { brands, addBrand, companyEntities } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<LifecyclePhase | 'ALL'>('ALL');
  const [activeTodoModal, setActiveTodoModal] = useState<Brand | null>(null);
  const [configServiceModal, setConfigServiceModal] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Brand> & { contractDetails?: any }>({
    name: '',
    category: '',
    manager: '',
    clientId: '',
    brandIds: [],
    contractDetails: {
      status: 'DRAFT',
      partyA: '',
      partyB: '',
      validFrom: '',
      validTo: '',
      files: []
    }
  });

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, qualType: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).map(f => ({
        id: `a${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${qualType}_${f.name}`,
        type: 'OTHER' as const,
        url: URL.createObjectURL(f),
        uploadDate: new Date().toISOString().split('T')[0]
      }));
      
      setNewProject(prev => ({
        ...prev,
        assets: [...(prev.assets || []), ...files]
      }));
    }
  };

  const handleAddProject = () => {
    if (!newProject.name || !newProject.category || !newProject.manager || !newProject.clientId) return;
    
    const selectedBrands = companyEntities.filter(e => newProject.brandIds?.includes(e.id)).map(e => e.name);

    const projectToAdd: Brand = {
      id: `p${Date.now()}`,
      name: newProject.name,
      clientId: newProject.clientId,
      brandIds: newProject.brandIds || [],
      brands: selectedBrands,
      logo: `https://picsum.photos/seed/${newProject.name}/200/200`,
      category: newProject.category,
      manager: newProject.manager,
      operators: [],
      healthStatus: 'HEALTHY',
      currentPhase: 'ONBOARDING',
      todos: [],
      assets: [],
      operationHistory: [],
      cases: [],
      onboarding: {
        signing: {
          completed: false,
          taxRate: '',
          paymentMode: '',
          costPriceDesc: '',
          settlementMode: '',
          annualProcurement: '',
          contractDetails: newProject.contractDetails,
        },
        brandApi: { completed: false, progress: 0, notes: '' },
        channelListing: { completed: false, channels: [], notes: '' },
        channelApi: { completed: false, progress: 0, notes: '' },
      },
      operations: {
        coreMetrics: {
          salesAmount: 0,
          orderCount: 0,
          complaintRate: 0,
          usageRate: 0,
          targetReachRate: 0,
        },
        services: [],
        reports: [],
        activities: [],
      },
      finance: {
        periods: [],
      },
      reviews: [],
      contracts: newProject.contractDetails ? [newProject.contractDetails] : [],
    };

    addBrand(projectToAdd);
    setIsAddModalOpen(false);
    setNewProject({ 
      name: '', category: '', manager: '', clientId: '', brandIds: [],
      contractDetails: { status: 'DRAFT', partyA: '', partyB: '', validFrom: '', validTo: '', files: [] }
    });
  };

  const toggleSubBrand = (brandId: string) => {
    setNewProject(prev => {
      const currentBrands = prev.brandIds || [];
      if (currentBrands.includes(brandId)) {
        return { ...prev, brandIds: currentBrands.filter(id => id !== brandId) };
      } else {
        return { ...prev, brandIds: [...currentBrands, brandId] };
      }
    });
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhase = phaseFilter === 'ALL' || brand.currentPhase === phaseFilter;
    return matchesSearch && matchesPhase;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">项目管理 (全生命周期)</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          新增项目
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
            placeholder="搜索项目名称..."
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-indigo-300"
          >
            <div 
              onClick={() => {
                if (brand.brands && brand.brands.length > 0) {
                  toggleProject(brand.id);
                } else {
                  navigate(`/brands/${brand.id}`);
                }
              }}
              className="flex flex-1 flex-col p-6 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img src={brand.logo} alt={brand.name} className="h-12 w-12 rounded-full border border-slate-200 object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{brand.name}</h3>
                    <p className="text-sm text-slate-500">{brand.category}</p>
                    {brand.brands && brand.brands.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">包含品牌: {brand.brands.join(', ')}</p>
                    )}
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfigServiceModal(brand.id);
                    }}
                    className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-500/10 hover:bg-indigo-100 transition-colors"
                  >
                    <Settings className="mr-1 h-3.5 w-3.5" />
                    配置服务
                  </button>
                  {brand.brands && brand.brands.length > 0 ? (
                    <button className="text-slate-400 hover:text-slate-600" onClick={(e) => { e.stopPropagation(); toggleProject(brand.id); }}>
                      {expandedProjects.has(brand.id) ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                  ) : (
                    <button className="text-slate-400 hover:text-slate-600" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  )}
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
            
            {expandedProjects.has(brand.id) && brand.brands && brand.brands.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50 p-4">
                <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">旗下品牌</h4>
                <div className="space-y-2">
                  {brand.brands.map(subBrand => (
                    <button
                      key={subBrand}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/brands/${brand.id}?brand=${encodeURIComponent(subBrand)}`);
                      }}
                      className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all text-left group/brand"
                    >
                      <span className="text-sm font-medium text-slate-700 group-hover/brand:text-indigo-600">{subBrand}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover/brand:text-indigo-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                        <div className="flex items-center gap-2 mt-1">
                          {todo.brandName && <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">{todo.brandName}</span>}
                          {todo.dueDate && !todo.completed && <span className="text-xs text-slate-500">截止日期: {todo.dueDate}</span>}
                          {todo.completed && todo.completedAt && <span className="text-xs text-green-600">完成时间: {todo.completedAt}</span>}
                        </div>
                      </div>
                      {todo.completed && todo.materialName && (
                        <button className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors ml-3 shrink-0">
                          <Download className="w-3 h-3" />
                          {todo.materialName}
                        </button>
                      )}
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

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">新增项目</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">项目名称</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：杭研宠物大健康项目"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">类目</label>
                <input
                  type="text"
                  value={newProject.category}
                  onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：宠物医疗"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">负责人</label>
                <input
                  type="text"
                  value={newProject.manager}
                  onChange={(e) => setNewProject({ ...newProject, manager: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：张三"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">选择客户</label>
                <select
                  value={newProject.clientId || ''}
                  onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">请选择客户...</option>
                  {companyEntities.filter(e => e.type === 'CLIENT').map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">选择品牌 (可多选)</label>
                <div className="border border-slate-300 rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                  {companyEntities.filter(e => e.type === 'BRAND').map(brand => (
                    <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(newProject.brandIds || []).includes(brand.id)}
                        onChange={() => toggleSubBrand(brand.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-medium text-slate-900 mb-3">合同信息</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">合同状态</label>
                    <select
                      value={newProject.contractDetails?.status || 'DRAFT'}
                      onChange={(e) => setNewProject({
                        ...newProject,
                        contractDetails: { ...newProject.contractDetails!, status: e.target.value as any }
                      })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="DRAFT">草稿</option>
                      <option value="SIGNED">已签署</option>
                      <option value="EXPIRED">已过期</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">甲方 (客户)</label>
                    <input
                      type="text"
                      value={newProject.contractDetails?.partyA || ''}
                      onChange={(e) => setNewProject({
                        ...newProject,
                        contractDetails: { ...newProject.contractDetails!, partyA: e.target.value }
                      })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="甲方名称"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">乙方 (服务商)</label>
                    <input
                      type="text"
                      value={newProject.contractDetails?.partyB || ''}
                      onChange={(e) => setNewProject({
                        ...newProject,
                        contractDetails: { ...newProject.contractDetails!, partyB: e.target.value }
                      })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="乙方名称"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">生效日期</label>
                    <input
                      type="date"
                      value={newProject.contractDetails?.validFrom || ''}
                      onChange={(e) => setNewProject({
                        ...newProject,
                        contractDetails: { ...newProject.contractDetails!, validFrom: e.target.value }
                      })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">失效日期</label>
                    <input
                      type="date"
                      value={newProject.contractDetails?.validTo || ''}
                      onChange={(e) => setNewProject({
                        ...newProject,
                        contractDetails: { ...newProject.contractDetails!, validTo: e.target.value }
                      })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">合同附件</label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const files = Array.from(e.target.files).map(f => ({
                            name: f.name,
                            url: URL.createObjectURL(f)
                          }));
                          setNewProject(prev => ({
                            ...prev,
                            contractDetails: {
                              ...prev.contractDetails!,
                              files: [...(prev.contractDetails?.files || []), ...files]
                            }
                          }));
                        }
                      }}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button 
                onClick={handleAddProject}
                disabled={!newProject.name || !newProject.category || !newProject.manager || !newProject.clientId}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认新增
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Config Service Modal */}
      {configServiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">配置项目服务事项</h3>
              <button
                onClick={() => setConfigServiceModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              <EntityServiceConfig entityId={configServiceModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
