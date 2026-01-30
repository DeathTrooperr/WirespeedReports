export interface Team {
	id: string;
	name: string;
	demo: boolean;
	testMode: boolean;
	chatOpsWelcomeMessage?: string;
	platformName?: string;
	maxChatOpsPerDay?: number;
	maxAutoContainmentsPerDay?: number;
	chatOpsEscalationDelayMinutes: number;
	identityAutoContainment: boolean;
	endpointAutoContainment: boolean;
	escalationEmails: string[];
	autoContainIdentityNHI: boolean;
	autoContainIdentityVIP: boolean;
	autoContainLSTEndpoint: boolean;
	autoContainLOTLEndpoint: boolean;
	autoContainEndpointHVA: boolean;
	autoContainUnmitigatedMalware: boolean;
	autoContainEndpointServers: boolean;
	logoUrl: string;
	chatOpsSecondFactor: boolean;
	chatOpsAccountLockedMessage: string;
	createdAt: string;
	richCaseNotifications?: boolean;
	escalationSubjectLine?: string;
	vipChatOps: boolean;
	managerChatOps: boolean;
	emailSignature: string;
	chatOpsSubjectLine: string;
	notificationEscalationSeverity: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	chatOpsWelcomeMessageInherited?: boolean;
	emailSignatureInherited?: boolean;
	chatOpsSubjectLineInherited?: boolean;
	chatOpsAccountLockedMessageInherited?: boolean;
	serviceProvider?: boolean;
	parentTeamName?: string;
	parentTeamId?: string;
	operatingTeam?: boolean;
	useChatOpsOnboardingGroup?: boolean;
	chatOpsAllowBulkSmsInvite?: boolean;
	billableUsers: number;
	billableEndpoints: number;
	supportEmail?: string;
	address?: string;
	autoSubscribeServiceProviderUsers: boolean;
	orgId?: string;
	logo?: string; // Legacy field retained if still used elsewhere
}

export interface PaginationDto {
	size?: number;
	page?: number;
	filter?: string;
	search?: string;
	orderBy?: string;
	orderDir?: 'asc' | 'desc';
}

export interface SearchTeam {
	data: Team[];
	totalCount: number;
}

export interface TeamStatisticsOperatingSystem {
	operatingSystem: string;
	count: number;
}

export interface TeamStatisticsLocation {
	country: string;
	count: number;
}

export interface IntegrationMetadataConfigCustomFieldV2 {
	slug: string;
	display: string;
	type: string;
	required: boolean;
	description: string;
	validationPattern: string;
	validationMinLength: number;
	validationMaxLength: number;
	source: string;
	advancedOption: boolean;
}

export type UseCase =
	| 'chat_ops'
	| 'CHECK_ATTACK_SIMULATION'
	| 'CHECK_BREACH'
	| 'contain_endpoint'
	| 'contain_user'
	| 'CREATE_TICKET'
	| 'ENRICH_FILE'
	| 'ENRICH_IP'
	| 'ON_ENABLE'
	| 'ON_DISABLE'
	| 'get_detections'
	| 'get_endpoint'
	| 'get_endpoints'
	| 'get_logs'
	| 'get_user'
	| 'get_users'
	| 'INTERNAL'
	| 'INTERNAL_AUTH_CHECK'
	| 'OTHER'
	| 'SEND_MESSAGE'
	| 'uncontain_endpoint'
	| 'uncontain_user'
	| 'update_detection_source'
	| 'UPDATE_TICKET'
	| 'webhook';

export type IntegrationPlatform =
	| 'aws'
	| 'box'
	| 'checkpoint-harmony'
	| 'cisco-catalyst'
	| 'cisco-duo'
	| 'cisco-meraki'
	| 'cisco-umbrella'
	| 'connectwise-psa'
	| 'crowdstrike-falcon'
	| 'email'
	| 'fortianalyzer'
	| 'fortinet'
	| 'generic-json'
	| 'generic-syslog'
	| 'google-alert-center'
	| 'google-directory'
	| 'google-security-center'
	| 'have-i-been-pwned'
	| 'hyas-protect'
	| 'ipinfo'
	| 'jamf-pro'
	| 'jamf-protect'
	| 'jira-cloud'
	| 'jira-data-center'
	| 'kandji'
	| 'manage-engine-ad-audit-plus'
	| 'microsoft'
	| 'microsoft-entra'
	| 'microsoft-teams'
	| 'mimecast'
	| 'okta'
	| 'one-password'
	| 'orca-security'
	| 'reversing-labs'
	| 'safebreach'
	| 'sentinel-one'
	| 'slack'
	| 'sms'
	| 'thinkst-canary'
	| 'vectra'
	| 'windows-event-logs'
	| 'wirespeed'
	| 'wiz'
	| 'wordfence';

export interface IntegrationActionV2 {
	slug: string;
	display: string;
	description: string;
	useCases: UseCase[];
}

export interface IntegrationMetadataConfigV2 {
	authType: 'oauth2' | 'api_token' | 'basic' | 'other';
	name: string;
	customFields: IntegrationMetadataConfigCustomFieldV2[];
	logo: string;
	logoLight: string;
	logoDark: string;
	beta: boolean;
	description: string;
	slug: string;
	internalCreds: boolean;
	docsUrl: string;
	default: boolean;
	rtfm: boolean;
	useCases: UseCase[];
	webhookActions: IntegrationActionV2[];
}

export interface IntegrationV2 {
	id: string;
	platform: IntegrationPlatform;
	enabled: boolean;
	teamId: string;
	config: IntegrationMetadataConfigV2;
	permissionsUpdateAvailable: boolean;
	permissionUpdateExplanation: string;
	identityFields: Record<string, unknown>;
}

export interface TeamOCSFStatistic {
	integration: IntegrationV2;
	totalEvents: number;
	totalBytes: number;
}

export interface CaseSeverityStat {
	severity: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	count: number;
	percentage: number;
}

export interface TimeAverageAndChange {
	average: number | string;
	unit: 'seconds' | 'milliseconds';
	change: number;
}

export interface TeamStatistics {
	escalatedDetections: number;
	totalDetections: number;
	chatOpsDetections: number;
	containmentDetections: number;
	potentialChatOpsDetections: number;
	potentialContainmentDetections: number;
	potentialEscalatedDetections: number;
	automaticallyClosed: number;
	confirmedMalicious: number;
	verdictedMalicious: number;
	truePositiveDetections: number;
	historicDetections: number;
	falsePositiveDetections: number;
	billableUsers: number;
	billableEndpoints: number;
	operatingSystems: TeamStatisticsOperatingSystem[];
	detectionLocations: TeamStatisticsLocation[];
	suspiciousLoginLocations: TeamStatisticsLocation[];
	ocsfStatistics: TeamOCSFStatistic[];
}

export interface PlatformLogoResponse {
	platformLogo: string;
	platformLogoLight: string;
	platformLogoDark: string;
}

export interface SearchCasesDto {
	size?: number;
	page?: number;
	filter?: string;
	search?: string;
	orderBy?: string;
	orderDir?: 'asc' | 'desc';
	statuses?: string[];
	verdict?: 'MALICIOUS' | 'SUSPICIOUS' | 'BENIGN';
	assetId?: string;
	severity?: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	assetType?:
		| 'USER'
		| 'PROCESS'
		| 'USER_AGENT'
		| 'FILE'
		| 'ENDPOINT'
		| 'LOCATION'
		| 'IP'
		| 'DOMAIN';
	exclusionId?: string;
	onlyWasEscalated?: boolean;
	onlyWasContained?: boolean;
	onlyWasMobile?: boolean;
	onlyChatOps?: boolean;
	integrationPlatform?: string;
	hideDemoClients?: boolean;
	categoryClass?:
		| 'ENDPOINT'
		| 'IDENTITY'
		| 'CLOUD'
		| 'EMAIL'
		| 'NETWORK'
		| 'DATA'
		| 'POSTURE'
		| 'OTHER';
	category?: string;
	createdAt?: {
		gt?: string;
		gte?: string;
		lt?: string;
		lte?: string;
	};
}

export interface JSONLog {
	log: string;
	timestamp: string;
	debug: boolean;
}

export interface Case {
	id: string;
	sid: string;
	teamId: string;
	name?: string;
	lastNotifiedClientAt: object;
	status: 'NEW' | 'PROCESSING' | 'ESCALATED' | 'HUNTING' | 'MONITORING' | 'CHATOPS' | 'CLOSED';
	createdAt: string;
	detectionSids?: string[];
	testMode: boolean;
	firstDetectionSourceIngestedAt: string;
	firstDetectionSourceDetectedAt: string;
	updatedAt?: string;
	closedAt?: string;
	logs: JSONLog[];
	contained: boolean;
	reingested: boolean;
	verdict: 'MALICIOUS' | 'SUSPICIOUS' | 'BENIGN';
	title: string;
	categories: string[];
	excludeFromMeans: boolean;
	verdictedAt?: string;
	detectionCount?: number;
	firstRun: boolean;
	mttr?: number;
	teamName?: string;
	containsVIP: boolean;
	containsHVA: boolean;
	containsMobile: boolean;
	externalTicketId?: string;
	externalTicketIntegrationId?: string;
	autoContained: boolean;
	severity: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	severityOrdinal: number;
	respondedAt?: string;
	platforms?: string[];
	notes?: string;
	clientNotified: boolean;
	summary?: string;
	hasPassedAql?: boolean;
}

export interface Cases {
	data: Case[];
	totalCount: number;
}

export interface Endpoint {
	id: string;
	displayName: string;
	teamId: string;
	edrSourceId?: string;
	mdmSourceId?: string;
	name?: string;
	hva: boolean;
	hvaOverriddenByUser?: boolean;
	createdAt: string;
	privateIpAddress?: string;
	live?: boolean;
	operatingSystem?: string;
	integrationId: object;
	contained: boolean;
	managed?: boolean;
	publicIpAddress?: string;
	workstation: boolean;
	server: boolean;
	mobile: boolean;
	updatedAt?: string;
	raw?: object;
}

export interface DirectoryUserTagDTO {
	id: string;
	directoryUserId: string;
	tag: 'VIP' | 'ADMIN' | 'TECHNICAL' | 'FINANCIAL' | 'NHI';
	automationId: string;
	teamId: string;
	overriddenByUser: boolean;
	enabled: boolean;
	createdAt: string;
}

export interface DirectoryUser {
	id: string;
	displayName: string;
	teamId: string;
	enabled?: boolean;
	directoryId?: string;
	name?: string;
	phoneNumber?: string;
	previousPhoneNumber?: string;
	title?: string;
	email?: string;
	additionalEmails?: string[];
	allEmails: string[];
	vip?: boolean;
	nhi?: boolean;
	financial?: boolean;
	technical?: boolean;
	managerDirectoryId?: string;
	managerEmail?: string;
	domain?: string;
	department?: string;
	createdAt: string;
	integrationId: object;
	roles: string[];
	lastCredentialExposure?: object;
	credentialsExposed: boolean;
	numberCredentialExposures: number;
	lastCheckedForCredentialExposures?: object;
	needsChatOpsWelcome?: boolean;
	contained?: boolean;
	username?: string;
	containable: boolean;
	smsConsentReceivedAt?: object;
	administrator?: boolean;
	updatedAt?: string;
	passwordLastChangedAt?: string;
	lastSignInAt?: string;
	raw?: object;
	tags: DirectoryUserTagDTO[];
	managed?: boolean;
	chatOpsOnboardingUser?: boolean;
	verifiedPhoneNumber?: string;
}

export interface Process {
	id: string;
	displayName: string;
	teamId: string;
	command?: string;
	sha256?: string;
	sha1?: string;
	createdAt: string;
}

export interface Domain {
	id: string;
	displayName: string;
	teamId: string;
	name: string;
	createdAt: string;
}

export interface Location {
	id: string;
	displayName: string;
	teamId: string;
	lat?: string;
	lon?: string;
	city?: string;
	state?: string;
	country?: string;
	countryCode?: string;
	continent?: string;
	continentCode?: string;
	createdAt: string;
	known: boolean;
	safe?: boolean;
	detectionSid?: string;
}

export interface ThreatName {
	name: string;
	engine: string;
	excluded: boolean;
	matchedFileRiskRules?: string[];
}

export interface FileMetadataVersionInfo {
	name: string;
	value: string;
}

export interface FileMetadata {
	threatNames: ThreatName[];
	lastScanTime: object;
	story?: string;
	versionInfo: FileMetadataVersionInfo[];
	proposedFileNames: string[];
}

export interface File {
	id: string;
	displayName: string;
	teamId: string;
	name?: string;
	path?: string;
	sha256?: string;
	sha1?: string;
	toolName?: string;
	createdAt: string;
	updatedAt: string;
	lastEnrichedAt?: object;
	nameWithPath?: string;
	fileRisk:
		| 'BENIGN'
		| 'MALWARE'
		| 'LATE_STAGE'
		| 'NUISANCE'
		| 'LIVE_OFF_THE_LAND'
		| 'REMOTE_MANAGEMENT'
		| 'UNKNOWN';
	metadata?: FileMetadata;
	enrichedViaIntegration: boolean;
}

export interface ASN {
	asn: string;
	name: string;
	domain: string;
	route: string;
	type: string;
}

export interface Company {
	name: string;
	domain: string;
	type: string;
}

export interface IPMetadataPrivacy {
	vpn: boolean;
	proxy: boolean;
	tor: boolean;
	relay: boolean;
	hosting: boolean;
	service: string;
}

export interface Abuse {
	address: string;
	country: string;
	email: string;
	name: string;
	network: string;
	phone: string;
	ofac: boolean;
	adversarial: boolean;
}

export interface IPDomains {
	ip: string;
	total: number;
	domains: string[];
}

export interface IPInfoMetadataImpl {
	ip?: string;
	hostname?: string;
	city?: string;
	region?: string;
	country?: string;
	loc?: string;
	postal?: string;
	timezone?: string;
	org?: string;
	asn: ASN;
	company: Company;
	privacy: IPMetadataPrivacy;
	abuse: Abuse;
	domains: IPDomains;
	ofac: boolean;
	adversarial: boolean;
}

export interface IP {
	ipv4?: string;
	ipv6?: string;
	metadata: IPInfoMetadataImpl;
	displayName: string;
	id: string;
	teamId: string;
	createdAt: string;
	updatedAt: string;
	locationId?: string;
	metadataLastFetchedAt: string;
	known: boolean;
	safe?: boolean;
	detectionSid?: string;
}

export interface UserAgent {
	id: string;
	userAgent: string;
	userAgentAlt: string;
	teamId: string;
	createdAt: string;
	displayName: string;
	browserName: string;
	browserVersion: string;
	browserMajorVersion: string;
	cpuArchitecture: string;
	deviceModel: string;
	deviceVendor: string;
	engineName: string;
	engineVersion: string;
	osName: string;
	osVersion: string;
}

export interface Assets {
	endpoints: Endpoint[];
	directory: DirectoryUser[];
	processes: Process[];
	domains: Domain[];
	locations: Location[];
	files: File[];
	ips: IP[];
	userAgents: UserAgent[];
}

export interface DateFilterDto {
	gt?: string;
	gte?: string;
	lt?: string;
	lte?: string;
}

export interface SearchDetectionsDto {
	size?: number;
	page?: number;
	filter?: string;
	search?: string;
	orderBy?: string;
	orderDir?: 'asc' | 'desc';
	caseIdOrSid?: string;
	statuses?: string[];
	verdict?: 'MALICIOUS' | 'SUSPICIOUS' | 'BENIGN';
	assetId?: string;
	assetType?:
		| 'USER'
		| 'PROCESS'
		| 'USER_AGENT'
		| 'FILE'
		| 'ENDPOINT'
		| 'LOCATION'
		| 'IP'
		| 'DOMAIN';
	hideExcluded?: boolean;
	onlyChatOps?: boolean;
	onlyWasEscalated?: boolean;
	onlyWasContained?: boolean;
	hideDemoClients?: boolean;
	categoryClass?:
		| 'ENDPOINT'
		| 'IDENTITY'
		| 'CLOUD'
		| 'EMAIL'
		| 'NETWORK'
		| 'DATA'
		| 'POSTURE'
		| 'OTHER';
	category?: string;
	exclusionId?: string;
	severity?: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	integrationPlatform?: string;
	createdAt?: DateFilterDto;
}

export interface VerdictRule {
	id: string;
	stage: 'TRIAGE' | 'HUNT' | 'MONITOR';
	default: boolean;
	managedByWspd: boolean;
	category: string;
	wspdRule: string;
	retired: boolean;
	escalate: boolean;
	chatOps: boolean;
	close: boolean;
	disabled: boolean;
	containUser: boolean;
	containEndpoint: boolean;
	chatOpsMFA: boolean;
	monitor: boolean;
	monitorFallbackPreset?: 'ESCALATE' | 'ESCALATE_CONTAIN' | 'CLOSE';
	managerChatOps: boolean;
	vipChatOps: boolean;
	createdAt: string;
	updatedAt: string;
	teamId: string;
	chatOpsTimeoutVerdict?: 'MALICIOUS' | 'SUSPICIOUS' | 'BENIGN';
	chatOpsTimeoutMonitor?: boolean;
	chatOpsUnsureVerdict: 'MALICIOUS' | 'SUSPICIOUS' | 'BENIGN';
	verdict?: 'MALICIOUS' | 'SUSPICIOUS' | 'BENIGN';
	description: string;
	managedByParent?: boolean;
	severity: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	useSourceSeverity?: boolean;
}

export interface Detection {
	id: string;
	teamId: string;
	teamName?: string;
	sourceDescription?: string;
	notes?: string;
	sourceName?: string;
	description?: string;
	status: 'NEW' | 'PROCESSING' | 'ESCALATED' | 'HUNTING' | 'MONITORING' | 'CHATOPS' | 'CLOSED';
	createdAt: string;
	containments: string[];
	testMode: boolean;
	caseId?: string;
	sourceIngestedAt: string;
	sourceDetectedAt: string;
	verdictedAt?: string;
	updatedAt?: string;
	closedAt?: string;
	logs: JSONLog[];
	raw: Record<string, any>;
	verdict: 'MALICIOUS' | 'SUSPICIOUS' | 'BENIGN';
	title: string;
	integrationPlatform: string;
	integrationId?: string;
	duplicateDetectionId?: string;
	contained: boolean;
	nextSteps?: string;
	reingested: boolean;
	prevented: boolean;
	excludeFromMeans: boolean;
	caseSid?: string;
	sid: string;
	firstRun: boolean;
	containOnChatOpsFailure: boolean;
	wasEscalated: boolean;
	ocsfDetectionFinding: Record<string, any>;
	actionSlug?: string;
	exclusionId?: string;
	exclusionSid?: string;
	autoClosed?: boolean;
	autoContained?: boolean;
	category: string;
	verdictSetting?: VerdictRule;
	chatOpsTest: boolean;
	severity: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	severityOrdinal: number;
	containsVIP: boolean;
	containsHVA: boolean;
	excluded: boolean;
	chatOpsTestEmail?: string;
	chatOpsTestPhoneNumber?: string;
	customDetectionId?: string;
}

export interface Detections {
	data: Detection[];
	totalCount: number;
}
