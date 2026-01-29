export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export interface CaseSeverity {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
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
