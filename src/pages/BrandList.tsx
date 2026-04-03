import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { Eye, FileText, Building2, Tag, Plus, X } from 'lucide-react';
import { CompanyEntity } from '../types';

export const BrandList: React.FC = () => {
  const { companyEntities, brands: projects, addCompanyEntity } = useAppContext();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBrand, setNewBrand] = useState<Partial<CompanyEntity>>({
    name: '',
    contactPerson: '',
    contactPhone: '',
    contactPosition: '',
    category: '',
    manager: '',
    contractDetails: {
      status: 'DRAFT',
      partyA: '',
      partyB: '',
      validFrom: '',
      validTo: '',
      files: []
    },
    agencyAuth: [],
    logoAuth: [],
    qualifications: {
      trademark: [],
      icp: [],
      industryCert: [],
      other: []
    }
  });

  const brands = companyEntities.filter(e => e.type === 'BRAND');

  const getContractStatusLabel = (status?: string) => {
    switch (status) {
      case 'SIGNED': return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">已签署</span>;
      case 'DRAFT': return <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">草稿</span>;
      case 'EXPIRED': return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">已过期</span>;
      default: return <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">未配置</span>;
    }
  };

  const getUsageCount = (entityId: string) => {
    return projects.filter(p => p.brandIds?.includes(entityId)).length;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string, subfield?: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).map(f => ({
        name: f.name,
        url: URL.createObjectURL(f)
      }));
      
      if (subfield) {
        setNewBrand(prev => ({
          ...prev,
          qualifications: {
            ...prev.qualifications,
            [subfield]: [...(prev.qualifications?.[subfield as keyof typeof prev.qualifications] as any || []), ...files]
          }
        }));
      } else {
        setNewBrand(prev => ({
          ...prev,
          [field]: [...(prev[field as keyof typeof prev] as any || []), ...files]
        }));
      }
    }
  };

  const handleRemoveFile = (field: string, index: number, subfield?: string) => {
    if (subfield) {
      setNewBrand(prev => {
        const currentFiles = prev.qualifications?.[subfield as keyof typeof prev.qualifications] as any || [];
        return {
          ...prev,
          qualifications: {
            ...prev.qualifications,
            [subfield]: currentFiles.filter((_: any, i: number) => i !== index)
          }
        };
      });
    } else {
      setNewBrand(prev => {
        const currentFiles = prev[field as keyof typeof prev] as any || [];
        return {
          ...prev,
          [field]: currentFiles.filter((_: any, i: number) => i !== index)
        };
      });
    }
  };

  const handleAddBrand = () => {
    if (!newBrand.name || !newBrand.contactPerson || !newBrand.contactPhone) return;
    
    const entityToAdd: CompanyEntity = {
      id: `ce${Date.now()}`,
      name: newBrand.name,
      type: 'BRAND',
      logo: `https://picsum.photos/seed/${newBrand.name}/100/100`,
      contactPerson: newBrand.contactPerson,
      contactPhone: newBrand.contactPhone,
      contactPosition: newBrand.contactPosition,
      category: newBrand.category,
      manager: newBrand.manager || '未分配',
      contractDetails: newBrand.contractDetails,
      agencyAuth: newBrand.agencyAuth,
      logoAuth: newBrand.logoAuth,
      qualifications: newBrand.qualifications,
      resources: [],
      relatedEntityIds: [],
    };

    addCompanyEntity(entityToAdd);
    setIsAddModalOpen(false);
    setNewBrand({ 
      name: '', contactPerson: '', contactPhone: '', contactPosition: '', category: '', manager: '',
      contractDetails: { status: 'DRAFT', partyA: '', partyB: '', validFrom: '', validTo: '', files: [] },
      agencyAuth: [], logoAuth: [], qualifications: { trademark: [], icp: [], industryCert: [], other: [] }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">品牌管理</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          新增品牌
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">名称</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">使用项目数</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">负责人</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">合同状态</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">合同有效期</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {brands.map((entity) => {
                const contract = entity.contractDetails;
                return (
                  <tr key={entity.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <img src={entity.logo} alt="" className="h-8 w-8 rounded-full bg-slate-100 object-cover" />
                        {entity.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                        {getUsageCount(entity.id)} 个项目
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {entity.manager || '未分配'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {getContractStatusLabel(contract?.status)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {contract ? (
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span>{contract.validFrom} 至 {contract.validTo}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => navigate(`/company/${entity.id}`)}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-4 w-4" />
                        查看详情
                      </button>
                    </td>
                  </tr>
                );
              })}
              {brands.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Brand Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">新增品牌</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">品牌名称</label>
                <input
                  type="text"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：星巴克"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">联系人</label>
                  <input
                    type="text"
                    value={newBrand.contactPerson}
                    onChange={(e) => setNewBrand({ ...newBrand, contactPerson: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="例如：张三"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">联系电话</label>
                  <input
                    type="text"
                    value={newBrand.contactPhone}
                    onChange={(e) => setNewBrand({ ...newBrand, contactPhone: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="例如：13800000000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">职位/部门</label>
                  <input
                    type="text"
                    value={newBrand.contactPosition}
                    onChange={(e) => setNewBrand({ ...newBrand, contactPosition: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="例如：市场总监"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">类别 (合作方式)</label>
                  <input
                    type="text"
                    value={newBrand.category}
                    onChange={(e) => setNewBrand({ ...newBrand, category: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="例如：电商、出行"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">负责人 (内部)</label>
                <input
                  type="text"
                  value={newBrand.manager}
                  onChange={(e) => setNewBrand({ ...newBrand, manager: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：李四"
                />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-medium text-slate-900 mb-3">授权与资质 (请上传图片或PDF)</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">代理授权</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'agencyAuth')}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      {newBrand.agencyAuth && newBrand.agencyAuth.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {newBrand.agencyAuth.map((f, i) => (
                            <li key={i} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-1 rounded">
                              <span className="truncate max-w-[150px]">{f.name}</span>
                              <button onClick={() => handleRemoveFile('agencyAuth', i)} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Logo授权</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'logoAuth')}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      {newBrand.logoAuth && newBrand.logoAuth.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {newBrand.logoAuth.map((f, i) => (
                            <li key={i} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-1 rounded">
                              <span className="truncate max-w-[150px]">{f.name}</span>
                              <button onClick={() => handleRemoveFile('logoAuth', i)} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">相关资质</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">商标注册证</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, 'qualifications', 'trademark')}
                          className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                        />
                        {newBrand.qualifications?.trademark && newBrand.qualifications.trademark.length > 0 && (
                          <ul className="mt-1 space-y-1">
                            {newBrand.qualifications.trademark.map((f, i) => (
                              <li key={i} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-1 rounded">
                                <span className="truncate max-w-[120px]">{f.name}</span>
                                <button onClick={() => handleRemoveFile('qualifications', i, 'trademark')} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">ICP备案</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, 'qualifications', 'icp')}
                          className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                        />
                        {newBrand.qualifications?.icp && newBrand.qualifications.icp.length > 0 && (
                          <ul className="mt-1 space-y-1">
                            {newBrand.qualifications.icp.map((f, i) => (
                              <li key={i} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-1 rounded">
                                <span className="truncate max-w-[120px]">{f.name}</span>
                                <button onClick={() => handleRemoveFile('qualifications', i, 'icp')} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">行业证书</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, 'qualifications', 'industryCert')}
                          className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                        />
                        {newBrand.qualifications?.industryCert && newBrand.qualifications.industryCert.length > 0 && (
                          <ul className="mt-1 space-y-1">
                            {newBrand.qualifications.industryCert.map((f, i) => (
                              <li key={i} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-1 rounded">
                                <span className="truncate max-w-[120px]">{f.name}</span>
                                <button onClick={() => handleRemoveFile('qualifications', i, 'industryCert')} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">其他资质</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, 'qualifications', 'other')}
                          className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                        />
                        {newBrand.qualifications?.other && newBrand.qualifications.other.length > 0 && (
                          <ul className="mt-1 space-y-1">
                            {newBrand.qualifications.other.map((f, i) => (
                              <li key={i} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-1 rounded">
                                <span className="truncate max-w-[120px]">{f.name}</span>
                                <button onClick={() => handleRemoveFile('qualifications', i, 'other')} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-medium text-slate-900 mb-3">合同信息 (选填)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">合同状态</label>
                    <select
                      value={newBrand.contractDetails?.status}
                      onChange={(e) => setNewBrand({ ...newBrand, contractDetails: { ...newBrand.contractDetails!, status: e.target.value as any } })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="DRAFT">草稿</option>
                      <option value="SIGNED">已签署</option>
                      <option value="EXPIRED">已过期</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">甲方</label>
                      <input
                        type="text"
                        value={newBrand.contractDetails?.partyA}
                        onChange={(e) => setNewBrand({ ...newBrand, contractDetails: { ...newBrand.contractDetails!, partyA: e.target.value } })}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="例如：星巴克"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">乙方</label>
                      <input
                        type="text"
                        value={newBrand.contractDetails?.partyB}
                        onChange={(e) => setNewBrand({ ...newBrand, contractDetails: { ...newBrand.contractDetails!, partyB: e.target.value } })}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="例如：我方公司"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">生效日期</label>
                      <input
                        type="date"
                        value={newBrand.contractDetails?.validFrom}
                        onChange={(e) => setNewBrand({ ...newBrand, contractDetails: { ...newBrand.contractDetails!, validFrom: e.target.value } })}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">失效日期</label>
                      <input
                        type="date"
                        value={newBrand.contractDetails?.validTo}
                        onChange={(e) => setNewBrand({ ...newBrand, contractDetails: { ...newBrand.contractDetails!, validTo: e.target.value } })}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
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
                onClick={handleAddBrand}
                disabled={!newBrand.name || !newBrand.contactPerson || !newBrand.contactPhone}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认新增
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
