import type {
	Assets,
	CaseSeverityStat,
	Cases,
	Detection,
	Detections,
	SearchCasesDto,
	SearchDetectionsDto,
	Team,
	TeamStatistics,
	TimeAverageAndChange
} from '../types/wirespeed.types.js';

export class WirespeedApi {
	private baseUrl = 'https://api.wirespeed.co';
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
		const response = await fetch(`${this.baseUrl}${path}`, {
			...options,
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json',
				...options.headers
			}
		});

		if (!response.ok) {
			const error = (await response.json().catch(() => ({}))) as { message?: string };
			throw new Error(
				`Wirespeed API error: ${error.message || response.statusText} (${response.status})`
			);
		}

		return response.json();
	}

	/**
	 * Get team statistics report
	 */
	async getTeamStatistics(days: number): Promise<TeamStatistics> {
		return this.request<TeamStatistics>('/team/statistics', {
			method: 'POST',
			body: JSON.stringify({ days })
		});
	}

	/**
	 * Get case statistics by severity
	 * Can not be greater than 90 days.
	 */
	async getCasesStatsBySeverity(days: number): Promise<CaseSeverityStat[]> {
		return this.request<CaseSeverityStat[]>('/cases/stats/severity', {
			method: 'POST',
			body: JSON.stringify({ days })
		});
	}

	/**
	 * Get current team information
	 */
	async getCurrentTeam(): Promise<Team> {
		return this.request<Team>('/team', {
			method: 'GET'
		});
	}

	/**
	 * Calculate mean time to resolution
	 */
	async getMttr(days: number): Promise<TimeAverageAndChange> {
		return this.request<TimeAverageAndChange>('/cases/mttr', {
			method: 'POST',
			body: JSON.stringify({ days })
		});
	}

	/**
	 * Calculate mean time to detect
	 */
	async getMttd(days: number): Promise<TimeAverageAndChange> {
		return this.request<TimeAverageAndChange>('/detection/mttd', {
			method: 'POST',
			body: JSON.stringify({ days })
		});
	}

	/**
	 * Calculate mean time to verdict
	 */
	async getMttv(days: number): Promise<TimeAverageAndChange> {
		return this.request<TimeAverageAndChange>('/detection/mttv', {
			method: 'POST',
			body: JSON.stringify({ days })
		});
	}

	/**
	 * Calculate mean time to contain
	 */
	async getMttc(days: number): Promise<TimeAverageAndChange> {
		return this.request<TimeAverageAndChange>('/cases/mttc', {
			method: 'POST',
			body: JSON.stringify({ days })
		});
	}

	/**
	 * Search and list cases
	 */
	async getCases(query: SearchCasesDto): Promise<Cases> {
		return this.request<Cases>('/cases', {
			method: 'POST',
			body: JSON.stringify(query)
		});
	}

	/**
	 * Search and list detections
	 */
	async getDetections(query: SearchDetectionsDto): Promise<Detections> {
		return this.request<Detections>('/detection', {
			method: 'POST',
			body: JSON.stringify(query)
		});
	}

	async getAssetsByDetectionId(id: string): Promise<Assets> {
		return this.request<Assets>(`/asset/detection/${id}`, {
			method: 'GET'
		});
	}
}
