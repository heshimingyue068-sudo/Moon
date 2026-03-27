import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { User, Mail, Phone, Briefcase, Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Operator } from '../types';

export const OperatorManagement: React.FC = () => {
  const { operators, updateOperator, addOperator, deleteOperator } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [formData, setFormData] = useState<Partial<Operator>>({
    name: '',
    title: '',
    email: '',
    phone: '',
    department: '',
    status: 'ACTIVE'
  });

  const filteredOperators = operators.filter(op => 
    op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (operator?: Operator) => {
    if (operator) {
      setEditingOperator(operator);
      setFormData(operator);
    } else {
      setEditingOperator(null);
      setFormData({
        name: '',
        title: '',
        email: '',
        phone: '',
        department: '',
        status: 'ACTIVE'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.title) return;

    if (editingOperator) {
      updateOperator({ ...editingOperator, ...formData } as Operator);
    } else {
      addOperator({
        ...formData,
        id: `op${Date.now()}`,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
      } as Operator);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除该运营人员吗？')) {
      deleteOperator(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">运营人员管理</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          新增人员
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="搜索姓名、职位或部门..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredOperators.map((operator) => (
          <div key={operator.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img src={operator.avatar} alt={operator.name} className="h-12 w-12 rounded-full ring-2 ring-white" />
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">{operator.name}</h3>
                    <p className="text-xs text-slate-500">{operator.title}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  operator.status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10'
                }`}>
                  {operator.status === 'ACTIVE' ? '在职' : '离职'}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                {operator.department && (
                  <div className="flex items-center text-sm text-slate-500">
                    <Briefcase className="mr-2 h-4 w-4 text-slate-400" />
                    {operator.department}
                  </div>
                )}
                {operator.email && (
                  <div className="flex items-center text-sm text-slate-500">
                    <Mail className="mr-2 h-4 w-4 text-slate-400" />
                    {operator.email}
                  </div>
                )}
                {operator.phone && (
                  <div className="flex items-center text-sm text-slate-500">
                    <Phone className="mr-2 h-4 w-4 text-slate-400" />
                    {operator.phone}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => handleOpenModal(operator)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                  title="编辑"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(operator.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingOperator ? '编辑人员信息' : '新增运营人员'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">姓名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：张三"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">职位 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：高级运营专员"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">部门</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：电商运营部"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：zhangsan@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">电话</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如：13800138000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ACTIVE">在职</option>
                  <option value="INACTIVE">离职</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.name || !formData.title}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
