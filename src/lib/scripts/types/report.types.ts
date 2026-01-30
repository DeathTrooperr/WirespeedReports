export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
export type Theme = 'light' | 'dark';

export interface CaseSeverity {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
}

export interface Branding {
    logo?: string;
    logoLight?: string;
    logoDark?: string;
    theme?: Theme;
    spName?: string;
    supportEmail?: string;
    colors?: {
        primary?: string;
        secondary?: string;
    };
}


export interface IntegrationMetric {
    name: string;
    processed: string;
    count: string;
    countValue: number;
}

export interface CountryDetection {
    country: string;
    count: number;
}

export interface EndpointOS {
    windows: number;
    macos: number;
    linux: number;
    mobile: number;
    other: number;
}

export interface AttackedAsset {
    name: string;
    count: number;
}

export interface EscalatedCase {
    id: string;
    sid: string;
    title: string;
    severity: Severity;
    status: string;
    createdAt: string;
    response: string;
}

export interface ReportData {
    companyName: string;
    reportPeriodLabel: string;
    reportPeriod: string;
    executiveSummary: string;
    
    branding?: Branding;

    billableUsers: number;
    billableEndpoints: number;
    
    detections: {
        total: number;
        historic: number;
        escalated: number;
        escalatedPercent: string;
        chatOps: number;
        chatOpsPercent: string;
        containment: number;
        containmentPercent: string;
        autoClosed: number;
    };
    
    verdictAccuracy: {
        verdictedMalicious: number;
        confirmedMalicious: number;
        truePositives: number;
        truePositivesPercent: string;
        falsePositives: number;
        falsePositivesPercent: string;
    };
    
    potentialActions: {
        wouldEscalate: number;
        wouldChatOps: number;
        wouldContain: number;
    };
    
    eventsByIntegration: IntegrationMetric[];
    endpointsByOS: EndpointOS;
    mostAttackedEndpoints: AttackedAsset[];
    mostAttackedIdentities: AttackedAsset[];
    
    meanTimeMetrics: {
        mttr: string;
        mttd: string;
        mttv: string;
        mttc: string;
    };

    funnelData: {
        total: number;
        detections: number;
        cases: number;
        responded: number;
    };

    casesBySeverity: CaseSeverity;
    suspiciousLoginLocations: CountryDetection[];
    escalatedCases: EscalatedCase[];
}
