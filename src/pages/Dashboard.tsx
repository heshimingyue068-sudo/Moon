import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { ShoppingCart, AlertCircle, Activity, TrendingUp, Users, Building2, Briefcase, Network, DollarSign, ArrowRight, Star, Award, Zap, CheckCircle2, Layers, X, Filter } from 'lucide-react';

// Mock data for Service Brands
const mockBrandsData = [
  { id: 'b1', name: '星巴克', logo: 'https://picsum.photos/seed/starbucks/100/100', years: 5, users: 12500000, industry: '餐饮', gmv: 45000000, orders: 1500000 },
  { id: 'b2', name: '菜鸟', logo: 'https://picsum.photos/seed/cainiao/100/100', years: 4, users: 8800000, industry: '物流', gmv: 32000000, orders: 1200000 },
  { id: 'b3', name: '携程', logo: 'https://picsum.photos/seed/ctrip/100/100', years: 4, users: 7500000, industry: '出行', gmv: 28000000, orders: 900000 },
  { id: 'b4', name: '曹操出行', logo: 'https://picsum.photos/seed/caocao/100/100', years: 3, users: 6200000, industry: '出行', gmv: 25000000, orders: 850000 },
  { id: 'b5', name: '美团医药', logo: 'https://picsum.photos/seed/meituan/100/100', years: 3, users: 5100000, industry: '医疗', gmv: 21000000, orders: 700000 },
  { id: 'b6', name: '蓝月亮', logo: 'https://picsum.photos/seed/bluemoon/100/100', years: 2, users: 4800000, industry: '快消', gmv: 19000000, orders: 650000 },
  { id: 'b7', name: '乐客健身', logo: 'https://picsum.photos/seed/leke/100/100', years: 2, users: 3500000, industry: '生活', gmv: 16000000, orders: 400000 },
  { id: 'b8', name: '喜茶', logo: 'https://picsum.photos/seed/heytea/100/100', years: 2, users: 3200000, industry: '餐饮', gmv: 14000000, orders: 380000 },
  { id: 'b9', name: '瑞幸咖啡', logo: 'https://picsum.photos/seed/luckin/100/100', years: 1, users: 2800000, industry: '餐饮', gmv: 12000000, orders: 350000 },
  { id: 'b10', name: '库迪咖啡', logo: 'https://picsum.photos/seed/cotti/100/100', years: 1, users: 1500000, industry: '餐饮', gmv: 10000000, orders: 200000 },
  { id: 'b11', name: '霸王茶姬', logo: 'https://picsum.photos/seed/chagee/100/100', years: 1, users: 1200000, industry: '餐饮', gmv: 9000000, orders: 150000 },
  { id: 'b12', name: '肯德基', logo: 'https://picsum.photos/seed/kfc/100/100', years: 3, users: 9500000, industry: '餐饮', gmv: 35000000, orders: 1100000 },
  { id: 'b13', name: '麦当劳', logo: 'https://picsum.photos/seed/mcdonalds/100/100', years: 2, users: 8200000, industry: '餐饮', gmv: 29000000, orders: 950000 },
];

// Mock data for Service Clients
const mockClientsData = [
  { id: 'c1', name: '中国移动', logo: 'https://picsum.photos/seed/chinamobile/100/100', years: 6, orders: 45000000, users: 320000000, gmv: 150000000, projects: [{name: '广东-联合会员', brands: ['星巴克', '喜茶']}, {name: '全球通', brands: ['携程', '曹操出行']}] },
  { id: 'c2', name: '中国联通', logo: 'https://picsum.photos/seed/chinaunicom/100/100', years: 5, orders: 28000000, users: 150000000, gmv: 98000000, projects: [{name: '联通在线-权益中心', brands: ['菜鸟', '美团医药']}] },
  { id: 'c3', name: '农商行', logo: 'https://picsum.photos/seed/nsh/100/100', years: 4, orders: 12000000, users: 50000000, gmv: 45000000, projects: [{name: '信用卡积分兑换', brands: ['瑞幸咖啡', '库迪咖啡']}, {name: '本地生活圈', brands: ['乐客健身']}] },
  { id: 'c4', name: '中电福富', logo: 'https://picsum.photos/seed/zdff/100/100', years: 4, orders: 9500000, users: 38000000, gmv: 32000000, projects: [{name: '员工福利平台', brands: ['蓝月亮', '霸王茶姬']}] },
  { id: 'c5', name: '阿里巴巴', logo: 'https://picsum.photos/seed/alibaba/100/100', years: 3, orders: 8800000, users: 45000000, gmv: 28000000, projects: [{name: '88VIP联合权益', brands: ['星巴克', '携程']}, {name: '淘宝省钱卡', brands: ['菜鸟']}] },
  { id: 'c6', name: '北京银行', logo: 'https://picsum.photos/seed/bob/100/100', years: 3, orders: 5600000, users: 22000000, gmv: 18000000, projects: [{name: '京彩生活APP权益', brands: ['曹操出行']}] },
  { id: 'c7', name: '招商银行', logo: 'https://picsum.photos/seed/cmb/100/100', years: 2, orders: 4200000, users: 18000000, gmv: 15000000, projects: [{name: '掌上生活饭票', brands: ['星巴克', '喜茶', '瑞幸咖啡']}] },
  { id: 'c8', name: '建设银行', logo: 'https://picsum.photos/seed/ccb/100/100', years: 1, orders: 2100000, users: 9500000, gmv: 8500000, projects: [{name: '建行生活APP', brands: ['肯德基', '麦当劳']}] },
];

const formatNumber = (num: number) => {
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return num.toString();
};

export const Dashboard: React.FC = () => {
  const { brands } = useAppContext();
  const [activeModal, setActiveModal] = useState<'orders' | 'users' | 'brands' | 'clients' | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('全部');

  const industries = ['全部', ...Array.from(new Set(mockBrandsData.map(b => b.industry)))];
  const filteredBrands = selectedIndustry === '全部' ? mockBrandsData : mockBrandsData.filter(b => b.industry === selectedIndustry);

  const totalOrders = brands.reduce((sum, b) => sum + (b.operations?.coreMetrics?.orderCount || 0), 0);
  const activeBrands = brands.filter(b => b.currentPhase === 'OPERATING').length;
  
  // New metrics
  const totalBrandsCount = mockBrandsData.length;
  const totalClientsCount = mockClientsData.length;
  const cumulativeUsersCount = 12580000; // Mock data
  
  // Calculate average complaint rate for operating brands
  const operatingBrands = brands.filter(b => b.currentPhase === 'OPERATING');
  const avgComplaintRate = operatingBrands.length > 0 
    ? (operatingBrands.reduce((sum, b) => sum + (b.operations?.coreMetrics?.complaintRate || 0), 0) / operatingBrands.length).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">管理层数据看板</h1>
        <div className="flex space-x-3">
          <select className="rounded-md border-slate-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500">
            <option>本月</option>
            <option>本季度</option>
            <option>本年度</option>
          </select>
          <button className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
            导出报告
          </button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div 
          className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-slate-200 sm:p-6 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all"
          onClick={() => setActiveModal('orders')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-blue-50 p-3">
              <ShoppingCart className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-slate-500">总订单数</dt>
              <dd className="mt-1 flex items-baseline justify-between">
                <div className="flex items-baseline text-2xl font-semibold text-slate-900">
                  {totalOrders.toLocaleString()}
                </div>
              </dd>
            </div>
          </div>
        </div>

        <div 
          className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-slate-200 sm:p-6 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all"
          onClick={() => setActiveModal('users')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-emerald-50 p-3">
              <Users className="h-6 w-6 text-emerald-600" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-slate-500">累计服务用户</dt>
              <dd className="mt-1 flex items-baseline justify-between">
                <div className="flex items-baseline text-2xl font-semibold text-slate-900">
                  {(cumulativeUsersCount / 10000).toFixed(1)}<span className="text-sm font-medium text-slate-500 ml-1">万</span>
                </div>
              </dd>
            </div>
          </div>
        </div>

        <div 
          className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-slate-200 sm:p-6 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all"
          onClick={() => setActiveModal('brands')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-amber-50 p-3">
              <Building2 className="h-6 w-6 text-amber-600" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-slate-500">服务品牌总数</dt>
              <dd className="mt-1 flex items-baseline justify-between">
                <div className="flex items-baseline text-2xl font-semibold text-slate-900">
                  {totalBrandsCount}
                </div>
              </dd>
            </div>
          </div>
        </div>

        <div 
          className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-slate-200 sm:p-6 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all"
          onClick={() => setActiveModal('clients')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-purple-50 p-3">
              <Briefcase className="h-6 w-6 text-purple-600" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-slate-500">服务客户总数</dt>
              <dd className="mt-1 flex items-baseline justify-between">
                <div className="flex items-baseline text-2xl font-semibold text-slate-900">
                  {totalClientsCount}
                </div>
              </dd>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-slate-200 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-rose-50 p-3">
              <AlertCircle className="h-6 w-6 text-rose-600" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-slate-500">平均客诉率</dt>
              <dd className="mt-1 flex items-baseline justify-between">
                <div className="flex items-baseline text-2xl font-semibold text-slate-900">
                  {avgComplaintRate}%
                </div>
              </dd>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Section 2: 服务品牌 (Served Brands) */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-amber-50/50 to-white flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 mr-3 shadow-sm">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">服务品牌</h3>
                <p className="text-sm text-slate-500 mt-0.5">核心合作品牌及服务成效展示</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select 
                className="text-sm border-slate-200 rounded-md focus:ring-amber-500 focus:border-amber-500"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
              {filteredBrands.map((brand) => (
                <div key={brand.id} className="group relative flex flex-col items-center p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-50 text-amber-600 text-xs font-bold">
                      {brand.years}年
                    </span>
                  </div>
                  <img src={brand.logo} alt={brand.name} className="w-16 h-16 rounded-full border-2 border-slate-50 shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{brand.name}</h4>
                  <span className="text-xs text-slate-500 mb-3 px-2 py-0.5 bg-slate-100 rounded-full">{brand.industry}</span>
                  <div className="w-full pt-3 border-t border-slate-100 flex flex-col space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">累计交易额</span>
                      <span className="font-bold text-amber-600">¥{formatNumber(brand.gmv)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">累计订单数</span>
                      <span className="font-bold text-slate-700">{formatNumber(brand.orders)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">累计服务用户</span>
                      <span className="font-bold text-indigo-600">{formatNumber(brand.users)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: 服务客户 (Served Clients) */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-emerald-50/50 to-white">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 mr-3 shadow-sm">
                <Award className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">服务客户</h3>
                <p className="text-sm text-slate-500 mt-0.5">战略合作企业及落地项目概览</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockClientsData.map((client) => (
                <div key={client.id} className="flex flex-col sm:flex-row bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Left: Client Info */}
                  <div className="sm:w-2/5 bg-slate-50 p-5 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-200 relative">
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                        合作 {client.years} 年
                      </span>
                    </div>
                    <img src={client.logo} alt={client.name} className="w-16 h-16 rounded-xl shadow-sm mb-3 bg-white" referrerPolicy="no-referrer" />
                    <h4 className="text-base font-bold text-slate-900">{client.name}</h4>
                  </div>
                  
                  {/* Right: Stats & Projects */}
                  <div className="sm:w-3/5 p-5 flex flex-col justify-between">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">累计交易额</p>
                        <p className="text-sm font-bold text-emerald-600">¥{formatNumber(client.gmv)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">累计订单数</p>
                        <p className="text-sm font-bold text-slate-900">{formatNumber(client.orders)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">累计服务用户</p>
                        <p className="text-sm font-bold text-indigo-600">{formatNumber(client.users)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-slate-400 mb-2">
                        <Layers className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-medium">参与服务项目及品牌</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {client.projects.map((project, idx) => (
                          <div key={idx} className="flex flex-col bg-slate-50 rounded-lg p-2 border border-slate-100">
                            <span className="text-xs font-bold text-slate-800 mb-1">{project.name}</span>
                            <div className="flex flex-wrap gap-1">
                              {project.brands.map(brand => (
                                <span key={brand} className="inline-flex items-center rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                  {brand}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {activeModal === 'orders' && '总订单数组成 (按品牌)'}
                {activeModal === 'users' && '累计服务用户组成 (按客户)'}
                {activeModal === 'brands' && '服务品牌列表'}
                {activeModal === 'clients' && '服务客户列表'}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {activeModal === 'orders' && (
                <div className="space-y-4">
                  {[...mockBrandsData].sort((a, b) => b.orders - a.orders).map(brand => (
                    <div key={brand.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center">
                        <img src={brand.logo} alt={brand.name} className="w-10 h-10 rounded-full mr-3" referrerPolicy="no-referrer" />
                        <span className="font-medium text-slate-900">{brand.name}</span>
                      </div>
                      <span className="font-bold text-blue-600">{brand.orders.toLocaleString()} 单</span>
                    </div>
                  ))}
                </div>
              )}
              {activeModal === 'users' && (
                <div className="space-y-4">
                  {[...mockClientsData].sort((a, b) => b.users - a.users).map(client => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center">
                        <img src={client.logo} alt={client.name} className="w-10 h-10 rounded-lg mr-3" referrerPolicy="no-referrer" />
                        <span className="font-medium text-slate-900">{client.name}</span>
                      </div>
                      <span className="font-bold text-emerald-600">{formatNumber(client.users)} 人</span>
                    </div>
                  ))}
                </div>
              )}
              {activeModal === 'brands' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {mockBrandsData.map(brand => (
                    <div key={brand.id} className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <img src={brand.logo} alt={brand.name} className="w-12 h-12 rounded-full mb-2" referrerPolicy="no-referrer" />
                      <span className="font-medium text-slate-900">{brand.name}</span>
                      <span className="text-xs text-slate-500">{brand.industry}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeModal === 'clients' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mockClientsData.map(client => (
                    <div key={client.id} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <img src={client.logo} alt={client.name} className="w-12 h-12 rounded-lg mr-3" referrerPolicy="no-referrer" />
                      <div>
                        <span className="font-medium text-slate-900 block">{client.name}</span>
                        <span className="text-xs text-slate-500">合作 {client.years} 年</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
