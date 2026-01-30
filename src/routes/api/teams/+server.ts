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
            const message = apiError.message?.includes('401') 
                ? 'Invalid API key. Please check your credentials.' 
                : 'Could not connect to the Wirespeed API. Please try again later.';
            return json({ error: message }, { status: apiError.status || 500 });
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
