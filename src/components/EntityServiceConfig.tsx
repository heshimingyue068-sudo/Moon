import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { Settings, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { ServiceItem, ServiceType, AVAILABLE_REPORT_FIELDS } from '../types';

interface EntityServiceConfigProps {
  entityId: string;
}

export const EntityServiceConfig: React.FC<EntityServiceConfigProps> = ({ entityId }) => {
  const { serviceItems, addServiceItem, updateServiceItem, deleteServiceItem, reportTemplates, addReportTemplate, updateReportTemplate } = useAppContext();
  
  const entityServiceItems = serviceItems.filter(item => item.entityId === entityId);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<ServiceType>('general');

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: ServiceItem = {
      id: `si_${Date.now()}`,
      entityId,
      name: newItemName,
      type: newItemType
    };
    addServiceItem(newItem);
    
    if (newItemType === 'weekly_report' || newItemType === 'monthly_report') {
      addReportTemplate({
        id: `rt_${Date.now()}`,
        serviceItemId: newItem.id,
        selectedFieldIds: []
      });
    }
    
    setNewItemName('');
    setIsAdding(false);
  };

  const handleEditTemplate = (serviceItemId: string) => {
    const template = reportTemplates.find(t => t.serviceItemId === serviceItemId);
    if (template) {
      setEditingTemplateId(template.id);
      setSelectedFields(template.selectedFieldIds);
    }
  };

  const handleSaveTemplate = () => {
    if (editingTemplateId) {
      updateReportTemplate(editingTemplateId, { selectedFieldIds: selectedFields });
      setEditingTemplateId(null);
    }
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          服务事项配置
        </h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" /> 新增服务事项
        </button>
      </div>

      <div className="p-6">
        {isAdding && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">事项名称</label>
              <input 
                type="text" 
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="例如：小红书日常代运营"
              />
            </div>
            <div className="w-48">
              <label className="block text-xs font-medium text-slate-700 mb-1">事项类型</label>
              <select 
                value={newItemType}
                onChange={e => setNewItemType(e.target.value as ServiceType)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="general">常规服务</option>
                <option value="weekly_report">周报服务</option>
                <option value="monthly_report">月报服务</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleAddItem} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                保存
              </button>
              <button onClick={() => setIsAdding(false)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50">
                取消
              </button>
            </div>
          </div>
        )}

        {entityServiceItems.length > 0 ? (
          <div className="space-y-4">
            {entityServiceItems.map(item => {
              const template = reportTemplates.find(t => t.serviceItemId === item.id);
              const isEditingThis = template && editingTemplateId === template.id;

              return (
                <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-900">{item.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        item.type === 'weekly_report' ? 'bg-indigo-100 text-indigo-700' :
                        item.type === 'monthly_report' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {item.type === 'weekly_report' ? '周报' : item.type === 'monthly_report' ? '月报' : '常规'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(item.type === 'weekly_report' || item.type === 'monthly_report') && !isEditingThis && (
                        <button 
                          onClick={() => handleEditTemplate(item.id)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> 配置报告模板
                        </button>
                      )}
                      <button 
                        onClick={() => deleteServiceItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isEditingThis && (
                    <div className="p-4 bg-white border-t border-slate-200">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-900">选择报告包含的字段</h4>
                        <div className="flex items-center gap-2">
                          <button onClick={handleSaveTemplate} className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">
                            <Check className="w-3.5 h-3.5" /> 保存配置
                          </button>
                          <button onClick={() => setEditingTemplateId(null)} className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-200">
                            <X className="w-3.5 h-3.5" /> 取消
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {AVAILABLE_REPORT_FIELDS.map(field => (
                          <label key={field.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={selectedFields.includes(field.id)}
                              onChange={() => toggleField(field.id)}
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            <span className="text-sm text-slate-700 select-none">{field.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!isEditingThis && template && template.selectedFieldIds.length > 0 && (
                    <div className="p-4 bg-white border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-2">已配置的报告字段：</p>
                      <div className="flex flex-wrap gap-2">
                        {template.selectedFieldIds.map(id => {
                          const field = AVAILABLE_REPORT_FIELDS.find(f => f.id === id);
                          return field ? (
                            <span key={id} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
                              {field.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
            暂无服务事项，请点击右上角新增
          </div>
        )}
      </div>
    </div>
  );
};
