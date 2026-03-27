import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { ArrowLeft, Building2, Tag, Phone, User, FileText, Calendar } from 'lucide-react';

export const CompanyInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companyEntities, brands: projects } = useAppContext();

  const entity = companyEntities.find(e => e.id === id);

  if (!entity) {
    return <div className="p-8 text-center text-slate-500">未找到该客户/品牌</div>;
  }

  const relatedProjects = projects.filter(p => p.clientId === entity.id || p.brandIds?.includes(entity.id));

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
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                品牌基本信息
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

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                关联项目 ({relatedProjects.length})
              </h3>
              <div className="space-y-3">
                {relatedProjects.map(project => (
                  <div key={project.id} className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{project.name}</p>
                      <p className="text-xs text-slate-500 mt-1">负责人: {project.manager}</p>
                    </div>
                    <button onClick={() => navigate(`/brands/${project.id}`)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      查看项目
                    </button>
                  </div>
                ))}
                {relatedProjects.length === 0 && (
                  <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100">暂无关联项目</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              品牌资料库
            </h3>
            <div className="space-y-3">
              {entity.resources && entity.resources.length > 0 ? (
                entity.resources.map(resource => (
                  <div key={resource.id} className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {resource.type}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{resource.name}</p>
                        <p className="text-xs text-slate-500 mt-1">上传时间: {resource.uploadTime}</p>
                      </div>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1.5 bg-indigo-50 rounded-md transition-colors">
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
      </div>
    </div>
  );
};
