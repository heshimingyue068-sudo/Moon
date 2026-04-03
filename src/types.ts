export type LifecyclePhase = 'ONBOARDING' | 'OPERATING' | 'REVIEW';

export type ServiceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export type ServiceTemplate = {
  id: string;
  name: string;
  description: string;
  frequency: ServiceFrequency;
  targetCount: number;
  targetRole: string;
};

export type Operator = {
  id: string;
  name: string;
  avatar: string;
  title: string;
  email?: string;
  department?: string;
  status?: string;
  phone?: string;
};

export type BrandServiceTask = {
  id: string;
  templateId: string;
  name: string;
  frequency: ServiceFrequency;
  targetCount: number;
  currentCount: number;
  lastRecordDate?: string;
  operator?: string;
  records: { id: string; date: string; note: string }[];
};

export type BrandOperationHistory = {
  id: string;
  date: string;
  user: string;
  action: string;
  details: string;
};

export type BrandTodo = {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string;
  brandName?: string;
  operator?: string;
  completedAt?: string;
  materialName?: string;
  materialUrl?: string;
  cc?: string[];
};

export type BrandAsset = {
  id: string;
  name: string;
  type: 'PDF' | 'IMAGE' | 'EXCEL' | 'PPT' | 'ZIP' | 'OTHER';
  url: string;
  uploadDate: string;
};

export type ChannelListingRule = {
  clientId: string;
  clientName: string;
  rules: string[];
  requiredMaterials: string[];
  templates: { name: string; url: string }[];
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
};

export type CompanyEntity = {
  id: string;
  name: string;
  type: 'BRAND' | 'CLIENT';
  logo: string;
  contactPerson: string;
  contactPhone: string;
  contactPosition?: string;
  category?: string;
  manager: string;
  contractDetails?: {
    status: 'SIGNED' | 'DRAFT' | 'EXPIRED';
    partyA: string;
    partyB: string;
    validFrom: string;
    validTo: string;
    files: { name: string; url: string }[];
  };
  agencyAuth?: { name: string; url: string }[];
  logoAuth?: { name: string; url: string }[];
  qualifications?: {
    trademark?: { name: string; url: string }[];
    icp?: { name: string; url: string }[];
    industryCert?: { name: string; url: string }[];
    other?: { name: string; url: string }[];
  };
  resources: { id: string; name: string; type: string; url: string; uploadTime: string }[];
  relatedEntityIds: string[];
};

export type ContractDetail = {
  id?: string;
  name?: string;
  status: 'SIGNED' | 'DRAFT' | 'EXPIRED';
  partyA: string;
  partyB: string;
  validFrom: string;
  validTo: string;
  files: { name: string; url: string }[];
};

export type Brand = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  clientId: string;
  brandIds: string[];
  brands?: string[];
  logo: string;
  category: string;
  currentPhase: LifecyclePhase;
  healthStatus: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  manager: string;
  operators?: string[];
  todos?: BrandTodo[];
  assets?: BrandAsset[];
  onboarding: any;
  operations: any;
  finance: any;
  reviews: any[];
  cases: any[];
  operationHistory: BrandOperationHistory[];
  contracts?: ContractDetail[];
};

// New types for Brand and Client Management
export type ServiceType = 'general' | 'weekly_report' | 'monthly_report';

export type ServiceItem = {
  id: string;
  entityId: string;
  name: string;
  type: ServiceType;
};

export type ReportField = {
  id: string;
  label: string;
};

export const AVAILABLE_REPORT_FIELDS: ReportField[] = [
  { id: 'impressions', label: '曝光量 (Impressions)' },
  { id: 'clicks', label: '点击量 (Clicks)' },
  { id: 'ctr', label: '点击率 (CTR)' },
  { id: 'spend', label: '消耗 (Spend)' },
  { id: 'conversions', label: '转化数 (Conversions)' },
  { id: 'cpa', label: '转化成本 (CPA)' },
  { id: 'roi', label: '投资回报率 (ROI)' },
  { id: 'top_posts', label: '热门内容 (Top Posts)' },
  { id: 'audience_insights', label: '受众分析 (Audience Insights)' },
  { id: 'competitor_analysis', label: '竞品分析 (Competitor Analysis)' },
  { id: 'next_week_plan', label: '下周计划 (Next Week Plan)' },
];

export type ReportTemplate = {
  id: string;
  serviceItemId: string;
  selectedFieldIds: string[];
};

export type Client = {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  brandIds: string[]; // Associated brands
  createdAt: string;
};
