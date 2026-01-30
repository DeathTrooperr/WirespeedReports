import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getReportData } from '$lib/server/report/logic.js';

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

		if (!apiKey) {
			return json({ error: 'API key is required' }, { status: 400 });
		}

		try {
			const report = await getReportData(apiKey, timeframe, teamId, customColors);
			return json(report);
		} catch (apiError: any) {
			console.error('Wirespeed API error during report generation:', apiError);
			const isAuthError = apiError.message?.includes('401');
			return json({ 
				error: {
					message: isAuthError 
						? 'Your session has expired or the API key is no longer valid.' 
						: 'We were unable to aggregate security data for the selected period.',
					code: isAuthError ? 'AUTH_EXPIRED' : 'DATA_FETCH_FAILED',
					details: apiError.message,
					timestamp: new Date().toISOString(),
					retryable: true
				}
			}, { status: isAuthError ? 401 : 500 });
		}
	} catch (error) {
		console.error('Error generating report:', error);
		return json({ error: 'Failed to generate report' }, { status: 500 });
	}
};
