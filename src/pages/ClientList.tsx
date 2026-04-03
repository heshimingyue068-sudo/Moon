import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { Eye, FileText, Building2, Plus, X } from 'lucide-react';
import { CompanyEntity } from '../types';

export const ClientList: React.FC = () => {
  const { companyEntities, brands: projects, addCompanyEntity } = useAppContext();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClient, setNewClient] = useState<Partial<CompanyEntity>>({
    name: '',
    contactPerson: '',
    contactPhone: '',
    manager: '',
  });

  const clients = companyEntities.filter(e => e.type === 'CLIENT');

  const getContractStatusLabel = (status?: string) => {
    switch (status) {
      case 'SIGNED': return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">已签署</span>;
      case 'DRAFT': return <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">草稿</span>;
      case 'EXPIRED': return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">已过期</span>;
      default: return <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">未配置</span>;
    }
  };

  const getUsageCount = (entityId: string) => {
    return projects.filter(p => p.clientId === entityId).length;
  };

  const handleAddClient = () => {
    if (!newClient.name || !newClient.contactPerson || !newClient.contactPhone) return;
    
    const entityToAdd: CompanyEntity = {
      id: `ce${Date.now()}`,
      name: newClient.name,
      type: 'CLIENT',
      logo: `https://picsum.photos/seed/${newClient.name}/100/100`,
      contactPerson: newClient.contactPerson,
      contactPhone: newClient.contactPhone,
      manager: newClient.manager || '未分配',
      resources: [],
      relatedEntityIds: [],
    };

    addCompanyEntity(entityToAdd);
    setIsAddModalOpen(false);
    setNewClient({ 
      name: '', contactPerson: '', contactPhone: '', manager: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">客户管理</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          新增客户
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
              {clients.map((entity) => {
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
              {clients.length === 0 && (
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

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">新增客户</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">客户名称</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：中国移动"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">联系人</label>
                <input
                  type="text"
                  value={newClient.contactPerson}
                  onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：张三"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">联系电话</label>
                <input
                  type="text"
                  value={newClient.contactPhone}
                  onChange={(e) => setNewClient({ ...newClient, contactPhone: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：13800000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">负责人 (内部)</label>
                <input
                  type="text"
                  value={newClient.manager}
                  onChange={(e) => setNewClient({ ...newClient, manager: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：李四"
                />
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
                onClick={handleAddClient}
                disabled={!newClient.name || !newClient.contactPerson || !newClient.contactPhone}
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
