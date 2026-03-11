export type LifecyclePhase = 'ONBOARDING' | 'OPERATING' | 'REVIEW';
export type ServiceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  frequency: ServiceFrequency;
  targetCount: number;
  targetRole: string;
}

export interface BrandServiceTask {
  id: string;
  templateId: string;
  name: string;
  frequency: ServiceFrequency;
  targetCount: number;
  currentCount: number;
  lastRecordDate?: string;
  records: { id: string; date: string; note: string }[];
}

export interface FinancePeriod {
  id: string;
  periodName: string;
  reconciliation: { status: 'PENDING' | 'COMPLETED'; clientAmount: number; brandAmount: number };
  settlement: { status: 'PENDING' | 'COMPLETED'; amount: number };
  invoicing: { status: 'PENDING' | 'COMPLETED'; amount: number; invoiceNo?: string };
  collection: { status: 'PENDING' | 'COMPLETED'; amount: number };
}

export interface BrandOperationHistory {
  id: string;
  date: string;
  user: string;
  action: string;
  details: string;
}

export interface BrandCase {
  id: string;
  type: 'SUCCESS' | 'FAILURE';
  title: string;
  description: string;
  date: string;
}

export interface BrandTodo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export interface BrandAsset {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
}

export interface ContractDetails {
  status: 'DRAFT' | 'SIGNED' | 'EXPIRED';
  partyA: string;
  partyB: string;
  validFrom: string;
  validTo: string;
  files: { name: string; url: string }[];
}

export interface ChannelListingRule {
  clientId: string;
  clientName: string;
  rules: string[];
  requiredMaterials: string[];
  templates: { name: string; url: string }[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  category: string;
  currentPhase: LifecyclePhase;
  healthStatus: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  manager: string;
  todos?: BrandTodo[];
  assets?: BrandAsset[];

  // 1. 前期：接入与上架
  onboarding: {
    signing: {
      completed: boolean;
      taxRate: string;
      paymentMode: string;
      costPriceDesc: string;
      settlementMode: string;
      annualProcurement: string;
      contractDetails?: ContractDetails;
    };
    brandApi: { completed: boolean; progress: number; notes: string };
    channelListing: { completed: boolean; channels: string[]; notes: string; listings?: ChannelListingRule[] };
    channelApi: { completed: boolean; progress: number; notes: string };
  };

  // 2. 中期：运营监控与财务
  operations: {
    coreMetrics: {
      salesAmount: number;
      orderCount: number;
      complaintRate: number;
      usageRate: number;
      targetReachRate: number;
    };
    services: BrandServiceTask[];
    reports: {
      id: string;
      type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
      title: string;
      date: string;
      status: 'SUBMITTED' | 'PENDING';
    }[];
    activities: {
      id: string;
      name: string;
      status: 'PLANNING' | 'APPROVED' | 'ACTIVE' | 'ENDED';
    }[];
    feedbacks: {
      id: string;
      date: string;
      content: string;
    }[];
  };
  finance: {
    periods: FinancePeriod[];
  };

  // 3. 后期：复盘与案例
  reviews: {
    id: string;
    date: string;
    title: string;
    summary: string;
    isReplicable: boolean;
  }[];
  cases: BrandCase[];

  // 操作历史
  operationHistory: BrandOperationHistory[];
}
