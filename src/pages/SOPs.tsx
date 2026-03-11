import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { Plus, Settings, Calendar, Users, FileText } from 'lucide-react';
import { ServiceFrequency, ServiceTemplate } from '../types';

const sops = [
  {
    step: '1',
    title: '客户准入',
    items: [
      '客户 / 品牌资质审核、背景调查',
      '风险评估、负责人确认',
      '审批通过后方可推进'
    ]
  },
  {
    step: '2',
    title: '需求与方案',
    items: [
      '客户需求收集、整理、确认',
      '输出标准化方案、报价、服务范围',
      '内部成本 / 收益 / 风险评审'
    ]
  },
  {
    step: '3',
    title: '合同与定价',
    items: [
      '统一合同模板',
      '明确服务内容、交付标准、结算周期',
      '法务 + 财务 + 管理层审批'
    ]
  },
  {
    step: '4',
    title: '启动与交接',
    items: [
      '内部立项，建立项目小组',
      '资料、账号、权限、历史数据交接',
      '输出《服务执行计划》'
    ]
  },
  {
    step: '5',
    title: '过程管控（核心）',
    items: [
      '统一服务动作留痕：对接、执行、响应、同步、预警',
      '每周服务记录、每月数据复盘',
      '风险实时上报、升级机制',
      '品牌服务数据全口径统计'
    ]
  },
  {
    step: '6',
    title: '交付 / 验收',
    items: [
      '按合同完成交付 / 服务上线',
      '客户确认、验收签字 / 盖章',
      '交付物归档'
    ]
  },
  {
    step: '7',
    title: '结算 / 对账',
    items: [
      '销售额、增量、佣金对账',
      '统一对账、开票、回款、归档'
    ]
  },
  {
    step: '8',
    title: '复盘 / 续作',
    items: [
      '服务过程复盘',
      '品牌数据复盘',
      '续约、扩品、深度合作'
    ]
  }
];

const frequencyLabels: Record<ServiceFrequency, string> = {
  DAILY: '每天',
  WEEKLY: '每周',
  MONTHLY: '每月',
  CUSTOM: '自定义'
};

export const SOPs: React.FC = () => {
  const { serviceTemplates, addServiceTemplate } = useAppContext();
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState<Partial<ServiceTemplate>>({
    name: '',
    description: '',
    frequency: 'WEEKLY',
    targetCount: 1,
    targetRole: ''
  });

  const handleAddService = () => {
    if (newService.name && newService.targetRole) {
      addServiceTemplate({
        id: `t${Date.now()}`,
        name: newService.name,
        description: newService.description || '',
        frequency: newService.frequency as ServiceFrequency,
        targetCount: newService.targetCount || 1,
        targetRole: newService.targetRole
      });
      setIsAddingService(false);
      setNewService({ name: '', description: '', frequency: 'WEEKLY', targetCount: 1, targetRole: '' });
    }
  };

  return (
    <div className="space-y-10">
      {/* SOP Framework Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">统一流程框架 SOP</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {sops.map((sop) => (
            <div key={sop.step} className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -top-4 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-bold shadow-sm">
                {sop.step}
              </div>
              <h3 className="mt-2 text-lg font-medium text-slate-900">{sop.title}</h3>
              <ul className="mt-4 space-y-2">
                {sop.items.map((item, index) => (
                  <li key={index} className="flex items-start text-sm text-slate-600">
                    <span className="mr-2 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Service Configuration Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 flex items-center">
              <Settings className="mr-2 h-5 w-5 text-indigo-600" />
              服务事项配置库
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              定义标准化的服务动作（如周报、商务沟通等），品牌可根据需要配置并进行过程管控。
            </p>
          </div>
          <button
            onClick={() => setIsAddingService(true)}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            新增服务项
          </button>
        </div>

        {isAddingService && (
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">创建新服务项</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">服务名称</label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="例如：周报发送"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">服务对象 (角色)</label>
                <input
                  type="text"
                  value={newService.targetRole}
                  onChange={(e) => setNewService({ ...newService, targetRole: e.target.value })}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="例如：品牌方、渠道商"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">执行频率</label>
                <select
                  value={newService.frequency}
                  onChange={(e) => setNewService({ ...newService, frequency: e.target.value as ServiceFrequency })}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="DAILY">每天</option>
                  <option value="WEEKLY">每周</option>
                  <option value="MONTHLY">每月</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">目标次数 (每周期)</label>
                <input
                  type="number"
                  min="1"
                  value={newService.targetCount}
                  onChange={(e) => setNewService({ ...newService, targetCount: parseInt(e.target.value) || 1 })}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">服务说明</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="描述该服务的具体内容和要求..."
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingService(false)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleAddService}
                disabled={!newService.name || !newService.targetRole}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                保存配置
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceTemplates.map((template) => (
            <div key={template.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-slate-900 flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-indigo-500" />
                  {template.name}
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-4 h-10 line-clamp-2">{template.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-slate-500">
                  <Calendar className="mr-2 h-4 w-4" />
                  规则：{frequencyLabels[template.frequency]} {template.targetCount} 次
                </div>
                <div className="flex items-center text-slate-500">
                  <Users className="mr-2 h-4 w-4" />
                  对象：{template.targetRole}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
