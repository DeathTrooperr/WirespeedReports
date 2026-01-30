import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { WirespeedApi } from '$lib/server/wirespeed/api.js';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { apiKey } = (await request.json()) as { apiKey: string };
        if (!apiKey) {
            return json({ error: 'API key is required' }, { status: 400 });
        }

        const api = new WirespeedApi(apiKey);
        let currentTeam;
        let searchResult;
        
        try {
            [currentTeam, searchResult] = await Promise.all([
                api.getCurrentTeam(),
                api.searchTeams({
                    size: 1000,
                    orderBy: 'name',
                    orderDir: 'asc'
                })
            ]);
        } catch (apiError: any) {
            console.error('Wirespeed API error in teams fetch:', apiError);
            const isAuthError = apiError.message?.includes('401');
            return json({ 
                error: {
                    message: isAuthError 
                        ? 'The API key provided is invalid or has expired.' 
                        : 'We encountered an issue connecting to the Wirespeed API.',
                    code: isAuthError ? 'AUTH_FAILED' : 'CONNECTION_ERROR',
                    details: apiError.message,
                    timestamp: new Date().toISOString(),
                    retryable: !isAuthError
                }
            }, { status: isAuthError ? 401 : 500 });
        }
        
        return json({
            isServiceProvider: !!currentTeam.serviceProvider,
            teams: searchResult.data
        });
    } catch (error) {
        console.error('Error fetching teams:', error);
        return json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
};
