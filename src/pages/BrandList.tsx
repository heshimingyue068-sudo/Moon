import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { Eye, FileText, Building2, Tag } from 'lucide-react';

export const BrandList: React.FC = () => {
  const { companyEntities, brands: projects } = useAppContext();
  const navigate = useNavigate();

  const getContractStatusLabel = (status?: string) => {
    switch (status) {
      case 'SIGNED': return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">已签署</span>;
      case 'DRAFT': return <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">草稿</span>;
      case 'EXPIRED': return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">已过期</span>;
      default: return <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">未配置</span>;
    }
  };

  const getTypeLabel = (type: 'CLIENT' | 'BRAND') => {
    if (type === 'CLIENT') {
      return <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"><Building2 className="w-3 h-3" /> 客户</span>;
    }
    return <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20"><Tag className="w-3 h-3" /> 品牌</span>;
  };

  const getUsageCount = (entityId: string, type: 'CLIENT' | 'BRAND') => {
    return projects.filter(p => {
      if (type === 'CLIENT') return p.clientId === entityId;
      return p.brandIds?.includes(entityId);
    }).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">品牌管理</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">名称</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">类型</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">使用项目数</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">合同状态</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">合同有效期</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {companyEntities.map((entity) => {
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
                      {getTypeLabel(entity.type)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                        {getUsageCount(entity.id, entity.type)} 个项目
                      </span>
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
              {companyEntities.length === 0 && (
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
    </div>
  );
};
