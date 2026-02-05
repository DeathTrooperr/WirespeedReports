import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from '../../../../../../.svelte-kit/types/src/routes';
import { getReportData } from '$lib/server/report/logic.js';
import puppeteer from '@cloudflare/puppeteer';
import JSZip from 'jszip';

export const POST: RequestHandler = async ({ request, platform, url }) => {
	const body = (await request.json()) as {
		apiKey?: string;
		teamIds?: string[];
		customColors?: {
			primary?: string;
			secondary?: string;
		};
		hidePoweredBy?: boolean;
		timeframe: {
			startDate: string;
			endDate: string;
			periodLabel: string;
		};
	};

	const { apiKey, teamIds, timeframe, customColors, hidePoweredBy } = body;

	if (!apiKey || !teamIds || teamIds.length === 0) {
		throw error(400, 'API key and team IDs are required');
	}

	const browserBinding = (platform?.env as any)?.BROWSER;
	if (!browserBinding) {
		throw error(500, 'Browser rendering is not configured on this platform');
	}

	const zip = new JSZip();
	const browser = await puppeteer.launch(browserBinding);
	const errors: { teamId: string, error: string }[] = [];

	try {
		for (const teamId of teamIds) {
			try {
				const reportData = await getReportData(apiKey, timeframe, teamId, customColors, hidePoweredBy);
				const page = await browser.newPage();
				
				// Use the current origin for the render page
				const renderUrl = `${url.origin}/render`;
				await page.goto(renderUrl);

				// Pass data to the page
				await page.evaluate((data) => {
					window.postMessage({ type: 'SET_REPORT_DATA', data }, '*');
				}, reportData);

				// Wait for some element that indicates report is rendered
				// Since Report.svelte has several pages, we wait for the last page or just a bit
				await page.waitForSelector('.a4-page', { timeout: 10000 });
                // Small buffer for charts to animate/render
                await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

				const pdf = await page.pdf({
					format: 'A4',
					printBackground: true,
					margin: { top: 0, right: 0, bottom: 0, left: 0 }
				});

				const fileName = `${reportData.companyName} - ${new Date().toISOString().slice(0, 10)}.pdf`;
				zip.file(fileName, pdf);
				
				await page.close();
			} catch (err: any) {
				console.error(`Error generating report for team ${teamId}:`, err);
				errors.push({ teamId, error: err.message });
				// Continue with other teams even if one fails
			}
		}

		if (zip.files && Object.keys(zip.files).length === 0) {
			return json({ 
				error: {
					message: 'Batch generation failed for all selected clients.',
					code: 'BULK_GEN_FAILED',
					details: errors.map(e => `${e.teamId}: ${e.error}`).join('\n'),
					timestamp: new Date().toISOString(),
					retryable: true
				}
			}, { status: 500 });
		}

		const zipContent = await zip.generateAsync({ type: 'uint8array' });

		return new Response(zipContent as any, {
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="Wirespeed_Reports_Bulk_${new Date().toISOString().slice(0, 10)}.zip"`
			}
		});
	} catch (err: any) {
		console.error('Bulk generation error:', err);
		return json({ 
			error: {
				message: 'An unexpected error occurred during batch generation.',
				code: 'BULK_GEN_CRITICAL_ERROR',
				details: err.message,
				timestamp: new Date().toISOString(),
				retryable: true
			}
		}, { status: 500 });
	} finally {
		await browser.close();
	}
};
