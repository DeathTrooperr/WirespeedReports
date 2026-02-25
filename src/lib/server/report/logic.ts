import type { EscalatedCase, ReportData, Severity, EndpointOS } from '$lib/scripts/types/report.types.js';
import type {
	Case,
	TeamOCSFStatistic,
	TeamStatisticsLocation,
	Team,
	TeamStatistics
} from '$lib/server/types/wirespeed.types.js';
import { WirespeedApi } from '$lib/server/wirespeed/api.js';
import sanitizeHtml from 'sanitize-html';

function sanitizeText(text: string | undefined): string {
    if (!text) return '';
    return sanitizeHtml(text, {
        allowedTags: [],
        allowedAttributes: {}
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format a date into the ISO 23-byte format (YYYY-MM-DDTHH:mm:ss.sss) 
 * that the Wirespeed API expects for DateTime64 parameters.
 */
function formatDateForApi(date: Date): string {
    return date.toISOString().slice(0, 23);
}

function formatTimeMetric(metric: { average: number | string; unit: string }) {
    const avg = typeof metric.average === 'string' ? parseFloat(metric.average) : metric.average;

    if (avg === null || avg === undefined || isNaN(avg)) {
        return `0${metric.unit === 'seconds' ? 's' : 'ms'}`;
    }

    const ms = metric.unit === 'seconds' ? avg * 1000 : avg;

    if (ms < 1000) {
        return `${ms.toFixed(0)}ms`;
    } else if (ms < 60000) {
        return `${(ms / 1000).toFixed(1)}s`;
    } else if (ms < 3600000) {
        return `${(ms / 60000).toFixed(1)}m`;
    } else if (ms < 86400000) {
        return `${(ms / 3600000).toFixed(1)}h`;
    } else {
        return `${(ms / 86400000).toFixed(1)}d`;
    }
}

function getIntegrationTypes(description: string | undefined): string[] {
    const desc = (description || '').toLowerCase();
    const types: string[] = [];
    if (desc.includes('password')) types.push('Identity');
    if (desc.includes('mfa') || desc.includes('2fa') || desc.includes('otp')) types.push('Identity');
    if (desc.includes('email') || desc.includes('mail') || desc.includes('office 365') || desc.includes('google workspace')) types.push('Email');
    if (desc.includes('endpoint') || desc.includes('edr') || desc.includes('antivirus') || desc.includes('xdr')) types.push('Endpoint');
    if (desc.includes('user') || desc.includes('identity') || desc.includes('active directory') || desc.includes('entra') || desc.includes('okta') || desc.includes('duo')) types.push('Identity');
    if (desc.includes('cloud') || desc.includes('aws') || desc.includes('azure') || desc.includes('gcp')) types.push('Cloud');
    if (desc.includes('network') || desc.includes('firewall') || desc.includes('vpn') || desc.includes('dns')) types.push('Network');
    if (desc.includes('saas') || desc.includes('application')) types.push('SaaS');
    
    if (types.length === 0) types.push('Other');
    return types;
}

export async function getReportData(apiKey: string, timeframe: { startDate: string, endDate: string, periodLabel: string }, teamId?: string, customColors?: { primary?: string, secondary?: string }, hidePoweredBy?: boolean): Promise<ReportData> {
    const { startDate, endDate, periodLabel } = timeframe;
    let api = new WirespeedApi(apiKey);
    let branding: ReportData['branding'] = undefined;

    if (teamId) {
        const [spTeam, logos] = await Promise.all([
            api.getCurrentTeam(),
            api.getPlatformLogos()
        ]);
        const switchRes = await api.switchTeam(teamId);
        api = new WirespeedApi(switchRes.accessToken);
        branding = {
            logo: logos.platformLogo || spTeam.logo || spTeam.logoUrl || '/wirespeed.avif',
            logoLight: logos.platformLogoLight,
            logoDark: logos.platformLogoDark,
            spName: spTeam.name,
            supportEmail: spTeam.supportEmail,
            hidePoweredBy,
            colors: customColors,
            theme: 'light' // Default theme for branding object if not specified
        };
    }

    let start = new Date(startDate);
    let end = new Date(endDate);
    const now = new Date();
    if (end > now) end = now;
    const startDateString = formatDateForApi(start);
    const endDateString = formatDateForApi(end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const period = { startDate: startDateString, endDate: endDateString };

    const [
        team,
        statsDetections,
        statsOSRes,
        statsResources,
        statsGeographyRes,
        statsEventsRes,
        severityStats,
        mttr,
        mttd,
        mttv,
        mttc,
        cases,
        detections,
        privateCredentialCases,
        publicCredentialCases,
        detectionStatsByCategoryClass,
        integrationsRes
    ] = await Promise.all([
        api.getCurrentTeam(),
        api.getTeamStatisticsDetections(period),
        api.getTeamStatisticsOperatingSystems(period),
        api.getTeamStatisticsResources(period),
        api.getTeamStatisticsGeography(period),
        api.getTeamStatisticsEvents(period),
        api.getCasesStatsBySeverity(period),
        api.getMttr(period),
        api.getMttd(period),
        api.getMttv(period),
        api.getMttc(period),
        api.getCases({
            orderBy: 'createdAt',
            orderDir: 'desc',
            createdAt: { gte: startDateString, lte: endDateString }
        }),
        api.getDetections({
            orderBy: 'createdAt',
            orderDir: 'desc',
            createdAt: { gte: startDateString, lte: endDateString }
        }),
        api.getCases({
            orderBy: 'createdAt',
            orderDir: 'desc',
            createdAt: { gte: startDateString, lte: endDateString },
            category: 'IDENTITY__PRIVATE_CREDENTIAL_EXPOSURE'
        }),
        api.getCases({
            orderBy: 'createdAt',
            orderDir: 'desc',
            createdAt: { gte: startDateString, lte: endDateString },
            category: 'IDENTITY__PUBLIC_CREDENTIAL_EXPOSURE'
        }),
        api.getDetectionStatsByCategoryClass(period),
        api.getIntegrations({ includeDisabled: true })
    ]);

    const stats: Partial<TeamStatistics> = {
        ...statsDetections,
        operatingSystems: statsOSRes?.operatingSystems || [],
        billableUsers: statsResources?.billableUsers || 0,
        billableEndpoints: statsResources?.billableEndpoints || 0,
        detectionLocations: statsGeographyRes?.detectionLocations || [],
        suspiciousLoginLocations: statsGeographyRes?.suspiciousLoginLocations || [],
        ocsfStatistics: statsEventsRes?.ocsfStatistics || []
    };

    const credentialCases = {
        data: [...(Array.isArray(privateCredentialCases?.data) ? privateCredentialCases.data : []), ...(Array.isArray(publicCredentialCases?.data) ? publicCredentialCases.data : [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        totalCount: (privateCredentialCases?.totalCount || 0) + (publicCredentialCases?.totalCount || 0)
    };

    const detectionAssets = await Promise.all((Array.isArray(detections?.data) ? detections.data : []).map((d) => api.getAssetsByDetectionId(d.id)));

    const totalEvents = (Array.isArray(stats?.ocsfStatistics) ? stats.ocsfStatistics : []).reduce((acc, curr) => acc + Number(curr?.totalEvents || 0), 0);

    const endpointsMap: Record<string, number> = {};
    const identitiesMap: Record<string, number> = {};

    detectionAssets.forEach((assets) => {
        (Array.isArray(assets?.endpoints) ? assets.endpoints : []).forEach((e) => {
            const endpoint = e.displayName || e.name;
            if (endpoint) endpointsMap[endpoint] = (endpointsMap[endpoint] || 0) + 1;
        });
        (Array.isArray(assets?.directory) ? assets.directory : []).forEach((u) => {
            const identity = u.displayName || u.email;
            if (identity && u.directoryId) identitiesMap[identity] = (identitiesMap[identity] || 0) + 1;
        });
    });

    const mostAttackedEndpoints = Object.entries(endpointsMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const mostAttackedIdentities = Object.entries(identitiesMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const report: ReportData = {
        companyName: team?.name || 'Unknown Team',
        reportPeriodLabel: periodLabel || '',
        reportPeriod: periodLabel || `Last ${days} Days`,
        branding: branding || undefined,
        executiveSummary:
            `During the time frame of this report, <strong>Wirespeed analyzed</strong> <strong class="text-primary">${(totalEvents || 0).toLocaleString()}</strong> events from <strong class="text-primary">${stats?.billableEndpoints || 0}</strong> ` +
            `<strong>endpoint${Number(stats?.billableEndpoints || 0) !== 1 ? 's' : ''}</strong>, <strong class="text-primary">${stats?.billableUsers || 0}</strong> <strong>user${Number(stats?.billableUsers || 0) !== 1 ? 's' : ''}</strong>, and ` +
            `<strong>other sources</strong> in your environment. Of those events, <strong class="text-primary">${stats?.totalDetections || 0}</strong> <strong> triggered detections</strong> through automated rules and ` +
            `dynamic analysis. Of those detections, <strong>Wirespeed & integrated security tools</strong> automatically resolved <strong class="text-primary">${stats?.automaticallyClosed || 0}</strong> and escalated ` +
            `<strong class="text-primary">${stats?.escalatedDetections || 0}</strong> case${stats?.escalatedDetections == 0 ? "s" : ""} to your security team. Those cases led to <strong>${Number((stats?.chatOpsDetections || 0) + (stats?.containmentDetections || 0)) || "no"}</strong> response actions ` +
            `required to stop further compromise by your security team. This defense strategy continues to reduce your risk, which maximizes your security and minimizes cyberattack damage to your business.`,
        billableUsers: stats?.billableUsers || 0,
        billableEndpoints: stats?.billableEndpoints || 0,

        detections: {
            total: stats?.totalDetections || 0,
            historic: stats?.historicDetections || 0,
            escalated: stats?.escalatedDetections || 0,
            escalatedPercent:
                (stats?.totalDetections || 0) > 0
                    ? `${(((stats?.escalatedDetections || 0) / (stats?.totalDetections || 1)) * 100).toFixed(2)}%`
                    : '0%',
            chatOps: stats?.chatOpsDetections || 0,
            chatOpsPercent:
                (stats?.totalDetections || 0) > 0
                    ? `${(((stats?.chatOpsDetections || 0) / (stats?.totalDetections || 1)) * 100).toFixed(2)}%`
                    : '0%',
            containment: stats?.containmentDetections || 0,
            containmentPercent:
                (stats?.totalDetections || 0) > 0
                    ? `${(((stats?.containmentDetections || 0) / (stats?.totalDetections || 1)) * 100).toFixed(2)}%`
                    : '0%',
            autoClosed: stats?.automaticallyClosed || 0
        },

        verdictAccuracy: {
            verdictedMalicious: stats?.verdictedMalicious || 0,
            confirmedMalicious: stats?.confirmedMalicious || 0,
            truePositives: stats?.truePositiveDetections || 0,
            truePositivesPercent:
                (stats?.escalatedDetections || 0) > 0
                    ? `${(((stats?.truePositiveDetections || 0) / (stats?.escalatedDetections || 1)) * 100).toFixed(2)}%`
                    : '0%',
            falsePositives: stats?.falsePositiveDetections || 0,
            falsePositivesPercent:
                (stats?.escalatedDetections || 0) > 0
                    ? `${(((stats?.falsePositiveDetections || 0) / (stats?.escalatedDetections || 1)) * 100).toFixed(2)}%`
                    : '0%'
        },

        potentialActions: {
            wouldEscalate: stats?.potentialEscalatedDetections || 0,
            wouldChatOps: stats?.potentialChatOpsDetections || 0,
            wouldContain: stats?.potentialContainmentDetections || 0
        },

        eventsByIntegration: (Array.isArray(stats?.ocsfStatistics) ? stats.ocsfStatistics : []).map((s: any) => ({
            name: s?.integration?.config?.name || 'Unknown Integration',
            processed: `${((s?.totalBytes || 0) / 1024 / 1024).toFixed(2)} MB`,
            count: (s?.totalEvents || 0).toLocaleString(),
            countValue: Number(s?.totalEvents || 0)
        })),

        endpointsByOS: (Array.isArray(stats?.operatingSystems) ? stats.operatingSystems : []).reduce(
            (acc: EndpointOS, { operatingSystem, count }: any) => {
                const name = (operatingSystem ?? '').toLowerCase();
                const n = Number(count) || 0;

                if (name.includes('windows')) acc.windows += n;
                else if (name.includes('mac')) acc.macos += n;
                else if (name.includes('linux')) acc.linux += n;
                else if (['ios', 'android', 'mobile'].some((os) => name.includes(os))) acc.mobile += n;
                else acc.other += n;

                return acc;
            },
            { windows: 0, macos: 0, linux: 0, mobile: 0, other: 0 } as EndpointOS
        ),

        mostAttackedEndpoints: mostAttackedEndpoints || [],
        mostAttackedIdentities: mostAttackedIdentities || [],

        meanTimeMetrics: {
            mttr: formatTimeMetric(mttr || { average: 0, unit: 'seconds' }),
            mttd: formatTimeMetric(mttd || { average: 0, unit: 'seconds' }),
            mttv: formatTimeMetric(mttv || { average: 0, unit: 'seconds' }),
            mttc: formatTimeMetric(mttc || { average: 0, unit: 'seconds' }),
        },

        funnelData: {
            total: totalEvents || 0,
            detections: stats?.totalDetections || 0,
            cases: stats?.escalatedDetections || 0,
            responded: Number((stats?.chatOpsDetections || 0) + (stats?.containmentDetections || 0))
        },

        casesBySeverity: {
            critical: severityStats?.find((s) => s.severity === 'CRITICAL')?.count ?? 0,
            high: severityStats?.find((s) => s.severity === 'HIGH')?.count ?? 0,
            medium: severityStats?.find((s) => s.severity === 'MEDIUM')?.count ?? 0,
            low: severityStats?.find((s) => s.severity === 'LOW')?.count ?? 0,
            informational: severityStats?.find((s) => s.severity === 'INFORMATIONAL')?.count ?? 0
        },

        suspiciousLoginLocations: (Array.isArray(stats?.suspiciousLoginLocations) ? stats.suspiciousLoginLocations : [])
            .reduce((acc: TeamStatisticsLocation[], l: TeamStatisticsLocation) => {
                acc.push(l);
                return acc.sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 10);
            }, [])
            .map((l: TeamStatisticsLocation) => ({
                country: l.country || 'Unknown',
                count: l.count || 0
            })),

        integrations: (Array.isArray(integrationsRes?.data) ? integrationsRes.data : []).map((i) => ({
            name: (i.platform == "generic-json" || i.platform == "generic-syslog") ? i.identityFields?.label as string : i.config?.name || i.platform,
            types: getIntegrationTypes(i.config?.description),
            platform: String(i.platform || ''),
            enabled: Boolean(i.enabled),
            logo: i.config?.logoLight || i.config?.logo
        })).filter(i => !["have-i-been-pwned", "ipinfo", "reversing-labs", "wirespeed" ,"sms", "slack", "email", "microsoft-teams"].includes(i.platform)),

        detectionStatsByCategoryClass: (Array.isArray(detectionStatsByCategoryClass) ? detectionStatsByCategoryClass : []).map(c => ({
            categoryClass: c.categoryClass || 'OTHER',
            displayName: c.displayName || 'Other',
            count: c.count || 0,
            percentage: c.percentage || 0
        })),

        mappedDetectionStats: ((): Array<{ category: string, percentage: number, count: number }> => {
            const fixedCategories = [
                { key: 'endpoint', label: 'Endpoint' },
                { key: 'identity', label: 'Identity' },
                { key: 'cloud', label: 'Cloud' },
                { key: 'email', label: 'Email' },
                { key: 'network', label: 'Network' },
                { key: 'data', label: 'Data Loss' },
                { key: 'other', label: 'Other' }
            ];
            
            const totalDetections = stats?.totalDetections || 1;
            
            return fixedCategories.map(cat => {
                const found = (Array.isArray(detectionStatsByCategoryClass) ? detectionStatsByCategoryClass : []).find(
                    s => s.categoryClass?.toLowerCase() === cat.key.toLowerCase() || 
                         s.displayName?.toLowerCase() === cat.label.toLowerCase()
                );
                const count = found ? found.count : 0;
                return {
                    category: cat.label,
                    percentage: (count / totalDetections) * 100,
                    count: count
                };
            });
        })(),

        escalatedCases: ((): EscalatedCase[] => {
            const severityOrder: Record<string, number> = {
                CRITICAL: 0,
                HIGH: 1,
                MEDIUM: 2,
                LOW: 3,
                INFORMATIONAL: 4
            };

            return (cases?.data || [])
                .sort((a, b) => {
                    const aOrder = severityOrder[a.severity] ?? 99;
                    const bOrder = severityOrder[b.severity] ?? 99;
                    return aOrder - bOrder;
                })
                .slice(0, 10)
                .map((c: Case) => ({
                    id: c.id || '',
                    sid: c.sid || '',
                    title: sanitizeText(c.title),
                    severity: (c.severity || 'INFORMATIONAL') as Severity,
                    status: c.status || 'CLOSED',
                    createdAt: c.createdAt || new Date().toISOString(),
                    response: sanitizeText(c.summary || c.notes || 'Investigated and triaged by Wirespeed MDR.')
                }));
        })(),

        darkWebReport: {
            totalExposures: credentialCases.totalCount || 0,
            highRiskExposures: (Array.isArray(credentialCases.data) ? credentialCases.data : []).filter(c => c.severity === 'HIGH' || c.severity === 'CRITICAL').length,
            compromisedAccounts: (Array.isArray(credentialCases.data) ? credentialCases.data : []).length, // Each case is typically an exposure
            recentLeaks: (Array.isArray(credentialCases.data) ? credentialCases.data : []).slice(0, 5).map(c => ({
                date: new Date(c.createdAt || Date.now()).toISOString().slice(0, 10),
                source: c.platforms?.[0] || 'Web Leak',
                type: c.title || 'Unknown Exposure',
                severity: (c.severity === 'CRITICAL' || c.severity === 'HIGH') ? 'HIGH' : (c.severity === 'MEDIUM' ? 'MEDIUM' : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW'
            }))
        }
    };

    return report;
}
