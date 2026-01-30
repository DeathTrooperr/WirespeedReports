import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import type { EscalatedCase, ReportData, Severity, EndpointOS } from '$lib/scripts/types/report.types.js';
import type {
	Case,
	TeamOCSFStatistic,
	TeamStatisticsLocation,
	TeamStatisticsOperatingSystem,
} from '$lib/server/types/wirespeed.types.js';
import { WirespeedApi } from '$lib/server/wirespeed/api.js';
import sanitizeHtml from 'sanitize-html';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = (await request.json()) as {
			apiKey?: string;
			teamId?: string;
			customColors?: {
				primary?: string;
				secondary?: string;
			};
			timeframe: {
				startDate: string;
				endDate: string;
				periodLabel: string;
			};
		};
		const { apiKey, timeframe, teamId, customColors } = body;
		const { startDate, endDate, periodLabel } = timeframe;

		if (!apiKey) {
			return json({ error: 'API key is required' }, { status: 400 });
		}

		let api = new WirespeedApi(apiKey);
		let branding: ReportData['branding'] = undefined;

		try {
			if (teamId) {
				const [spTeam, logos] = await Promise.all([
					api.getCurrentTeam(),
					api.getPlatformLogos()
				]);
				const switchRes = await api.switchTeam(teamId);
				api = new WirespeedApi(switchRes.accessToken);
				branding = {
					logo: spTeam.logoUrl || spTeam.logo,
					logoLight: logos.platformLogoLight,
					logoDark: logos.platformLogoDark,
					spName: spTeam.name,
					supportEmail: spTeam.supportEmail,
					colors: customColors
				};
			}
		} catch (brandingError: any) {
			console.error('Error fetching branding info:', brandingError);
			// Non-critical, continue without branding or return error if authentication failed
			if (brandingError.message?.includes('401')) {
				return json({ error: 'Authentication failed. Please check your API key.' }, { status: 401 });
			}
		}

		const start = new Date(startDate);
		const end = new Date(endDate);
		const startDateString = start.toISOString();

		// Calculate days between dates for API calls
		const diffTime = Math.abs(end.getTime() - start.getTime());
		const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

		let team, stats, severityStats, mttr, mttd, mttv, mttc, cases, detections;

		try {
			[team, stats, severityStats, mttr, mttd, mttv, mttc, cases, detections] = await Promise.all([
				api.getCurrentTeam(),
				api.getTeamStatistics(days),
				api.getCasesStatsBySeverity(days),
				api.getMttr(days),
				api.getMttd(days),
				api.getMttv(days),
				api.getMttc(days),
				api.getCases({
					orderBy: 'createdAt',
					orderDir: 'desc',
					createdAt: {
						gte: startDateString
					}
				}),
				api.getDetections({
					orderBy: 'createdAt',
					orderDir: 'desc',
					createdAt: {
						gte: startDateString
					}
				})
			]);
		} catch (apiError: any) {
			console.error('Wirespeed API error during report generation:', apiError);
			return json({ 
				error: apiError.message?.includes('401') 
					? 'Invalid API key or session expired.' 
					: 'Error retrieving security data from Wirespeed.' 
			}, { status: 500 });
		}

		const detectionAssets = await Promise.all(detections.data.map((d) => api.getAssetsByDetectionId(d.id)));

		const formatTimeMetric = (metric: { average: number | string; unit: string }) => {
			const avg = typeof metric.average === 'string' ? parseFloat(metric.average) : metric.average;

			if (avg === null || avg === undefined || isNaN(avg)) {
				return `0${metric.unit === 'seconds' ? 's' : 'ms'}`;
			}

			// Convert to milliseconds as base
			const ms = metric.unit === 'seconds' ? avg * 1000 : avg;

			if (ms < 1000) {
				return `${ms.toFixed(0)}ms`;
			} else if (ms < 60000) {
				return `${(ms / 1000).toFixed(1)}s`;
			} else if (ms < 3600000) {
				return `${(ms / 60000).toFixed(1)}m`;
			} else if (ms < 86400000) {
				return `${(ms / 3600000).toFixed(1)} hour${ms === 3600000 ? '' : 's'}`;
			} else {
				return `${(ms / 86400000).toFixed(1)} day${ms === 86400000 ? '' : 's'}`;
			}
		};

		const totalEvents = stats.ocsfStatistics.reduce((acc, curr) => acc + Number(curr.totalEvents), 0);

		const sanitizeText = (text: string) => {
			if (!text) return '';
			return sanitizeHtml(text, {
				allowedTags: [],
				allowedAttributes: {}
			})
				.replace(/\s+/g, ' ') // Normalize whitespace
				.trim();
		};

		const endpointsMap: Record<string, number> = {};
		const identitiesMap: Record<string, number> = {};

		detectionAssets.forEach((assets) => {
			assets.endpoints.forEach((e) => {
				const endpoint = e.displayName || e.name;
				if (endpoint) endpointsMap[endpoint] = (endpointsMap[endpoint] || 0) + 1;
			});
			assets.directory.forEach((u) => {
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
			companyName: team.name,
			reportPeriodLabel: periodLabel,
			reportPeriod: `Last ${days} Days`,
			branding,
			executiveSummary:
				`During the time frame of this report, <strong>Wirespeed analyzed</strong> <strong class="text-primary">${totalEvents.toLocaleString()}</strong> events from <strong class="text-primary">${stats.billableEndpoints}</strong> ` +
				`<strong>endpoint${Number(stats.billableEndpoints) !== 1 ? 's' : ''}</strong>, <strong class="text-primary">${stats.billableUsers}</strong> <strong>user${Number(stats.billableUsers) !== 1 ? 's' : ''}</strong>, and ` +
				`<strong>other sources</strong> in your environment. Of those events, <strong class="text-primary">${stats.totalDetections}</strong> <strong> triggered detections</strong> through automated rules and ` +
				`dynamic analysis. Of those detections, <strong>Wirespeed & integrated security tools</strong> automatically resolved <strong class="text-primary">${stats.automaticallyClosed}</strong> and escalated ` +
				`<strong class="text-primary">${stats.escalatedDetections}</strong> case to your security team. Those cases led to <strong>${Number((stats.chatOpsDetections + stats.containmentDetections))}</strong> response actions ` +
				`which were taken to stop further compromise by your security team. This defense strategy continues to reduce your risk, which maximizes your security and minimizes cyberattack damage to your business.`,
			billableUsers: stats.billableUsers,
			billableEndpoints: stats.billableEndpoints,

			detections: {
				total: stats.totalDetections,
				historic: stats.historicDetections,
				escalated: stats.escalatedDetections,
				escalatedPercent:
					stats.totalDetections > 0
						? `${((stats.escalatedDetections / stats.totalDetections) * 100).toFixed(2)}%`
						: '0%',
				chatOps: stats.chatOpsDetections,
				chatOpsPercent:
					stats.totalDetections > 0
						? `${((stats.chatOpsDetections / stats.totalDetections) * 100).toFixed(2)}%`
						: '0%',
				containment: stats.containmentDetections,
				containmentPercent:
					stats.totalDetections > 0
						? `${((stats.containmentDetections / stats.totalDetections) * 100).toFixed(2)}%`
						: '0%',
				autoClosed: stats.automaticallyClosed
			},

			verdictAccuracy: {
				verdictedMalicious: stats.verdictedMalicious,
				confirmedMalicious: stats.confirmedMalicious,
				truePositives: stats.truePositiveDetections,
				truePositivesPercent:
					stats.escalatedDetections > 0
						? `${((stats.truePositiveDetections / stats.escalatedDetections) * 100).toFixed(2)}%`
						: '0%',
				falsePositives: stats.falsePositiveDetections,
				falsePositivesPercent:
					stats.escalatedDetections > 0
						? `${((stats.falsePositiveDetections / stats.escalatedDetections) * 100).toFixed(2)}%`
						: '0%'
			},

			potentialActions: {
				wouldEscalate: stats.potentialEscalatedDetections,
				wouldChatOps: stats.potentialChatOpsDetections,
				wouldContain: stats.potentialContainmentDetections
			},

			eventsByIntegration: stats.ocsfStatistics.map((s: TeamOCSFStatistic) => ({
				name: s.integration.config.name,
				processed: `${(s.totalBytes / 1024 / 1024).toFixed(2)} MB`,
				count: s.totalEvents.toLocaleString(),
				countValue: Number(s.totalEvents)
			})),

			endpointsByOS: stats.operatingSystems.reduce(
				(acc, { operatingSystem, count }) => {
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

			mostAttackedEndpoints,
			mostAttackedIdentities,

			meanTimeMetrics: {
				mttr: formatTimeMetric(mttr),
				mttd: formatTimeMetric(mttd),
				mttv: formatTimeMetric(mttv),
				mttc: formatTimeMetric(mttc),
			},

			funnelData: {
				total: totalEvents,
				detections: stats.totalDetections,
				cases: stats.escalatedDetections,
				responded: Number(stats.chatOpsDetections + stats.containmentDetections)
			},

			casesBySeverity: {
				critical: severityStats.find((s) => s.severity === 'CRITICAL')?.count ?? 0,
				high: severityStats.find((s) => s.severity === 'HIGH')?.count ?? 0,
				medium: severityStats.find((s) => s.severity === 'MEDIUM')?.count ?? 0,
				low: severityStats.find((s) => s.severity === 'LOW')?.count ?? 0,
				informational: severityStats.find((s) => s.severity === 'INFORMATIONAL')?.count ?? 0
			},

			suspiciousLoginLocations: stats.suspiciousLoginLocations
				.reduce((acc: TeamStatisticsLocation[], l: TeamStatisticsLocation) => {
					acc.push(l);
					return acc.sort((a, b) => b.count - a.count).slice(0, 10);
				}, [])
				.map((l: TeamStatisticsLocation) => ({
					country: l.country,
					count: l.count
				})),

			escalatedCases: ((): EscalatedCase[] => {
				const severityOrder: Record<string, number> = {
					CRITICAL: 0,
					HIGH: 1,
					MEDIUM: 2,
					LOW: 3,
					INFORMATIONAL: 4
				};

				return cases.data
					.sort((a, b) => {
						const aOrder = severityOrder[a.severity] ?? 99;
						const bOrder = severityOrder[b.severity] ?? 99;
						return aOrder - bOrder;
					})
					.slice(0, 10)
					.map((c: Case) => ({
						id: c.id,
						sid: c.sid,
						title: sanitizeText(c.title),
						severity: c.severity as Severity,
						status: c.status,
						createdAt: c.createdAt,
						response: sanitizeText(c.summary || c.notes || 'Investigated and triaged by Wirespeed MDR.')
					}));
			})()
		};

		return json(report);
	} catch (error) {
		console.error('Error generating report:', error);
		return json({ error: 'Failed to generate report' }, { status: 500 });
	}
};
