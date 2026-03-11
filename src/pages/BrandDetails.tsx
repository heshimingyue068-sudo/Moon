import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { ArrowLeft, CheckCircle2, Circle, Clock, FileText, AlertTriangle, Activity, DollarSign, BarChart3, Settings, Plus, X, History, ThumbsUp, ThumbsDown, CheckSquare, FolderOpen, Download, Upload } from 'lucide-react';
import { LifecyclePhase, BrandServiceTask, BrandOperationHistory, BrandTodo, BrandAsset, ChannelListingRule } from '../types';

export const BrandDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { brands, serviceTemplates, updateBrand } = useAppContext();
  const brand = brands.find((b) => b.id === id);

  const [activePhase, setActivePhase] = useState<LifecyclePhase>(brand?.currentPhase || 'ONBOARDING');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<string | null>(null);
  const [recordNote, setRecordNote] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(brand?.finance?.periods?.[0]?.id || '');
  const [isEditFinanceModalOpen, setIsEditFinanceModalOpen] = useState(false);
  const [editingFinancePeriod, setEditingFinancePeriod] = useState<any>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeTodoModal, setActiveTodoModal] = useState(false);
  const [activeAssetModal, setActiveAssetModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  if (!brand) {
    return <div>Brand not found</div>;
  }

  const addLog = (action: string, details: string) => {
    const newLog: BrandOperationHistory = {
      id: `oh${Date.now()}`,
      date: new Date().toLocaleString(),
      user: '1310479606@qq.com',
      action,
      details
    };
    return [newLog, ...(brand.operationHistory || [])];
  };

  const handleAddService = (templateId: string) => {
    const template = serviceTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const newService: BrandServiceTask = {
      id: `bs${Date.now()}`,
      templateId: template.id,
      name: template.name,
      frequency: template.frequency,
      targetCount: template.targetCount,
      currentCount: 0,
      records: []
    };
    
    updateBrand(brand.id, {
      operations: {
        ...brand.operations,
        services: [...(brand.operations.services || []), newService]
      },
      operationHistory: addLog('添加服务事项', `添加了【${template.name}】服务`)
    });
  };

  const handleRemoveService = (serviceId: string) => {
    const service = brand.operations.services.find(s => s.id === serviceId);
    updateBrand(brand.id, {
      operations: {
        ...brand.operations,
        services: brand.operations.services.filter(s => s.id !== serviceId)
      },
      operationHistory: addLog('移除服务事项', `移除了【${service?.name || '未知'}】服务`)
    });
  };

  const handleRecordService = () => {
    if (!isRecordModalOpen || !recordNote) return;
    
    const updatedServices = brand.operations.services.map(service => {
      if (service.id === isRecordModalOpen) {
        const today = new Date().toISOString().split('T')[0];
        return {
          ...service,
          currentCount: service.currentCount + 1,
          lastRecordDate: today,
          records: [
            { id: `r${Date.now()}`, date: today, note: recordNote },
            ...service.records
          ]
        };
      }
      return service;
    });
    
    updateBrand(brand.id, {
      operations: {
        ...brand.operations,
        services: updatedServices
      },
      operationHistory: addLog('记录服务执行', `记录了服务执行备注: ${recordNote}`)
    });
    
    setIsRecordModalOpen(null);
    setRecordNote('');
  };

  const handleAddFinancePeriod = () => {
    const now = new Date();
    const newPeriodId = `p${Date.now()}`;
    const newPeriod = {
      id: newPeriodId,
      periodName: `${now.getFullYear()}年${now.getMonth() + 1}月`,
      reconciliation: { status: 'PENDING' as const, clientAmount: 0, brandAmount: 0 },
      settlement: { status: 'PENDING' as const, amount: 0 },
      invoicing: { status: 'PENDING' as const, amount: 0 },
      collection: { status: 'PENDING' as const, amount: 0 },
    };

    updateBrand(brand.id, {
      finance: {
        ...brand.finance,
        periods: [newPeriod, ...brand.finance.periods]
      },
      operationHistory: addLog('新增财务周期', `新增了财务周期: ${newPeriod.periodName}`)
    });
    setSelectedPeriodId(newPeriodId);
  };

  const handleToggleFinanceStatus = (periodId: string, stage: 'reconciliation' | 'settlement' | 'invoicing' | 'collection') => {
    const updatedPeriods = brand.finance.periods.map(period => {
      if (period.id === periodId) {
        return {
          ...period,
          [stage]: {
            ...period[stage],
            status: period[stage].status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
          }
        };
      }
      return period;
    });

    updateBrand(brand.id, {
      finance: {
        ...brand.finance,
        periods: updatedPeriods
      },
      operationHistory: addLog('更新财务状态', `更新了财务周期状态`)
    });
  };

  const handleOpenEditFinance = () => {
    const period = brand.finance.periods.find(p => p.id === selectedPeriodId);
    if (period) {
      setEditingFinancePeriod(JSON.parse(JSON.stringify(period))); // Deep copy
      setIsEditFinanceModalOpen(true);
    }
  };

  const handleSaveFinancePeriod = () => {
    if (!editingFinancePeriod) return;

    const updatedPeriods = brand.finance.periods.map(period => 
      period.id === editingFinancePeriod.id ? editingFinancePeriod : period
    );

    updateBrand(brand.id, {
      finance: {
        ...brand.finance,
        periods: updatedPeriods
      },
      operationHistory: addLog('编辑财务数据', `编辑了财务周期: ${editingFinancePeriod.periodName}`)
    });

    setIsEditFinanceModalOpen(false);
    setEditingFinancePeriod(null);
  };

  const renderStatusIcon = (completed: boolean, inProgress: boolean = false) => {
    if (completed) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (inProgress) return <Clock className="h-5 w-5 text-yellow-500" />;
    return <Circle className="h-5 w-5 text-slate-300" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/brands')}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img src={brand.logo} alt={brand.name} className="h-16 w-16 rounded-full border border-slate-200 object-cover" referrerPolicy="no-referrer" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{brand.name}</h1>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-sm text-slate-500">{brand.category}</span>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-500">负责人: {brand.manager}</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                brand.healthStatus === 'HEALTHY' ? 'bg-green-100 text-green-800' :
                brand.healthStatus === 'AT_RISK' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {brand.healthStatus === 'HEALTHY' ? '健康' :
                 brand.healthStatus === 'AT_RISK' ? '预警' : '危机'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setActiveTodoModal(true)}
            className="inline-flex items-center justify-center rounded-md bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 shadow-sm ring-1 ring-inset ring-rose-300 hover:bg-rose-100"
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            待办事项
            {brand.todos && brand.todos.filter(t => !t.completed).length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
                {brand.todos.filter(t => !t.completed).length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveAssetModal(true)}
            className="inline-flex items-center justify-center rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-100"
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            品牌资料库
          </button>
          <button 
            onClick={() => setIsHistoryModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            <History className="mr-2 h-4 w-4" />
            操作历史
          </button>
          <button 
            onClick={() => setIsConfigModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            <Settings className="mr-2 h-4 w-4" />
            配置服务
          </button>
          <button className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
            推进阶段
          </button>
        </div>
      </div>

      {/* Lifecycle Pipeline Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <nav className="flex divide-x divide-slate-200" aria-label="Tabs">
          <button
            onClick={() => setActivePhase('ONBOARDING')}
            className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium hover:bg-slate-50 focus:z-10 ${
              activePhase === 'ONBOARDING' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center justify-center">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 mr-2 ${
                activePhase === 'ONBOARDING' ? 'border-indigo-600 text-indigo-600' : 'border-slate-300 text-slate-500'
              }`}>1</span>
              第一阶段：接入与上架
            </span>
            <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-0.5 ${activePhase === 'ONBOARDING' ? 'bg-indigo-600' : 'bg-transparent'}`} />
          </button>

          <button
            onClick={() => setActivePhase('OPERATING')}
            className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium hover:bg-slate-50 focus:z-10 ${
              activePhase === 'OPERATING' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center justify-center">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 mr-2 ${
                activePhase === 'OPERATING' ? 'border-indigo-600 text-indigo-600' : 'border-slate-300 text-slate-500'
              }`}>2</span>
              第二阶段：运营监控与财务
            </span>
            <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-0.5 ${activePhase === 'OPERATING' ? 'bg-indigo-600' : 'bg-transparent'}`} />
          </button>

          <button
            onClick={() => setActivePhase('REVIEW')}
            className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium hover:bg-slate-50 focus:z-10 ${
              activePhase === 'REVIEW' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center justify-center">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 mr-2 ${
                activePhase === 'REVIEW' ? 'border-indigo-600 text-indigo-600' : 'border-slate-300 text-slate-500'
              }`}>3</span>
              第三阶段：复盘与案例
            </span>
            <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-0.5 ${activePhase === 'REVIEW' ? 'bg-indigo-600' : 'bg-transparent'}`} />
          </button>
        </nav>
      </div>

      {/* Content Area based on Phase */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Phase 1: Onboarding */}
        {activePhase === 'ONBOARDING' && (
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-900 flex items-center">
                  <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                  1. 品牌签约 (核心信息)
                </h3>
                {renderStatusIcon(brand.onboarding.signing.completed)}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-lg border border-slate-100">
                <div>
                  <dt className="text-sm font-medium text-slate-500">发票税率</dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">{brand.onboarding.signing.taxRate}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">付款模式</dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">{brand.onboarding.signing.paymentMode}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">成本价/服务费</dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">{brand.onboarding.signing.costPriceDesc}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">结算模式</dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">{brand.onboarding.signing.settlementMode}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">年度采购量预估</dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">{brand.onboarding.signing.annualProcurement}</dd>
                </div>
                {brand.onboarding.signing.contractDetails && (
                  <div className="col-span-2 md:col-span-3 border-t border-slate-200 pt-4 mt-2">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">合同详细信息</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <dt className="text-xs font-medium text-slate-500">合同状态</dt>
                        <dd className="mt-1">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            brand.onboarding.signing.contractDetails.status === 'SIGNED' ? 'bg-green-100 text-green-800' :
                            brand.onboarding.signing.contractDetails.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {brand.onboarding.signing.contractDetails.status === 'SIGNED' ? '已签约' :
                             brand.onboarding.signing.contractDetails.status === 'DRAFT' ? '草稿/审核中' : '已过期'}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-slate-500">有效期</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">
                          {brand.onboarding.signing.contractDetails.validFrom} 至 {brand.onboarding.signing.contractDetails.validTo}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs font-medium text-slate-500">签约主体</dt>
                        <dd className="mt-1 text-sm text-slate-900">
                          <span className="font-medium">甲方:</span> {brand.onboarding.signing.contractDetails.partyA}<br/>
                          <span className="font-medium">乙方:</span> {brand.onboarding.signing.contractDetails.partyB}
                        </dd>
                      </div>
                    </div>
                    <div className="mt-4">
                      <dt className="text-xs font-medium text-slate-500 mb-2">已上传合同文件</dt>
                      <dd>
                        <ul className="space-y-2">
                          {brand.onboarding.signing.contractDetails.files.map((file, idx) => (
                            <li key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-md">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-slate-400 mr-2" />
                                <span className="text-sm text-indigo-600 hover:underline cursor-pointer">{file.name}</span>
                              </div>
                              <button className="text-slate-400 hover:text-slate-600"><Download className="h-4 w-4" /></button>
                            </li>
                          ))}
                        </ul>
                        <button className="mt-3 inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-xs font-medium rounded text-slate-700 bg-white hover:bg-slate-50">
                          <Upload className="h-3.5 w-3.5 mr-1.5" />
                          上传新文件
                        </button>
                      </dd>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-900">2. 品牌系统对接</h3>
                  {renderStatusIcon(brand.onboarding.brandApi.completed, brand.onboarding.brandApi.progress > 0)}
                </div>
                <p className="text-sm text-slate-600 mb-4">系统API对接过程，涉及到品牌方具体的商品及逻辑规则。</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">对接进度</span>
                    <span className="text-indigo-600 font-medium">{brand.onboarding.brandApi.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${brand.onboarding.brandApi.progress}%` }}></div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-100">
                    <p className="text-sm text-yellow-800 flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      {brand.onboarding.brandApi.notes || '暂无备注'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-900">3. 品牌商品上架渠道商</h3>
                  {renderStatusIcon(brand.onboarding.channelListing.completed)}
                </div>
                <p className="text-sm text-slate-600 mb-4">上架资料包括品牌授权，ICP备案，商品详情，结算规则等。</p>
                
                {brand.onboarding.channelListing.listings && brand.onboarding.channelListing.listings.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">选择上架客户</label>
                      <select 
                        className="block w-full rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        value={selectedClientId || brand.onboarding.channelListing.listings[0].clientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                      >
                        {brand.onboarding.channelListing.listings.map(listing => (
                          <option key={listing.clientId} value={listing.clientId}>{listing.clientName}</option>
                        ))}
                      </select>
                    </div>
                    
                    {(() => {
                      const activeListing = brand.onboarding.channelListing.listings!.find(l => l.clientId === (selectedClientId || brand.onboarding.channelListing.listings![0].clientId));
                      if (!activeListing) return null;
                      return (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">{activeListing.clientName} 上架规则</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              activeListing.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              activeListing.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {activeListing.status === 'COMPLETED' ? '已完成' : activeListing.status === 'IN_PROGRESS' ? '进行中' : '未开始'}
                            </span>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">上架要求</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {activeListing.rules.map((rule, idx) => (
                                <li key={idx} className="text-sm text-slate-700">{rule}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">所需资料</h4>
                            <div className="flex flex-wrap gap-2">
                              {activeListing.requiredMaterials.map((mat, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white border border-slate-200 text-slate-600">
                                  {mat}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">相关模板下载</h4>
                            <ul className="space-y-2">
                              {activeListing.templates.map((tpl, idx) => (
                                <li key={idx} className="flex items-center text-sm">
                                  <FileText className="h-4 w-4 text-indigo-500 mr-2" />
                                  <a href={tpl.url} className="text-indigo-600 hover:underline">{tpl.name}</a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-slate-700 block mb-2">目标渠道:</span>
                      <div className="flex flex-wrap gap-2">
                        {brand.onboarding.channelListing.channels.map(channel => (
                          <span key={channel} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {channel}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
                      <p className="text-sm text-slate-700">
                        <strong>进度备注:</strong> {brand.onboarding.channelListing.notes || '暂无备注'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-900">4. 渠道商系统对接</h3>
                  {renderStatusIcon(brand.onboarding.channelApi.completed, brand.onboarding.channelApi.progress > 0)}
                </div>
                <p className="text-sm text-slate-600 mb-4">与客户进行系统打通，涉及商品完成逻辑规则。</p>
                <div className="space-y-3 max-w-md">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">对接进度</span>
                    <span className="text-indigo-600 font-medium">{brand.onboarding.channelApi.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${brand.onboarding.channelApi.progress}%` }}></div>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{brand.onboarding.channelApi.notes}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Operating */}
        {activePhase === 'OPERATING' && (
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-900 flex items-center">
                  <BarChart3 className="h-5 w-5 text-indigo-500 mr-2" />
                  5. 中期核心数据监控
                </h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                  <Settings className="h-4 w-4 mr-1" />
                  数据设置
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-1">销售额</p>
                  <p className="text-2xl font-semibold text-slate-900">¥{(brand.operations.coreMetrics.salesAmount / 10000).toFixed(2)}w</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-1">订单数</p>
                  <p className="text-2xl font-semibold text-slate-900">{brand.operations.coreMetrics.orderCount.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-1">客诉率</p>
                  <p className={`text-2xl font-semibold ${brand.operations.coreMetrics.complaintRate > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                    {brand.operations.coreMetrics.complaintRate}%
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-1">使用率</p>
                  <p className="text-2xl font-semibold text-slate-900">{brand.operations.coreMetrics.usageRate}%</p>
                </div>
                <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                  <p className="text-sm font-medium text-indigo-700 mb-1">KPI 达标率</p>
                  <p className="text-2xl font-semibold text-indigo-900">{brand.operations.coreMetrics.targetReachRate}%</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Services Configuration & Execution */}
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 lg:col-span-2">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 flex items-center">
                      <Activity className="h-5 w-5 text-indigo-500 mr-2" />
                      服务执行大厅
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">管理并记录该品牌的所有标准化服务动作</p>
                  </div>
                  <button 
                    onClick={() => setIsConfigModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
                  >
                    <Settings className="mr-1.5 h-4 w-4" />
                    配置服务
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brand.operations.services && brand.operations.services.length > 0 ? (
                    brand.operations.services.map(service => (
                      <div key={service.id} className="group relative p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all hover:border-indigo-200">
                        <button 
                          onClick={() => handleRemoveService(service.id)}
                          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="移除服务"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="flex justify-between items-start mb-3">
                          <div className="pr-6">
                            <h4 className="font-semibold text-slate-900 text-base">{service.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {service.frequency === 'DAILY' ? '每天' : service.frequency === 'WEEKLY' ? '每周' : service.frequency === 'MONTHLY' ? '每月' : '自定义'} {service.targetCount} 次
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold ${
                              service.currentCount >= service.targetCount ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {service.currentCount}/{service.targetCount}
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                          <div 
                            className={`h-2 transition-all duration-500 ${service.currentCount >= service.targetCount ? 'bg-green-500' : 'bg-yellow-500'}`} 
                            style={{ width: `${Math.min((service.currentCount / service.targetCount) * 100, 100)}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                          <span className="text-xs text-slate-500">
                            最新: <span className="font-medium text-slate-700">{service.lastRecordDate || '暂无'}</span>
                          </span>
                          <button 
                            onClick={() => setIsRecordModalOpen(service.id)}
                            className="inline-flex items-center text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            记录执行
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                      <FileText className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 font-medium">暂未配置服务事项</p>
                      <p className="text-xs text-slate-500 mt-1 mb-4">为该品牌配置标准化的服务动作进行管控</p>
                      <button 
                        onClick={() => setIsConfigModalOpen(true)}
                        className="inline-flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-800"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        立即配置
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Activities & Feedbacks */}
              <div className="space-y-6">
                <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-slate-900">近期活动</h3>
                    <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">新增</button>
                  </div>
                  <div className="space-y-3">
                    {brand.operations.activities.length > 0 ? brand.operations.activities.map(act => (
                      <div key={act.id} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-800">{act.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          act.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          act.status === 'PLANNING' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {act.status === 'ACTIVE' ? '进行中' : act.status === 'PLANNING' ? '筹备中' : act.status}
                        </span>
                      </div>
                    )) : <p className="text-sm text-slate-500 text-center py-4">暂无活动</p>}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-slate-900">沟通与反馈</h3>
                    <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">新增</button>
                  </div>
                  <div className="space-y-3">
                    {brand.operations.feedbacks.length > 0 ? brand.operations.feedbacks.map(fb => (
                      <div key={fb.id} className="text-sm p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500">{fb.date}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{fb.content}</p>
                      </div>
                    )) : <p className="text-sm text-slate-500 text-center py-4">暂无反馈记录</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Finance Section moved to Phase 2 */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-medium text-slate-900 flex items-center">
                  <DollarSign className="h-5 w-5 text-emerald-500 mr-2" />
                  6. 财务对账与结算链路
                </h3>
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedPeriodId}
                    onChange={(e) => setSelectedPeriodId(e.target.value)}
                    className="block w-40 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    {brand.finance.periods.length === 0 && <option value="">暂无周期</option>}
                    {brand.finance.periods.map(p => (
                      <option key={p.id} value={p.id}>{p.periodName}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddFinancePeriod}
                    className="inline-flex items-center justify-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    新增周期
                  </button>
                  {brand.finance.periods.length > 0 && (
                    <button
                      onClick={handleOpenEditFinance}
                      className="inline-flex items-center justify-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      编辑数据
                    </button>
                  )}
                </div>
              </div>
              
              {brand.finance.periods.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <DollarSign className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 font-medium mb-4">暂无财务对账记录</p>
                  <button
                    onClick={handleAddFinancePeriod}
                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    创建首个财务周期
                  </button>
                </div>
              ) : (
                <div className="relative">
                  {/* Connecting line */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2 hidden md:block"></div>
                  
                  {(() => {
                    const currentPeriod = brand.finance.periods.find(p => p.id === selectedPeriodId) || brand.finance.periods[0];
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Reconciliation */}
                        <div className="bg-white p-4 rounded-lg border-2 border-slate-200 shadow-sm relative flex flex-col h-full">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-bold text-slate-800">1. 财务对账</h4>
                            {renderStatusIcon(currentPeriod.reconciliation.status === 'COMPLETED')}
                          </div>
                          <p className="text-xs text-slate-500 mb-3">客户与公司，公司与品牌对账</p>
                          <div className="space-y-1 text-sm flex-1">
                            <div className="flex justify-between">
                              <span className="text-slate-600">客户对账:</span>
                              <span className="font-medium">¥{currentPeriod.reconciliation.clientAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">品牌对账:</span>
                              <span className="font-medium">¥{currentPeriod.reconciliation.brandAmount.toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleFinanceStatus(currentPeriod.id, 'reconciliation')}
                            className={`mt-4 w-full py-1.5 rounded text-xs font-medium transition-colors ${
                              currentPeriod.reconciliation.status === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {currentPeriod.reconciliation.status === 'COMPLETED' ? '标记为待处理' : '标记为已完成'}
                          </button>
                        </div>

                        {/* Settlement */}
                        <div className="bg-white p-4 rounded-lg border-2 border-slate-200 shadow-sm relative flex flex-col h-full">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-bold text-slate-800">2. 结算</h4>
                            {renderStatusIcon(currentPeriod.settlement.status === 'COMPLETED')}
                          </div>
                          <p className="text-xs text-slate-500 mb-3">确认最终结算金额</p>
                          <div className="text-sm flex justify-between items-center mt-6 flex-1">
                            <span className="text-slate-600">结算金额:</span>
                            <span className="font-bold text-lg text-emerald-600">¥{currentPeriod.settlement.amount.toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => handleToggleFinanceStatus(currentPeriod.id, 'settlement')}
                            className={`mt-4 w-full py-1.5 rounded text-xs font-medium transition-colors ${
                              currentPeriod.settlement.status === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {currentPeriod.settlement.status === 'COMPLETED' ? '标记为待处理' : '标记为已完成'}
                          </button>
                        </div>

                        {/* Invoicing */}
                        <div className="bg-white p-4 rounded-lg border-2 border-slate-200 shadow-sm relative flex flex-col h-full">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-bold text-slate-800">3. 开票</h4>
                            {renderStatusIcon(currentPeriod.invoicing.status === 'COMPLETED')}
                          </div>
                          <p className="text-xs text-slate-500 mb-3">根据结算金额开具发票</p>
                          <div className="space-y-1 text-sm mt-2 flex-1">
                            <div className="flex justify-between">
                              <span className="text-slate-600">开票金额:</span>
                              <span className="font-medium">¥{currentPeriod.invoicing.amount.toLocaleString()}</span>
                            </div>
                            {currentPeriod.invoicing.invoiceNo && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">发票号:</span>
                                <span className="font-medium text-xs text-slate-500">{currentPeriod.invoicing.invoiceNo}</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggleFinanceStatus(currentPeriod.id, 'invoicing')}
                            className={`mt-4 w-full py-1.5 rounded text-xs font-medium transition-colors ${
                              currentPeriod.invoicing.status === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {currentPeriod.invoicing.status === 'COMPLETED' ? '标记为待处理' : '标记为已完成'}
                          </button>
                        </div>

                        {/* Collection */}
                        <div className="bg-white p-4 rounded-lg border-2 border-slate-200 shadow-sm relative flex flex-col h-full">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-bold text-slate-800">4. 收款</h4>
                            {renderStatusIcon(currentPeriod.collection.status === 'COMPLETED')}
                          </div>
                          <p className="text-xs text-slate-500 mb-3">确认资金到账</p>
                          <div className="text-sm flex justify-between items-center mt-6 flex-1">
                            <span className="text-slate-600">待收/已收:</span>
                            <span className="font-medium">¥{currentPeriod.collection.amount.toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => handleToggleFinanceStatus(currentPeriod.id, 'collection')}
                            className={`mt-4 w-full py-1.5 rounded text-xs font-medium transition-colors ${
                              currentPeriod.collection.status === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {currentPeriod.collection.status === 'COMPLETED' ? '标记为待处理' : '标记为已完成'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 3: Review & Cases */}
        {activePhase === 'REVIEW' && (
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-900">7. 后期复盘总结</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">新建复盘</button>
              </div>
              <p className="text-sm text-slate-600 mb-4">运营过程中出现的问题进行总结，业绩突出总结复制到其他品牌。</p>
              
              <div className="space-y-4">
                {brand.reviews?.length > 0 ? brand.reviews.map(review => (
                  <div key={review.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-900">{review.title}</h4>
                      <span className="text-xs text-slate-500">{review.date}</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{review.summary}</p>
                    {review.isReplicable && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        ⭐ 优秀经验可复制
                      </span>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-sm text-slate-500">暂无复盘记录</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Success Cases */}
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center">
                    <ThumbsUp className="h-5 w-5 text-emerald-500 mr-2" />
                    品牌优秀案例
                  </h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">新增</button>
                </div>
                <div className="space-y-4">
                  {brand.cases?.filter(c => c.type === 'SUCCESS').length > 0 ? (
                    brand.cases.filter(c => c.type === 'SUCCESS').map(c => (
                      <div key={c.id} className="p-4 rounded-lg border border-emerald-100 bg-emerald-50/50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900">{c.title}</h4>
                          <span className="text-xs text-slate-500">{c.date}</span>
                        </div>
                        <p className="text-sm text-slate-700">{c.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                      <p className="text-sm text-slate-500">暂无优秀案例</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Failure Cases */}
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center">
                    <ThumbsDown className="h-5 w-5 text-red-500 mr-2" />
                    品牌失败案例
                  </h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">新增</button>
                </div>
                <div className="space-y-4">
                  {brand.cases?.filter(c => c.type === 'FAILURE').length > 0 ? (
                    brand.cases.filter(c => c.type === 'FAILURE').map(c => (
                      <div key={c.id} className="p-4 rounded-lg border border-red-100 bg-red-50/50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900">{c.title}</h4>
                          <span className="text-xs text-slate-500">{c.date}</span>
                        </div>
                        <p className="text-sm text-slate-700">{c.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                      <p className="text-sm text-slate-500">暂无失败案例</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Configuration Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">配置服务事项</h3>
              <button 
                onClick={() => setIsConfigModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {serviceTemplates.map(template => {
                const isAdded = brand.operations.services?.some(s => s.templateId === template.id);
                return (
                  <div key={template.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{template.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{template.targetRole} · {template.targetCount}次/{template.frequency === 'WEEKLY' ? '周' : template.frequency === 'MONTHLY' ? '月' : '天'}</p>
                    </div>
                    <button
                      onClick={() => isAdded ? null : handleAddService(template.id)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isAdded 
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      {isAdded ? '已添加' : '添加'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Execution Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">记录服务执行</h3>
              <button 
                onClick={() => {
                  setIsRecordModalOpen(null);
                  setRecordNote('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">执行备注</label>
                <textarea
                  value={recordNote}
                  onChange={(e) => setRecordNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="简要描述本次服务的内容..."
                  autoFocus
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsRecordModalOpen(null);
                  setRecordNote('');
                }}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleRecordService}
                disabled={!recordNote.trim()}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                保存记录
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Finance Period Modal */}
      {isEditFinanceModalOpen && editingFinancePeriod && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">编辑财务数据</h3>
              <button 
                onClick={() => {
                  setIsEditFinanceModalOpen(false);
                  setEditingFinancePeriod(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">周期名称</label>
                <input
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={editingFinancePeriod.periodName}
                  onChange={(e) => setEditingFinancePeriod({...editingFinancePeriod, periodName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <h4 className="text-sm font-semibold text-slate-900 border-b pb-2 mb-3">1. 财务对账</h4>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">客户对账金额</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-500 sm:text-sm">¥</span>
                    </div>
                    <input
                      type="number"
                      className="block w-full rounded-md border-0 py-1.5 pl-7 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={editingFinancePeriod.reconciliation.clientAmount}
                      onChange={(e) => setEditingFinancePeriod({
                        ...editingFinancePeriod,
                        reconciliation: { ...editingFinancePeriod.reconciliation, clientAmount: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">品牌对账金额</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-500 sm:text-sm">¥</span>
                    </div>
                    <input
                      type="number"
                      className="block w-full rounded-md border-0 py-1.5 pl-7 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={editingFinancePeriod.reconciliation.brandAmount}
                      onChange={(e) => setEditingFinancePeriod({
                        ...editingFinancePeriod,
                        reconciliation: { ...editingFinancePeriod.reconciliation, brandAmount: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>

                <div className="col-span-2 mt-2">
                  <h4 className="text-sm font-semibold text-slate-900 border-b pb-2 mb-3">2. 结算</h4>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">结算金额</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-500 sm:text-sm">¥</span>
                    </div>
                    <input
                      type="number"
                      className="block w-full rounded-md border-0 py-1.5 pl-7 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={editingFinancePeriod.settlement.amount}
                      onChange={(e) => setEditingFinancePeriod({
                        ...editingFinancePeriod,
                        settlement: { ...editingFinancePeriod.settlement, amount: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>

                <div className="col-span-2 mt-2">
                  <h4 className="text-sm font-semibold text-slate-900 border-b pb-2 mb-3">3. 开票</h4>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">开票金额</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-500 sm:text-sm">¥</span>
                    </div>
                    <input
                      type="number"
                      className="block w-full rounded-md border-0 py-1.5 pl-7 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={editingFinancePeriod.invoicing.amount}
                      onChange={(e) => setEditingFinancePeriod({
                        ...editingFinancePeriod,
                        invoicing: { ...editingFinancePeriod.invoicing, amount: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">发票号</label>
                  <input
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 pl-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={editingFinancePeriod.invoicing.invoiceNo || ''}
                    placeholder="选填"
                    onChange={(e) => setEditingFinancePeriod({
                      ...editingFinancePeriod,
                      invoicing: { ...editingFinancePeriod.invoicing, invoiceNo: e.target.value }
                    })}
                  />
                </div>

                <div className="col-span-2 mt-2">
                  <h4 className="text-sm font-semibold text-slate-900 border-b pb-2 mb-3">4. 收款</h4>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">收款金额</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-500 sm:text-sm">¥</span>
                    </div>
                    <input
                      type="number"
                      className="block w-full rounded-md border-0 py-1.5 pl-7 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={editingFinancePeriod.collection.amount}
                      onChange={(e) => setEditingFinancePeriod({
                        ...editingFinancePeriod,
                        collection: { ...editingFinancePeriod.collection, amount: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsEditFinanceModalOpen(false);
                    setEditingFinancePeriod(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveFinancePeriod}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  保存数据
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <History className="h-5 w-5 mr-2 text-indigo-600" />
                操作历史记录
              </h3>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {brand.operationHistory && brand.operationHistory.length > 0 ? (
                  <div className="flow-root">
                    <ul role="list" className="-mb-8">
                      {brand.operationHistory.map((log, logIdx) => (
                        <li key={log.id}>
                          <div className="relative pb-8">
                            {logIdx !== brand.operationHistory.length - 1 ? (
                              <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center ring-8 ring-white">
                                  <div className="h-2 w-2 rounded-full bg-indigo-600" />
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm text-slate-500">
                                    <span className="font-medium text-slate-900">{log.user}</span> {log.action}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-600">{log.details}</p>
                                </div>
                                <div className="whitespace-nowrap text-right text-xs text-slate-500">
                                  {log.date}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-2 text-sm font-semibold text-slate-900">暂无记录</h3>
                    <p className="mt-1 text-sm text-slate-500">该品牌暂无任何操作历史记录。</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Todo Modal */}
      {activeTodoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">待办事项</h3>
              <button onClick={() => setActiveTodoModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {brand.todos && brand.todos.length > 0 ? (
                <ul className="space-y-3">
                  {brand.todos.map(todo => (
                    <li key={todo.id} className="flex items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex-shrink-0 mt-0.5">
                        <input type="checkbox" checked={todo.completed} readOnly className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{todo.text}</p>
                        {todo.dueDate && <p className="text-xs text-slate-500 mt-1">截止日期: {todo.dueDate}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-slate-500 py-4">暂无待办事项</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Asset Modal */}
      {activeAssetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">品牌资料库</h3>
              <button onClick={() => setActiveAssetModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-slate-500">已维护的品牌资料文件</p>
                <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  上传资料
                </button>
              </div>
              {brand.assets && brand.assets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {brand.assets.map(asset => (
                    <div key={asset.id} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-4 flex-shrink-0">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{asset.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">上传于 {asset.uploadDate}</p>
                      </div>
                      <button className="ml-2 text-slate-400 hover:text-indigo-600">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">暂无品牌资料</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
