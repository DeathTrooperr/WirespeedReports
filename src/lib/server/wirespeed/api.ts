import type {
	Assets,
	CaseSeverityStat,
	Cases,
	Detection,
	DetectionCategoryClassStat,
	Detections,
	IntegrationSearch,
	IntegrationSearchDto,
	SearchCasesDto,
	SearchDetectionsDto,
	SearchTeam,
	PaginationDto,
	PlatformLogoResponse,
	Team,
	TeamStatistics,
	TimeAverageAndChange,
	ReportPeriodDto
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
	async getTeamStatistics(period: ReportPeriodDto): Promise<TeamStatistics> {
		return this.request<TeamStatistics>('/team/statistics', {
			method: 'POST',
			body: JSON.stringify(period)
		});
	}

	/**
	 * Get case statistics by severity
	 */
	async getCasesStatsBySeverity(period: ReportPeriodDto): Promise<CaseSeverityStat[]> {
		return this.request<CaseSeverityStat[]>('/cases/stats/severity', {
			method: 'POST',
			body: JSON.stringify(period)
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
	 * Search service provider teams
	 */
	async searchTeams(query: PaginationDto): Promise<SearchTeam> {
		return this.request<SearchTeam>('/team', {
			method: 'POST',
			body: JSON.stringify(query)
		});
	}

	/**
	 * Switch to a different team
	 */
	async switchTeam(teamId: string): Promise<{ accessToken: string }> {
		return this.request<{ accessToken: string }>('/team/switch', {
			method: 'POST',
			body: JSON.stringify({ teamId })
		});
	}

	/**
	 * Calculate mean time to resolution
	 */
	async getMttr(period: ReportPeriodDto): Promise<TimeAverageAndChange> {
		return this.request<TimeAverageAndChange>('/cases/mttr', {
			method: 'POST',
			body: JSON.stringify(period)
		});
	}

	/**
	 * Calculate mean time to detect
	 */
	async getMttd(period: ReportPeriodDto): Promise<TimeAverageAndChange> {
		return this.request<TimeAverageAndChange>('/detection/mttd', {
			method: 'POST',
			body: JSON.stringify(period)
		});
	}

	/**
	 * Calculate mean time to verdict
	 */
	async getMttv(period: ReportPeriodDto): Promise<TimeAverageAndChange> {
		return this.request<TimeAverageAndChange>('/detection/mttv', {
			method: 'POST',
			body: JSON.stringify(period)
		});
	}

	/**
	 * Calculate mean time to contain
	 */
	async getMttc(period: ReportPeriodDto): Promise<TimeAverageAndChange> {
		return this.request<TimeAverageAndChange>('/cases/mttc', {
			method: 'POST',
			body: JSON.stringify(period)
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

	/**
	 * Get platform logos
	 */
	async getPlatformLogos(): Promise<PlatformLogoResponse> {
		return this.request<PlatformLogoResponse>('/team/platform-logo', {
			method: 'GET'
		});
	}

	async getAssetsByDetectionId(id: string): Promise<Assets> {
		return this.request<Assets>(`/asset/detection/${id}`, {
			method: 'GET'
		});
	}

	/**
	 * Get detection statistics by category class
	 */
	async getDetectionStatsByCategoryClass(period: ReportPeriodDto): Promise<DetectionCategoryClassStat[]> {
		return this.request<DetectionCategoryClassStat[]>('/detection/stats/category-class', {
			method: 'POST',
			body: JSON.stringify(period)
		});
	}

	/**
	 * Search integrations
	 */
	async getIntegrations(query: IntegrationSearchDto): Promise<IntegrationSearch> {
		return this.request<IntegrationSearch>('/integration', {
			method: 'POST',
			body: JSON.stringify(query)
		});
	}
}
