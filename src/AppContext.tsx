import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Brand, ServiceTemplate, Operator, CompanyEntity, ServiceItem, ReportTemplate } from './types';

interface AppState {
  brands: Brand[];
  updateBrand: (id: string, brand: Partial<Brand>) => void;
  addBrand: (brand: Brand) => void;
  serviceTemplates: ServiceTemplate[];
  addServiceTemplate: (template: ServiceTemplate) => void;
  operators: Operator[];
  updateOperator: (operator: Operator) => void;
  addOperator: (operator: Operator) => void;
  deleteOperator: (id: string) => void;
  companyEntities: CompanyEntity[];
  updateCompanyEntity: (id: string, entity: Partial<CompanyEntity>) => void;
  addCompanyEntity: (entity: CompanyEntity) => void;
  serviceItems: ServiceItem[];
  addServiceItem: (item: ServiceItem) => void;
  updateServiceItem: (id: string, item: Partial<ServiceItem>) => void;
  deleteServiceItem: (id: string) => void;
  reportTemplates: ReportTemplate[];
  addReportTemplate: (template: ReportTemplate) => void;
  updateReportTemplate: (id: string, template: Partial<ReportTemplate>) => void;
  deleteReportTemplate: (id: string) => void;
}

const initialOperators: Operator[] = [
  { id: 'o1', name: '张运营', avatar: 'https://picsum.photos/seed/o1/40/40', title: '高级运营专员' },
  { id: 'o2', name: '李商务', avatar: 'https://picsum.photos/seed/o2/40/40', title: '商务经理' },
  { id: 'o3', name: '王经理', avatar: 'https://picsum.photos/seed/o3/40/40', title: '运营主管' },
  { id: 'o4', name: '赵专员', avatar: 'https://picsum.photos/seed/o4/40/40', title: '运营专员' },
  { id: 'o5', name: '刘策划', avatar: 'https://picsum.photos/seed/o5/40/40', title: '活动策划' },
];

const initialCompanyEntities: CompanyEntity[] = [
  { id: 'ce1', name: '星巴克', type: 'BRAND', logo: 'https://picsum.photos/seed/starbucks/100/100', contactPerson: '李星', contactPhone: '13800000001', manager: '张运营', contractDetails: { status: 'SIGNED', partyA: '星巴克', partyB: '我方', validFrom: '2025-01-01', validTo: '2026-12-31', files: [] }, resources: [{ id: 'r1', name: '星巴克品牌VI手册.pdf', type: 'PDF', url: '#', uploadTime: '2026-01-10 10:00' }, { id: 'r2', name: '星巴克门店列表.xlsx', type: 'EXCEL', url: '#', uploadTime: '2026-01-12 14:30' }], relatedEntityIds: ['ce4', 'ce6'] },
  { id: 'ce2', name: '瑞幸咖啡', type: 'BRAND', logo: 'https://picsum.photos/seed/luckin/100/100', contactPerson: '王瑞', contactPhone: '13800000002', manager: '李商务', contractDetails: { status: 'SIGNED', partyA: '瑞幸', partyB: '我方', validFrom: '2025-06-01', validTo: '2026-05-31', files: [] }, resources: [{ id: 'r3', name: '瑞幸产品清单.xlsx', type: 'EXCEL', url: '#', uploadTime: '2026-02-15 09:00' }], relatedEntityIds: ['ce4'] },
  { id: 'ce3', name: '新瑞鹏', type: 'BRAND', logo: 'https://picsum.photos/seed/ruipeng/100/100', contactPerson: '张鹏', contactPhone: '13800000003', manager: '王经理', contractDetails: { status: 'SIGNED', partyA: '新瑞鹏', partyB: '我方', validFrom: '2026-01-01', validTo: '2026-12-31', files: [] }, resources: [], relatedEntityIds: ['ce5'] },
  { id: 'ce4', name: '中国移动', type: 'CLIENT', logo: 'https://picsum.photos/seed/cmcc/100/100', contactPerson: '赵移', contactPhone: '13800000004', manager: '赵专员', contractDetails: { status: 'SIGNED', partyA: '中国移动', partyB: '我方', validFrom: '2024-01-01', validTo: '2026-12-31', files: [] }, resources: [{ id: 'r4', name: '中国移动合作规范.pdf', type: 'PDF', url: '#', uploadTime: '2024-01-05 11:00' }], relatedEntityIds: ['ce1', 'ce2'] },
  { id: 'ce5', name: '美团医药', type: 'CLIENT', logo: 'https://picsum.photos/seed/meituan/100/100', contactPerson: '刘美', contactPhone: '13800000005', manager: '刘策划', contractDetails: { status: 'DRAFT', partyA: '美团', partyB: '我方', validFrom: '2026-04-01', validTo: '2027-03-31', files: [] }, resources: [], relatedEntityIds: ['ce3'] },
  { id: 'ce6', name: '阿里巴巴', type: 'CLIENT', logo: 'https://picsum.photos/seed/alibaba/100/100', contactPerson: '马云', contactPhone: '13800000006', manager: '张运营', contractDetails: { status: 'EXPIRED', partyA: '阿里巴巴', partyB: '我方', validFrom: '2023-01-01', validTo: '2025-12-31', files: [] }, resources: [], relatedEntityIds: ['ce1'] },
];

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
    name: '杭研宠物大健康项目',
    clientId: 'ce6',
    brandIds: ['ce3'],
    brands: ['新瑞鹏', '美团医药'],
    logo: 'https://picsum.photos/seed/pethealth/100/100',
    category: '宠物健康',
    currentPhase: 'OPERATING',
    healthStatus: 'HEALTHY',
    manager: '王经理',
    operators: ['张运营', '李商务'],
    todos: [
      { id: 'todo1', text: '提交3月运营月报', completed: false, dueDate: '2026-03-31', brandName: '新瑞鹏', operator: '张运营' },
      { id: 'todo2', text: '跟进五一特惠大促方案审批', completed: false, dueDate: '2026-04-05', brandName: '美团医药', operator: '李商务' },
      { id: 'todo_today1', text: '上传星巴克春季活动总结', completed: false, dueDate: '2026-03-29', brandName: '星巴克', operator: '张运营' },
      { id: 'todo_today2', text: '审核瑞幸咖啡物料', completed: false, dueDate: '2026-03-29', brandName: '瑞幸咖啡', operator: '王经理' },
      { id: 'todo_today3', text: '确认新瑞鹏本周投放计划', completed: false, dueDate: '2026-03-30', brandName: '新瑞鹏', operator: '张运营' },
      { id: 'todo_today4', text: '发送美团医药活动复盘', completed: false, dueDate: '2026-03-30', brandName: '美团医药', operator: '王经理' },
      { id: 'todo_today5', text: '整理宠物健康行业竞品分析', completed: false, dueDate: '2026-03-31', brandName: '新瑞鹏', operator: '张运营' },
      { id: 'todo_today6', text: '准备下周一的客户周会PPT', completed: false, dueDate: '2026-03-29', brandName: '美团医药', operator: '张运营' },
      { id: 'todo_today7', text: '核对本月广告投放账单', completed: false, dueDate: '2026-03-31', brandName: '新瑞鹏', operator: '王经理' },
      { id: 'todo_completed1', text: '更新星巴克春季新品物料', completed: true, dueDate: '2026-03-25', completedAt: '2026-03-25 14:30', operator: '李商务', materialName: '星巴克春季新品物料_v2.zip', materialUrl: '#' },
      { id: 'todo_completed2', text: '提交第一季度预算申请', completed: true, dueDate: '2026-03-28', completedAt: '2026-03-28 10:15', operator: '张运营', materialName: 'Q1预算申请表.xlsx', materialUrl: '#' }
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
        ],
        listedProducts: [
          { id: 'lp1', name: '星巴克大杯拿铁', clientProductName: '移动专享-大杯拿铁', status: 'ONLINE', listingTime: '2026-02-15 10:00' },
          { id: 'lp2', name: '星巴克中杯美式', clientProductName: '阿里88VIP-中杯美式', status: 'ONLINE', listingTime: '2026-02-16 14:30' }
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
          operator: '张运营',
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
          operator: '李商务',
          records: [
            { id: 'r2', date: '2026-03-07', note: '电话沟通活动方案' },
            { id: 'r3', date: '2026-03-09', note: '同步客诉处理进度' },
          ],
        },
      ],
      reports: [
        { id: 'r1', type: 'DAILY', title: '3月28日运营日报', date: '2026-03-28', status: 'SUBMITTED', operator: '张运营' },
        { id: 'r2', type: 'WEEKLY', title: '3月第四周周报', date: '2026-03-29', status: 'SUBMITTED', operator: '李商务' },
        { id: 'r3', type: 'MONTHLY', title: '3月运营月报', date: '2026-03-31', status: 'PENDING', operator: '张运营' },
        { id: 'r3_old', type: 'MONTHLY', title: '2月运营月报', date: '2026-03-01', status: 'SUBMITTED', operator: '张运营' },
      ],
      activities: [
        { 
          id: 'a1', title: '春季新品首发', status: 'ACTIVE', time: '2026-03-01 至 2026-03-31',
          client: '中国移动', products: ['春意抹茶拿铁', '樱花草莓星冰乐'],
          details: '配合移动全球通积分商城春季上新活动，提供专属折扣。',
          materials: [{ name: '春季活动主视觉.jpg', url: '#' }, { name: '活动商品清单.xlsx', url: '#' }]
        },
        { 
          id: 'a2', title: '五一特惠大促', status: 'PLANNING', time: '2026-05-01 至 2026-05-07',
          client: '阿里巴巴', products: ['全场饮品'],
          details: '参与阿里88VIP五一狂欢节，全场饮品88折。',
          materials: [{ name: '五一大促报名表.pdf', url: '#' }]
        },
      ],
    },
    finance: {
      periods: [
        {
          id: 'p2',
          periodName: '2026年3月',
          reconciliation: { status: 'PENDING', clientAmount: 520000, brandAmount: 490000 },
          settlement: { status: 'PENDING', amount: 0 },
          invoicing: { status: 'PENDING', amount: 0 },
          collection: { status: 'PENDING', amount: 0 },
        },
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
      { id: 'c1', type: 'SUCCESS', brandName: '星巴克 (Starbucks)', date: '2026-02-20', client: '抖音本地生活', event: '春节抖音本地生活爆单', summary: '通过达人矩阵配合春节节点，实现单日GMV突破50万。' }
    ],
    operationHistory: [
      { id: 'oh1', date: '2026-03-08 10:00', user: '1310479606@qq.com', action: '添加服务事项', details: '添加了【周报发送】服务' },
      { id: 'oh2', date: '2026-03-09 14:30', user: '1310479606@qq.com', action: '更新财务状态', details: '将2026年2月结算状态标记为已完成' }
    ],
    contracts: [
      {
        id: 'con1',
        name: '星巴克2026年度合作协议',
        status: 'SIGNED',
        partyA: '星巴克企业管理（中国）有限公司',
        partyB: '杭州某某科技有限公司',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        files: [{ name: '星巴克2026年度合作协议.pdf', url: '#' }]
      }
    ]
  },
  {
    id: '2',
    name: '瑞幸咖啡 (Luckin)',
    clientId: 'ce4',
    brandIds: ['ce2'],
    logo: 'https://picsum.photos/seed/luckin/100/100',
    category: '餐饮美食',
    currentPhase: 'ONBOARDING',
    healthStatus: 'AT_RISK',
    manager: '李四',
    operators: ['赵运营'],
    todos: [
      { id: 'todo3', text: '催促客户提供ICP备案截图', completed: false, dueDate: '2026-03-30' },
      { id: 'todo4', text: '排查商品同步接口鉴权问题', completed: false, dueDate: '2026-03-29' }
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
        ],
        listedProducts: [
          { id: 'lp3', name: '生椰拿铁', clientProductName: '快手专供-生椰拿铁', status: 'REVIEWING', listingTime: '2026-03-09 16:00' }
        ]
      },
      channelApi: { completed: false, progress: 20, notes: '快手侧资质审核中' },
    },
    operations: {
      coreMetrics: { salesAmount: 0, orderCount: 0, complaintRate: 0, usageRate: 0, targetReachRate: 0 },
      services: [],
      reports: [
        { id: 'r4', type: 'DAILY', title: '3月28日运营日报', date: '2026-03-28', status: 'SUBMITTED', operator: '赵专员' },
        { id: 'r5', type: 'WEEKLY', title: '3月第四周周报', date: '2026-03-29', status: 'SUBMITTED', operator: '王经理' },
      ],
      activities: [
        { 
          id: 'a3', title: '周二会员日', status: 'ACTIVE', time: '每周二',
          client: '农商行', products: ['全场饮品'],
          details: '农商行信用卡周二买一赠一活动。',
          materials: [{ name: '活动海报.png', url: '#' }]
        }
      ],
    },
    finance: {
      periods: [],
    },
    reviews: [],
    cases: [],
    operationHistory: [],
    contracts: [
      {
        id: 'con2',
        name: '瑞幸咖啡合作协议',
        status: 'SIGNED',
        partyA: '瑞幸咖啡（中国）有限公司',
        partyB: '杭州某某科技有限公司',
        validFrom: '2025-06-01',
        validTo: '2026-05-31',
        files: []
      }
    ]
  },
  {
    id: '3',
    name: '喜茶 (HEYTEA)',
    clientId: 'ce6',
    brandIds: ['ce1'],
    logo: 'https://picsum.photos/seed/heytea/100/100',
    category: '餐饮美食',
    currentPhase: 'REVIEW',
    healthStatus: 'HEALTHY',
    manager: '张三',
    operators: ['王运营', '陈商务'],
    onboarding: {
      signing: { 
        completed: true, 
        taxRate: '6%', 
        paymentMode: '月结', 
        costPriceDesc: '-', 
        settlementMode: 'CPS 4%', 
        annualProcurement: '500W',
        contractDetails: {
          status: 'SIGNED',
          partyA: '喜茶（深圳）企业管理有限责任公司',
          partyB: '杭州某某科技有限公司',
          validFrom: '2025-08-01',
          validTo: '2026-07-31',
          files: [{ name: '喜茶年度合作协议.pdf', url: '#' }]
        }
      },
      brandApi: { completed: true, progress: 100, notes: '' },
      channelListing: { completed: true, channels: ['小红书'], notes: '' },
      channelApi: { completed: true, progress: 100, notes: '' },
    },
    operations: {
      coreMetrics: { salesAmount: 800000, orderCount: 20000, complaintRate: 0.05, usageRate: 92, targetReachRate: 105 },
      services: [],
      reports: [
        { id: 'r9', type: 'MONTHLY', title: '3月运营月报', date: '2026-03-31', status: 'PENDING', operator: '王运营' },
        { id: 'r9_old', type: 'MONTHLY', title: '2月运营月报', date: '2026-03-02', status: 'SUBMITTED', operator: '王运营' },
      ],
      activities: [],
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
      { id: 'c2', type: 'FAILURE', brandName: '喜茶 (HEYTEA)', date: '2026-03-01', client: '自有小程序', event: '新品首发流量不足', summary: '由于预热期过短，导致首发当日自然流量未达预期。' }
    ],
    operationHistory: [],
    contracts: []
  },
  {
    id: '4',
    name: '中国移动权益合作',
    clientId: 'ce4',
    brandIds: ['ce1', 'ce2'],
    brands: ['星巴克', '瑞幸咖啡'],
    logo: 'https://picsum.photos/seed/cmcc/100/100',
    category: '通信权益',
    currentPhase: 'OPERATING',
    healthStatus: 'HEALTHY',
    manager: '王经理',
    operators: ['张运营', '赵专员'],
    todos: [
      { id: 'todo5', text: '对账单核对', completed: false, dueDate: '2026-03-28', brandName: '星巴克' },
      { id: 'todo6', text: '瑞幸新品上架配置', completed: true, dueDate: '2026-03-25', brandName: '瑞幸咖啡' }
    ],
    assets: [
      { id: 'a4', name: '移动权益合作方案.pdf', type: 'PDF', url: '#', uploadDate: '2026-03-01 10:00' },
      { id: 'a5', name: '活动素材包.zip', type: 'ZIP', url: '#', uploadDate: '2026-03-05 14:30' }
    ],
    onboarding: {
      signing: { 
        completed: true, 
        taxRate: '6%', 
        paymentMode: '月结', 
        costPriceDesc: '基础服务费 10W/月', 
        settlementMode: 'CPS 5%', 
        annualProcurement: '预估 2000W',
        contractDetails: {
          status: 'SIGNED',
          partyA: '中国移动通信集团有限公司',
          partyB: '杭州某某科技有限公司',
          validFrom: '2025-01-01',
          validTo: '2026-12-31',
          files: [{ name: '中国移动权益合作协议.pdf', url: '#' }]
        }
      },
      brandApi: { completed: true, progress: 100, notes: '' },
      channelListing: { completed: true, channels: ['中国移动'], notes: '' },
      channelApi: { completed: true, progress: 100, notes: '' }
    },
    operations: {
      coreMetrics: { salesAmount: 1250000, orderCount: 35000, complaintRate: 0.05, usageRate: 0.85, targetReachRate: 0.92 },
      services: [],
      reports: [
        { id: 'r6_d1', type: 'DAILY', title: '3月29日运营日报', date: '2026-03-29', status: 'SUBMITTED', operator: '张运营' },
        { id: 'r6_d2', type: 'DAILY', title: '3月28日运营日报', date: '2026-03-28', status: 'SUBMITTED', operator: '赵专员' },
        { id: 'r6_d3', type: 'DAILY', title: '3月27日运营日报', date: '2026-03-27', status: 'SUBMITTED', operator: '张运营' },
        { id: 'r6', type: 'MONTHLY', title: '3月运营月报', date: '2026-03-31', status: 'PENDING', operator: '张运营' },
        { id: 'r6_old', type: 'MONTHLY', title: '2月运营月报', date: '2026-03-01', status: 'SUBMITTED', operator: '张运营' },
        { id: 'r7', type: 'WEEKLY', title: '3月第四周周报', date: '2026-03-29', status: 'SUBMITTED', operator: '赵专员' },
      ],
      activities: []
    },
    finance: { periods: [] },
    reviews: [],
    cases: [],
    operationHistory: [],
    contracts: []
  },
  {
    id: '5',
    name: '美团医药健康卡',
    clientId: 'ce5',
    brandIds: ['ce3'],
    brands: ['新瑞鹏'],
    logo: 'https://picsum.photos/seed/meituan/100/100',
    category: '医疗健康',
    currentPhase: 'REVIEW',
    healthStatus: 'HEALTHY',
    manager: '王经理',
    operators: ['张运营'],
    todos: [
      { id: 'todo7', text: '输出Q1季度复盘报告', completed: false, dueDate: '2026-04-10', brandName: '新瑞鹏' }
    ],
    assets: [
      { id: 'a6', name: '美团医药健康卡介绍.pptx', type: 'PPT', url: '#', uploadDate: '2026-03-10 09:00' }
    ],
    onboarding: {
      signing: { 
        completed: true, 
        taxRate: '6%', 
        paymentMode: '月结', 
        costPriceDesc: '基础服务费 5W/月', 
        settlementMode: 'CPS 3%', 
        annualProcurement: '预估 500W',
        contractDetails: {
          status: 'SIGNED',
          partyA: '北京三快在线科技有限公司(美团)',
          partyB: '杭州某某科技有限公司',
          validFrom: '2025-06-01',
          validTo: '2026-05-31',
          files: [{ name: '美团医药健康卡合作协议.pdf', url: '#' }]
        }
      },
      brandApi: { completed: true, progress: 100, notes: '' },
      channelListing: { completed: true, channels: ['美团医药'], notes: '' },
      channelApi: { completed: true, progress: 100, notes: '' }
    },
    operations: {
      coreMetrics: { salesAmount: 850000, orderCount: 12000, complaintRate: 0.01, usageRate: 0.95, targetReachRate: 1.1 },
      services: [],
      reports: [
        { id: 'r8_d1', type: 'DAILY', title: '3月29日运营日报', date: '2026-03-29', status: 'SUBMITTED', operator: '刘策划' },
        { id: 'r8', type: 'DAILY', title: '3月28日运营日报', date: '2026-03-28', status: 'SUBMITTED', operator: '刘策划' },
        { id: 'r8_d2', type: 'DAILY', title: '3月27日运营日报', date: '2026-03-27', status: 'SUBMITTED', operator: '刘策划' },
        { id: 'r8_w1', type: 'WEEKLY', title: '3月第四周周报', date: '2026-03-29', status: 'SUBMITTED', operator: '刘策划' },
      ],
      activities: []
    },
    finance: { periods: [] },
    reviews: [],
    cases: [],
    operationHistory: [],
    contracts: [
      {
        id: 'con3',
        name: '新瑞鹏合作协议',
        status: 'SIGNED',
        partyA: '新瑞鹏宠物医疗集团',
        partyB: '杭州某某科技有限公司',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        files: []
      }
    ]
  }
];

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>(initialServiceTemplates);

  const [operators, setOperators] = useState<Operator[]>(initialOperators);
  const [companyEntities, setCompanyEntities] = useState<CompanyEntity[]>(initialCompanyEntities);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);

  const addServiceItem = (item: ServiceItem) => setServiceItems(prev => [...prev, item]);
  const updateServiceItem = (id: string, updatedItem: Partial<ServiceItem>) => 
    setServiceItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item));
  const deleteServiceItem = (id: string) => setServiceItems(prev => prev.filter(item => item.id !== id));

  const addReportTemplate = (template: ReportTemplate) => setReportTemplates(prev => [...prev, template]);
  const updateReportTemplate = (id: string, updatedTemplate: Partial<ReportTemplate>) => 
    setReportTemplates(prev => prev.map(template => template.id === id ? { ...template, ...updatedTemplate } : template));
  const deleteReportTemplate = (id: string) => setReportTemplates(prev => prev.filter(template => template.id !== id));

  const updateCompanyEntity = (id: string, updatedEntity: Partial<CompanyEntity>) => {
    setCompanyEntities((prev) =>
      prev.map((entity) => (entity.id === id ? { ...entity, ...updatedEntity } : entity))
    );
  };

  const addCompanyEntity = (entity: CompanyEntity) => {
    setCompanyEntities((prev) => [...prev, entity]);
  };

  const updateBrand = (id: string, updatedBrand: Partial<Brand>) => {
    setBrands((prev) =>
      prev.map((brand) => (brand.id === id ? { ...brand, ...updatedBrand } : brand))
    );
  };

  const addBrand = (brand: Brand) => {
    setBrands((prev) => [...prev, brand]);
  };

  const addServiceTemplate = (template: ServiceTemplate) => {
    setServiceTemplates((prev) => [...prev, template]);
  };

  const updateOperator = (updatedOperator: Operator) => {
    setOperators((prev) =>
      prev.map((op) => (op.id === updatedOperator.id ? updatedOperator : op))
    );
  };

  const addOperator = (operator: Operator) => {
    setOperators((prev) => [...prev, operator]);
  };

  const deleteOperator = (id: string) => {
    setOperators((prev) => prev.filter((op) => op.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      brands, updateBrand, addBrand, 
      serviceTemplates, addServiceTemplate, 
      operators, updateOperator, addOperator, deleteOperator,
      companyEntities, updateCompanyEntity, addCompanyEntity,
      serviceItems, addServiceItem, updateServiceItem, deleteServiceItem,
      reportTemplates, addReportTemplate, updateReportTemplate, deleteReportTemplate
    }}>
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
