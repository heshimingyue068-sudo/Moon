import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { ArrowLeft, Building2, Tag, Phone, User, FileText, Calendar, BarChart3, CheckCircle2, Clock, Edit2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { EntityServiceConfig } from '../components/EntityServiceConfig';

export const CompanyInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companyEntities, brands: projects, operators, updateCompanyEntity } = useAppContext();

  const entity = companyEntities.find(e => e.id === id);

  const [isEditingManager, setIsEditingManager] = useState(false);
  const [selectedManager, setSelectedManager] = useState(entity?.manager || '');
  const [summaryPeriod, setSummaryPeriod] = useState<'WEEK' | 'MONTH'>('MONTH');
  const [selectedReportType, setSelectedReportType] = useState<'TOTAL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  if (!entity) {
    return <div className="p-8 text-center text-slate-500">未找到该客户/品牌</div>;
  }

  const handleSaveManager = () => {
    updateCompanyEntity(entity.id, { manager: selectedManager });
    setIsEditingManager(false);
  };

  const relatedProjects = projects.filter(p => p.clientId === entity.id || p.brandIds?.includes(entity.id));
  const relatedEntities = companyEntities.filter(e => entity.relatedEntityIds?.includes(e.id));

  const allReports = relatedProjects.flatMap(project =>
    (project.operations?.reports || []).map(report => ({
      ...report,
      projectName: project.name,
      projectId: project.id
    }))
  );

  // Helper to check date (using 2026-03-29 as current date for mock)
  const isCurrentWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date('2026-03-29');
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return date >= startOfWeek && date <= endOfWeek;
  };

  const isCurrentMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date('2026-03-29');
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const filteredReports = allReports.filter(r => r.status === 'SUBMITTED' && (summaryPeriod === 'WEEK' ? isCurrentWeek(r.date) : isCurrentMonth(r.date)));

  const sortedReports = [...filteredReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const reportSummary = {
    total: filteredReports.length,
    daily: filteredReports.filter(r => r.type === 'DAILY').length,
    weekly: filteredReports.filter(r => r.type === 'WEEKLY').length,
    monthly: filteredReports.filter(r => r.type === 'MONTHLY').length,
  };

  const getOperatorBreakdown = (type: 'TOTAL' | 'DAILY' | 'WEEKLY' | 'MONTHLY') => {
    const targetReports = type === 'TOTAL' ? filteredReports : filteredReports.filter(r => r.type === type);
    const breakdown: Record<string, number> = {};
    targetReports.forEach(r => {
      const op = r.operator || '未知人员';
      breakdown[op] = (breakdown[op] || 0) + 1;
    });
    return breakdown;
  };

  const entityResources = (entity.resources || []).map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    url: r.url,
    uploadDate: r.uploadTime,
    source: '基础资料'
  }));

  const projectAssets = relatedProjects.flatMap(project =>
    (project.assets || []).map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      url: asset.url,
      uploadDate: asset.uploadDate,
      source: project.name
    }))
  );

  const allResources = [...entityResources, ...projectAssets].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-2xl font-semibold text-slate-900">资料详情</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-start gap-6">
          <img src={entity.logo} alt={entity.name} className="w-24 h-24 rounded-xl border border-slate-200 object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">{entity.name}</h2>
              {entity.type === 'CLIENT' ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"><Building2 className="w-3 h-3" /> 客户</span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20"><Tag className="w-3 h-3" /> 品牌</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4 text-slate-400" />
                <span>联系人: {entity.contactPerson || '未配置'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>联系电话: {entity.contactPhone || '未配置'}</span>
              </div>
              {entity.type === 'BRAND' && (
                <>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>职位/部门: {entity.contactPosition || '未配置'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <span>类别(合作方式): {entity.category || '未配置'}</span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="flex items-center gap-2">
                  负责人: 
                  {isEditingManager ? (
                    <div className="flex items-center gap-2">
                      <select 
                        value={selectedManager} 
                        onChange={(e) => setSelectedManager(e.target.value)}
                        className="text-sm border border-slate-300 rounded px-2 py-1 bg-white"
                      >
                        <option value="">请选择负责人</option>
                        {operators.map(op => (
                          <option key={op.id} value={op.name}>{op.name}</option>
                        ))}
                      </select>
                      <button onClick={handleSaveManager} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">保存</button>
                      <button onClick={() => { setIsEditingManager(false); setSelectedManager(entity.manager || ''); }} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300">取消</button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-slate-900">{entity.manager || '未分配'}</span>
                      <button onClick={() => setIsEditingManager(true)} className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                {entity.type === 'CLIENT' ? '客户基本信息' : '品牌基本信息'}
              </h3>
              {entity.contractDetails ? (
                <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">合同状态</span>
                    <span className="font-medium text-slate-900">
                      {entity.contractDetails.status === 'SIGNED' ? '已签署' : entity.contractDetails.status === 'DRAFT' ? '草稿' : '已过期'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">甲方</span>
                    <span className="font-medium text-slate-900">{entity.contractDetails.partyA}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">乙方</span>
                    <span className="font-medium text-slate-900">{entity.contractDetails.partyB}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">有效期</span>
                    <span className="font-medium text-slate-900">{entity.contractDetails.validFrom} 至 {entity.contractDetails.validTo}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100">暂无合同信息</p>
              )}
            </div>

            {entity.type === 'BRAND' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  授权与资质
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-4 border border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-slate-500 block mb-2">代理授权</span>
                      {entity.agencyAuth && entity.agencyAuth.length > 0 ? (
                        <ul className="space-y-1">
                          {entity.agencyAuth.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <a href={f.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate max-w-[150px]" title={f.name}>
                                {f.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-slate-400">未上传</span>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 block mb-2">Logo授权</span>
                      {entity.logoAuth && entity.logoAuth.length > 0 ? (
                        <ul className="space-y-1">
                          {entity.logoAuth.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <a href={f.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate max-w-[150px]" title={f.name}>
                                {f.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-slate-400">未上传</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-200">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">相关资质</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-slate-500 block mb-1">商标注册证</span>
                        {entity.qualifications?.trademark && entity.qualifications.trademark.length > 0 ? (
                          <ul className="space-y-1">
                            {entity.qualifications.trademark.map((f, i) => (
                              <li key={i} className="flex items-center gap-1 text-xs">
                                <FileText className="w-3 h-3 text-slate-400" />
                                <a href={f.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate max-w-[120px]" title={f.name}>
                                  {f.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-slate-400">未上传</span>
                        )}
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block mb-1">ICP备案</span>
                        {entity.qualifications?.icp && entity.qualifications.icp.length > 0 ? (
                          <ul className="space-y-1">
                            {entity.qualifications.icp.map((f, i) => (
                              <li key={i} className="flex items-center gap-1 text-xs">
                                <FileText className="w-3 h-3 text-slate-400" />
                                <a href={f.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate max-w-[120px]" title={f.name}>
                                  {f.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-slate-400">未上传</span>
                        )}
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block mb-1">行业证书</span>
                        {entity.qualifications?.industryCert && entity.qualifications.industryCert.length > 0 ? (
                          <ul className="space-y-1">
                            {entity.qualifications.industryCert.map((f, i) => (
                              <li key={i} className="flex items-center gap-1 text-xs">
                                <FileText className="w-3 h-3 text-slate-400" />
                                <a href={f.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate max-w-[120px]" title={f.name}>
                                  {f.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-slate-400">未上传</span>
                        )}
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block mb-1">其他资质</span>
                        {entity.qualifications?.other && entity.qualifications.other.length > 0 ? (
                          <ul className="space-y-1">
                            {entity.qualifications.other.map((f, i) => (
                              <li key={i} className="flex items-center gap-1 text-xs">
                                <FileText className="w-3 h-3 text-slate-400" />
                                <a href={f.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate max-w-[120px]" title={f.name}>
                                  {f.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-slate-400">未上传</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                关联项目 ({relatedProjects.length})
              </h3>
              <div className="space-y-3">
                {relatedProjects.map(project => {
                  const isExpanded = expandedProject === project.id;
                  const projectBrands = companyEntities.filter(e => project.brandIds?.includes(e.id));
                  const projectClients = companyEntities.filter(e => e.type === 'CLIENT' && project.clientId === e.id);
                  const contract = project.onboarding?.signing?.contractDetails;

                  return (
                    <div key={project.id} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                            {project.name}
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">负责人: {project.manager || '未分配'}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/brands/${project.id}`); }} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors">
                          查看项目
                        </button>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-200 bg-white space-y-4">
                          {entity.type === 'CLIENT' ? (
                            <div>
                              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">关联品牌</h4>
                              {projectBrands.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {projectBrands.map(b => (
                                    <div key={b.id} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-md px-2 py-1 cursor-pointer hover:bg-slate-100" onClick={() => navigate(`/company/${b.id}`)}>
                                      <img src={b.logo} alt="" className="w-5 h-5 rounded-full object-cover" />
                                      <span className="text-xs font-medium text-slate-700">{b.name}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400">暂无关联品牌</p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">关联客户</h4>
                              {projectClients.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {projectClients.map(c => (
                                    <div key={c.id} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-md px-2 py-1 cursor-pointer hover:bg-slate-100" onClick={() => navigate(`/company/${c.id}`)}>
                                      <img src={c.logo} alt="" className="w-5 h-5 rounded-full object-cover" />
                                      <span className="text-xs font-medium text-slate-700">{c.name}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400">暂无关联客户</p>
                              )}
                            </div>
                          )}

                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">合同信息</h4>
                            {contract ? (
                              <div className="bg-slate-50 rounded-md p-3 text-xs space-y-2 border border-slate-100">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">状态:</span>
                                  <span className="font-medium text-slate-900">{contract.status === 'SIGNED' ? '已签署' : contract.status === 'DRAFT' ? '草稿' : '已过期'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">甲方:</span>
                                  <span className="font-medium text-slate-900">{contract.partyA}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">乙方:</span>
                                  <span className="font-medium text-slate-900">{contract.partyB}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">有效期:</span>
                                  <span className="font-medium text-slate-900">{contract.validFrom} 至 {contract.validTo}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">暂无合同信息</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {relatedProjects.length === 0 && (
                  <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100">暂无关联项目</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              {entity.type === 'CLIENT' ? '客户资料库' : '品牌资料库'} <span className="text-sm font-normal text-slate-500">(按时间排序)</span>
            </h3>
            <div className="space-y-3">
              {allResources.length > 0 ? (
                allResources.map(resource => (
                  <div key={resource.id} className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                        {resource.type}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 line-clamp-1">{resource.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{resource.uploadDate}</span>
                          <span className="text-xs text-slate-400">|</span>
                          <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{resource.source}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors shrink-0 ml-2">
                      下载
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100">暂无资料</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              运营报告汇总
            </h3>
            <div className="flex items-center bg-slate-200 p-1 rounded-lg">
              <button 
                onClick={() => setSummaryPeriod('WEEK')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${summaryPeriod === 'WEEK' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                本周
              </button>
              <button 
                onClick={() => setSummaryPeriod('MONTH')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${summaryPeriod === 'MONTH' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                本月
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div 
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
              onClick={() => setSelectedReportType('TOTAL')}
            >
              <p className="text-sm text-slate-500 mb-1">总报告数</p>
              <p className="text-2xl font-bold text-slate-900">{reportSummary.total}</p>
              <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">查看提交详情 &rarr;</p>
            </div>
            <div 
              className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
              onClick={() => setSelectedReportType('DAILY')}
            >
              <p className="text-sm text-blue-600 mb-1">日报</p>
              <p className="text-2xl font-bold text-blue-900">{reportSummary.daily}</p>
              <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">查看提交详情 &rarr;</p>
            </div>
            <div 
              className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
              onClick={() => setSelectedReportType('WEEKLY')}
            >
              <p className="text-sm text-indigo-600 mb-1">周报</p>
              <p className="text-2xl font-bold text-indigo-900">{reportSummary.weekly}</p>
              <p className="text-xs text-indigo-700 mt-2 flex items-center gap-1">查看提交详情 &rarr;</p>
            </div>
            <div 
              className="bg-purple-50 p-4 rounded-xl border border-purple-100 shadow-sm cursor-pointer hover:border-purple-300 transition-colors"
              onClick={() => setSelectedReportType('MONTHLY')}
            >
              <p className="text-sm text-purple-600 mb-1">月报</p>
              <p className="text-2xl font-bold text-purple-900">{reportSummary.monthly}</p>
              <p className="text-xs text-purple-700 mt-2 flex items-center gap-1">查看提交详情 &rarr;</p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-md font-medium text-slate-900 mb-4">报告明细 (按时间排序)</h4>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <ul className="divide-y divide-slate-100">
                {sortedReports.map(report => (
                  <li key={`${report.projectId}-${report.id}`} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-slate-700 w-24 shrink-0">{report.date}</div>
                      <div className="flex items-center gap-2 w-16 shrink-0">
                        {report.type === 'DAILY' && <span className="w-full text-center text-xs font-medium text-blue-600 bg-blue-50 py-1 rounded">日报</span>}
                        {report.type === 'WEEKLY' && <span className="w-full text-center text-xs font-medium text-indigo-600 bg-indigo-50 py-1 rounded">周报</span>}
                        {report.type === 'MONTHLY' && <span className="w-full text-center text-xs font-medium text-purple-600 bg-purple-50 py-1 rounded">月报</span>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{report.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">所属项目: {report.projectName} | 提交人: {report.operator || '未知'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:justify-end">
                      {report.status === 'SUBMITTED' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 已提交
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5" /> 待提交
                        </span>
                      )}
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors">
                        查看
                      </button>
                    </div>
                  </li>
                ))}
                {sortedReports.length === 0 && (
                  <li className="p-8 text-center text-sm text-slate-500">暂无报告记录</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {entity.type === 'BRAND' && <EntityServiceConfig entityId={entity.id} />}

      {selectedReportType && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">
                {summaryPeriod === 'WEEK' ? '本周' : '本月'}
                {selectedReportType === 'TOTAL' ? '总报告' : selectedReportType === 'DAILY' ? '日报' : selectedReportType === 'WEEKLY' ? '周报' : '月报'}提交详情
              </h3>
              <button onClick={() => setSelectedReportType(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {Object.keys(getOperatorBreakdown(selectedReportType)).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(getOperatorBreakdown(selectedReportType)).sort((a, b) => b[1] - a[1]).map(([operator, count]) => (
                    <div key={operator} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                          {operator.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{operator}</span>
                      </div>
                      <span className="text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-sm font-medium">
                        {count} 份
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-4">暂无提交记录</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setSelectedReportType(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
