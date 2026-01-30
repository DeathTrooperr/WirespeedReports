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
			return json({ 
				error: apiError.message?.includes('401') 
					? 'Invalid API key or session expired.' 
					: 'Error retrieving security data from Wirespeed.' 
			}, { status: 500 });
		}
	} catch (error) {
		console.error('Error generating report:', error);
		return json({ error: 'Failed to generate report' }, { status: 500 });
	}
};
