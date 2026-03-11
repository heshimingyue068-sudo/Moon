import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Brand, ServiceTemplate } from './types';

interface AppState {
  brands: Brand[];
  updateBrand: (id: string, brand: Partial<Brand>) => void;
  serviceTemplates: ServiceTemplate[];
  addServiceTemplate: (template: ServiceTemplate) => void;
}

const initialServiceTemplates: ServiceTemplate[] = [
  {
    id: 't1',
    name: '周报发送',
    description: '每周给品牌方和渠道商发送运营周报',
    frequency: 'WEEKLY',
    targetCount: 1,
    targetRole: '品牌方 & 渠道商',
  },
  {
    id: 't2',
    name: '月报发送',
    description: '每月给品牌方和渠道商发送运营月报',
    frequency: 'MONTHLY',
    targetCount: 1,
    targetRole: '品牌方 & 渠道商',
  },
  {
    id: 't3',
    name: '商务服务沟通',
    description: '商务人员联系客户进行服务沟通',
    frequency: 'WEEKLY',
    targetCount: 3,
    targetRole: '客户',
  },
];

const initialBrands: Brand[] = [
  {
    id: '1',
    name: '星巴克 (Starbucks)',
    logo: 'https://picsum.photos/seed/starbucks/100/100',
    category: '餐饮美食',
    currentPhase: 'OPERATING',
    healthStatus: 'HEALTHY',
    manager: '王经理',
    todos: [
      { id: 'todo1', text: '提交2月运营月报', completed: false, dueDate: '2026-03-12' },
      { id: 'todo2', text: '跟进五一特惠大促方案审批', completed: false, dueDate: '2026-03-15' }
    ],
    assets: [
      { id: 'a1', name: '星巴克品牌VI手册.pdf', type: 'PDF', url: '#', uploadDate: '2026-01-10' },
      { id: 'a2', name: '门店授权书_2026.jpg', type: 'IMAGE', url: '#', uploadDate: '2026-01-12' }
    ],
    onboarding: {
      signing: {
        completed: true,
        taxRate: '6%',
        paymentMode: '月结',
        costPriceDesc: '基础服务费 5W/月',
        settlementMode: 'CPS 5%',
        annualProcurement: '预估 1000W',
        contractDetails: {
          status: 'SIGNED',
          partyA: '星巴克企业管理（中国）有限公司',
          partyB: '杭州某某科技有限公司',
          validFrom: '2026-01-01',
          validTo: '2026-12-31',
          files: [{ name: '星巴克2026年度合作协议.pdf', url: '#' }]
        }
      },
      brandApi: { completed: true, progress: 100, notes: '已完成订单和核销接口对接' },
      channelListing: { 
        completed: true, 
        channels: ['抖音', '美团'], 
        notes: '资质已审核通过',
        listings: [
          {
            clientId: 'c1',
            clientName: '中国移动',
            rules: ['需提供商品原价证明', '折扣率不得低于9折'],
            requiredMaterials: ['商品主图(800x800)', '详情页长图', '品牌授权书'],
            templates: [{ name: '中国移动商品上架申请表.xlsx', url: '#' }],
            status: 'COMPLETED'
          },
          {
            clientId: 'c5',
            clientName: '阿里巴巴',
            rules: ['需参与88VIP专享折扣', '支持七天无理由退款'],
            requiredMaterials: ['商品白底图', '88VIP权益说明书'],
            templates: [{ name: '阿里生态入驻承诺书.pdf', url: '#' }],
            status: 'COMPLETED'
          }
        ]
      },
      channelApi: { completed: true, progress: 100, notes: '双端API已打通' },
    },
    operations: {
      coreMetrics: {
        salesAmount: 1500000,
        orderCount: 45000,
        complaintRate: 0.15,
        usageRate: 85,
        targetReachRate: 110,
      },
      services: [
        {
          id: 'bs1',
          templateId: 't1',
          name: '周报发送',
          frequency: 'WEEKLY',
          targetCount: 1,
          currentCount: 1,
          lastRecordDate: '2026-03-08',
          records: [{ id: 'r1', date: '2026-03-08', note: '已发送第一周周报' }],
        },
        {
          id: 'bs2',
          templateId: 't3',
          name: '商务服务沟通',
          frequency: 'WEEKLY',
          targetCount: 3,
          currentCount: 2,
          lastRecordDate: '2026-03-09',
          records: [
            { id: 'r2', date: '2026-03-07', note: '电话沟通活动方案' },
            { id: 'r3', date: '2026-03-09', note: '同步客诉处理进度' },
          ],
        },
      ],
      reports: [
        { id: 'r1', type: 'DAILY', title: '3月9日运营日报', date: '2026-03-09', status: 'SUBMITTED' },
        { id: 'r2', type: 'WEEKLY', title: '3月第一周周报', date: '2026-03-08', status: 'SUBMITTED' },
        { id: 'r3', type: 'MONTHLY', title: '2月运营月报', date: '2026-03-01', status: 'PENDING' },
      ],
      activities: [
        { id: 'a1', name: '春季新品首发', status: 'ACTIVE' },
        { id: 'a2', name: '五一特惠大促', status: 'PLANNING' },
      ],
      feedbacks: [
        { id: 'f1', date: '2026-03-05', content: '客户反馈美团侧核销有时延，已安排技术排查。' },
      ],
    },
    finance: {
      periods: [
        {
          id: 'p1',
          periodName: '2026年2月',
          reconciliation: { status: 'COMPLETED', clientAmount: 500000, brandAmount: 475000 },
          settlement: { status: 'COMPLETED', amount: 25000 },
          invoicing: { status: 'COMPLETED', amount: 25000, invoiceNo: 'INV-202602-001' },
          collection: { status: 'PENDING', amount: 25000 },
        }
      ],
    },
    reviews: [
      { id: 'rev1', date: '2026-02-28', title: '春节营销复盘', summary: '抖音本地生活转化率超预期，可复制到其他餐饮品牌。', isReplicable: true },
    ],
    cases: [
      { id: 'c1', type: 'SUCCESS', title: '春节抖音本地生活爆单', description: '通过达人矩阵配合春节节点，实现单日GMV突破50万。', date: '2026-02-20' }
    ],
    operationHistory: [
      { id: 'oh1', date: '2026-03-08 10:00', user: '1310479606@qq.com', action: '添加服务事项', details: '添加了【周报发送】服务' },
      { id: 'oh2', date: '2026-03-09 14:30', user: '1310479606@qq.com', action: '更新财务状态', details: '将2026年2月结算状态标记为已完成' }
    ],
  },
  {
    id: '2',
    name: '瑞幸咖啡 (Luckin)',
    logo: 'https://picsum.photos/seed/luckin/100/100',
    category: '餐饮美食',
    currentPhase: 'ONBOARDING',
    healthStatus: 'AT_RISK',
    manager: '李四',
    todos: [
      { id: 'todo3', text: '催促客户提供ICP备案截图', completed: false, dueDate: '2026-03-11' },
      { id: 'todo4', text: '排查商品同步接口鉴权问题', completed: false, dueDate: '2026-03-10' }
    ],
    assets: [
      { id: 'a3', name: '瑞幸产品清单.xlsx', type: 'EXCEL', url: '#', uploadDate: '2026-02-15' }
    ],
    onboarding: {
      signing: {
        completed: true,
        taxRate: '6%',
        paymentMode: '预付+尾款',
        costPriceDesc: '基础服务费 3W/月',
        settlementMode: 'CPS 3%',
        annualProcurement: '预估 800W',
        contractDetails: {
          status: 'SIGNED',
          partyA: '瑞幸咖啡（中国）有限公司',
          partyB: '杭州某某科技有限公司',
          validFrom: '2026-02-01',
          validTo: '2027-01-31',
          files: [{ name: '瑞幸2026年度合作协议.pdf', url: '#' }]
        }
      },
      brandApi: { completed: false, progress: 60, notes: '商品同步接口联调中，遇到鉴权问题' },
      channelListing: { 
        completed: false, 
        channels: ['快手'], 
        notes: '等待品牌方提供ICP备案截图',
        listings: [
          {
            clientId: 'c3',
            clientName: '农商行',
            rules: ['需提供食品经营许可证', '商品需支持全国可用（除港澳台）'],
            requiredMaterials: ['食品经营许可证扫描件', '门店列表清单'],
            templates: [{ name: '农商行商户入驻申请表.docx', url: '#' }],
            status: 'IN_PROGRESS'
          }
        ]
      },
      channelApi: { completed: false, progress: 20, notes: '快手侧资质审核中' },
    },
    operations: {
      coreMetrics: { salesAmount: 0, orderCount: 0, complaintRate: 0, usageRate: 0, targetReachRate: 0 },
      services: [],
      reports: [],
      activities: [],
      feedbacks: [],
    },
    finance: {
      periods: [],
    },
    reviews: [],
    cases: [],
    operationHistory: [],
  },
  {
    id: '3',
    name: '喜茶 (HEYTEA)',
    logo: 'https://picsum.photos/seed/heytea/100/100',
    category: '餐饮美食',
    currentPhase: 'REVIEW',
    healthStatus: 'HEALTHY',
    manager: '张三',
    onboarding: {
      signing: { completed: true, taxRate: '6%', paymentMode: '月结', costPriceDesc: '-', settlementMode: 'CPS 4%', annualProcurement: '500W' },
      brandApi: { completed: true, progress: 100, notes: '' },
      channelListing: { completed: true, channels: ['小红书'], notes: '' },
      channelApi: { completed: true, progress: 100, notes: '' },
    },
    operations: {
      coreMetrics: { salesAmount: 800000, orderCount: 20000, complaintRate: 0.05, usageRate: 92, targetReachRate: 105 },
      services: [],
      reports: [
        { id: 'r1', type: 'MONTHLY', title: '2月运营月报', date: '2026-03-02', status: 'SUBMITTED' },
      ],
      activities: [],
      feedbacks: [],
    },
    finance: {
      periods: [
        {
          id: 'p1',
          periodName: '2026年2月',
          reconciliation: { status: 'COMPLETED', clientAmount: 800000, brandAmount: 768000 },
          settlement: { status: 'COMPLETED', amount: 32000 },
          invoicing: { status: 'PENDING', amount: 32000 },
          collection: { status: 'PENDING', amount: 32000 },
        }
      ],
    },
    reviews: [
      { id: 'rev1', date: '2026-03-05', title: '小红书种草复盘', summary: '达人矩阵投放ROI达1:3，建议加大腰部达人比例。', isReplicable: true },
    ],
    cases: [
      { id: 'c2', type: 'FAILURE', title: '新品首发流量不足', description: '由于预热期过短，导致首发当日自然流量未达预期。', date: '2026-03-01' }
    ],
    operationHistory: [],
  }
];

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>(initialServiceTemplates);

  const updateBrand = (id: string, updatedBrand: Partial<Brand>) => {
    setBrands((prev) =>
      prev.map((brand) => (brand.id === id ? { ...brand, ...updatedBrand } : brand))
    );
  };

  const addServiceTemplate = (template: ServiceTemplate) => {
    setServiceTemplates((prev) => [...prev, template]);
  };

  return (
    <AppContext.Provider value={{ brands, updateBrand, serviceTemplates, addServiceTemplate }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
