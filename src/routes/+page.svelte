<script lang="ts">
    import { untrack } from 'svelte';
    import { fade, slide } from 'svelte/transition';
    import Report from '$lib/components/pages/home/Report.svelte';
    import ErrorReport from '$lib/components/ui/ErrorReport.svelte';
    import IncompatibleDevice from '$lib/components/ui/IncompatibleDevice.svelte';
    import type { ReportData, AppError } from '$lib/scripts/types/report.types.js';
    import type { Team } from '$lib/server/types/wirespeed.types.js';

    let mode = $state<'individual' | 'service-provider'>('individual');
    let reportingMode = $state<'single' | 'bulk'>('single');

    $effect(() => {
        // 1. Handle mode/reportingMode consistency
        if (mode === 'individual' && reportingMode === 'bulk') {
            reportingMode = 'single';
        }

        // 2. Handle Branding Updates for Service Provider
        const currentPrimary = primaryColor;
        const currentTheme = theme;
        
        // Always apply colors to document root for real-time sidebar feedback
        if (typeof document !== 'undefined') {
            const hexToHsl = (hex: string) => {
                hex = hex.replace(/^#/, '');
                if (hex.length === 3) hex = hex.split('').map(s => s + s).join('');
                const r = parseInt(hex.substring(0, 2), 16) / 255;
                const g = parseInt(hex.substring(2, 4), 16) / 255;
                const b = parseInt(hex.substring(4, 6), 16) / 255;
                const max = Math.max(r, g, b), min = Math.min(r, g, b);
                let h = 0, s = 0, l = (max + min) / 2;
                if (max !== min) {
                    const d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch (max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                    }
                    h /= 6;
                }
                return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
            };

            const getContrastColor = (hex: string) => {
                hex = hex.replace(/^#/, '');
                if (hex.length === 3) hex = hex.split('').map(s => s + s).join('');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                return (yiq >= 128) ? '224 71.4% 4.1%' : '210 20% 98%';
            };

            document.documentElement.style.setProperty('--primary', hexToHsl(currentPrimary));
            document.documentElement.style.setProperty('--primary-foreground', getContrastColor(currentPrimary));
        }

        if (reportData && mode === 'service-provider') {
            untrack(() => {
                if (reportData && (
                    reportData.branding?.colors?.primary !== currentPrimary ||
                    reportData.branding?.theme !== currentTheme
                )) {
                    const newBranding = { 
                        ...(reportData.branding || {}),
                        colors: {
                            ...(reportData.branding?.colors || {}),
                            primary: currentPrimary
                        },
                        theme: currentTheme
                    };
                    reportData = { ...reportData, branding: newBranding };
                }
            });
        }

        // 3. Handle Automatic Team Fetching (client-only to avoid SSR fetch)
        if (typeof window !== 'undefined') {
            const currentKey = apiKey;
            if (currentKey && currentKey.length >= 32 && currentKey !== lastFetchedKey) {
                const timer = setTimeout(() => {
                    untrack(() => fetchTeams());
                }, 500);
                return () => clearTimeout(timer);
            }
        }

        // 3. Handle Automatic Compatibility Check (client-only to avoid SSR fetch)
        if (typeof window !== 'undefined') {
            const checkCompatibility = () => {
                const ua = navigator.userAgent;
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
                const isSmallScreen = window.innerWidth < 1024;
                isIncompatible = isMobile || isSmallScreen;
            };

            checkCompatibility();
            window.addEventListener('resize', checkCompatibility);
            return () => window.removeEventListener('resize', checkCompatibility);
        }

        // 4. Handle Automatic Disclaimer Check (client-only to avoid SSR fetch)
        if (typeof window !== 'undefined') {
            const dismissed = localStorage.getItem('wirespeed-disclaimer-dismissed');
            if (!dismissed) {
                showDisclaimer = true;
            }
        }
    });

    let apiKey = $state('');
    let selectedTeamId = $state('');
    let selectedTeamIds = $state<string[]>([]);
    let teams = $state<Team[]>([]);
    let isFetchingTeams = $state(false);
    let theme = $state<'light' | 'dark'>('light');

    let primaryColor = $state('#6d28d9'); // Default primary

    let periodType = $state<'monthly' | 'quarterly' | 'yearly' | 'custom' | 'days'>('days');
    let selectedDays = $state(30);
    let selectedMonth = $state(new Date().toISOString().slice(0, 7));
    let selectedYear = $state(new Date().getFullYear());
    let selectedQuarter = $state(Math.floor(new Date().getMonth() / 3) + 1);
    let customStart = $state('');
    let customEnd = $state('');
    let appError = $state<AppError | null>(null);
    let isIncompatible = $state(false);
    let hidePoweredBy = $state(false);

    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentYear = new Date().getFullYear();
    const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;

    const dateRange = $derived.by(() => {
        let start = '';
        let end = '';
        
        switch (periodType) {
            case 'days':
                const d = new Date();
                end = d.toISOString().slice(0, 10);
                d.setDate(d.getDate() - selectedDays);
                start = d.toISOString().slice(0, 10);
                break;
            case 'monthly':
                if (selectedMonth) {
                    const [y, m] = selectedMonth.split('-').map(Number);
                    start = `${selectedMonth}-01`;
                    if (selectedMonth === currentMonth) {
                        end = today;
                    } else {
                        end = new Date(y, m, 0).toISOString().slice(0, 10);
                    }
                }
                break;
            case 'quarterly':
                const qStartMonth = (selectedQuarter - 1) * 3;
                start = new Date(selectedYear, qStartMonth, 1).toISOString().slice(0, 10);
                if (selectedYear === currentYear && selectedQuarter === currentQuarter) {
                    end = today;
                } else {
                    end = new Date(selectedYear, qStartMonth + 3, 0).toISOString().slice(0, 10);
                }
                break;
            case 'yearly':
                start = `${selectedYear}-01-01`;
                if (selectedYear === currentYear) {
                    end = today;
                } else {
                    end = `${selectedYear}-12-31`;
                }
                break;
            case 'custom':
                start = customStart;
                end = customEnd;
                break;
        }
        return { start, end };
    });

    const periodLabel = $derived.by(() => {
        switch (periodType) {
            case 'days':
                return `Last ${selectedDays} Days`;
            case 'monthly':
                if (selectedMonth) {
                    const date = new Date(selectedMonth + '-01T00:00:00');
                    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                }
                break;
            case 'quarterly':
                return `Q${selectedQuarter} ${selectedYear}`;
            case 'yearly':
                return `${selectedYear}`;
            case 'custom':
                if (customStart && customEnd) return `${customStart} to ${customEnd}`;
                break;
        }
        return '';
    });

    let reportData: ReportData | null = $state(null);
    let isGenerating = $state(false);

    let showDisclaimer = $state(false);

    function dismissDisclaimer() {
        showDisclaimer = false;
        if (typeof window !== 'undefined') {
            localStorage.setItem('wirespeed-disclaimer-dismissed', 'true');
        }
    }

    let lastFetchedKey = '';
    async function fetchTeams() {
        if (!apiKey || apiKey === lastFetchedKey) return;
        isFetchingTeams = true;
        appError = null;
        try {
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey })
            });
            if (response.ok) {
                const result = (await response.json()) as { teams: Team[]; isServiceProvider: boolean };
                teams = result.teams;
                mode = result.isServiceProvider ? 'service-provider' : 'individual';
                lastFetchedKey = apiKey;
            } else {
                const errorData = (await response.json()) as { error?: AppError };
                appError = errorData.error || {
                    message: 'Unable to fetch account details. Please verify your API key and try again.',
                    code: 'FETCH_TEAMS_ERROR',
                    timestamp: new Date().toISOString(),
                    retryable: true
                };
                mode = 'individual';
            }
        } catch (e: any) {
            appError = {
                message: 'A network error occurred while fetching account details. Please check your connection.',
                code: 'NETWORK_ERROR',
                details: e.message,
                timestamp: new Date().toISOString(),
                retryable: true
            };
            mode = 'individual';
        } finally {
            isFetchingTeams = false;
        }
    }

    async function generateReport(targetTeamId?: string) {
        const teamIdToUse = targetTeamId || (mode === 'service-provider' ? selectedTeamId : undefined);

        if (!apiKey) {
            appError = {
                message: 'Please enter an API Key to generate the report.',
                code: 'MISSING_API_KEY',
                timestamp: new Date().toISOString(),
                retryable: false
            };
            return;
        }

        if (mode === 'service-provider' && !teamIdToUse) {
            appError = {
                message: 'Please select a client to generate the report for.',
                code: 'MISSING_CLIENT',
                timestamp: new Date().toISOString(),
                retryable: false
            };
            return;
        }

        if (periodType === 'custom' && customStart && customEnd) {
            const start = new Date(customStart);
            const end = new Date(customEnd);
            const diffInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
            if (diffInDays > 365) {
                appError = {
                    message: 'Custom range must be less than 1 year (365 days).',
                    code: 'INVALID_CUSTOM_RANGE',
                    timestamp: new Date().toISOString(),
                    retryable: false
                };
                return;
            }
        }

        // Validate date range is not in the future
        const now = new Date();
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        if (start > now || end > now) {
            appError = {
                message: 'Reporting period cannot be in the future.',
                code: 'FUTURE_DATE_RANGE',
                timestamp: new Date().toISOString(),
                retryable: false
            };
            return;
        }

        if (!targetTeamId) isGenerating = true;
        appError = null;
        
        try {
            const response = await fetch('/api/report/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    apiKey,
                    teamId: mode === 'service-provider' ? teamIdToUse : undefined,
                    customColors: mode === 'service-provider' ? {
                        primary: primaryColor
                    } : undefined,
                    hidePoweredBy: mode === 'service-provider' ? hidePoweredBy : false,
                    timeframe: {
                        startDate: dateRange.start,
                        endDate: dateRange.end,
                        periodLabel,
                    }
                })
            });

            if (response.ok) {
                const data = (await response.json()) as ReportData;
                if (!targetTeamId) {
                    reportData = data;
                }
                return data;
            } else {
                const errorData = (await response.json()) as { error?: AppError };
                appError = errorData.error || {
                    message: 'The report could not be generated. This may be due to missing data for the selected period.',
                    code: 'GENERATE_REPORT_ERROR',
                    timestamp: new Date().toISOString(),
                    retryable: true
                };
            }
        } catch (error: any) {
            console.error('Error fetching report data:', error);
            appError = {
                message: 'An unexpected error occurred while generating the report. Please try again later.',
                code: 'UNEXPECTED_GEN_ERROR',
                details: error.message,
                timestamp: new Date().toISOString(),
                retryable: true
            };
        } finally {
            if (!targetTeamId) isGenerating = false;
        }
    }

    let isBulkExporting = $state(false);
    async function bulkExport() {
        if (selectedTeamIds.length === 0) {
            appError = {
                message: 'Please select at least one client for bulk export.',
                code: 'NO_CLIENTS_SELECTED',
                timestamp: new Date().toISOString(),
                retryable: false
            };
            return;
        }

        isBulkExporting = true;
        appError = null;

        // Validate custom range is less than 1 year
        if (periodType === 'custom' && customStart && customEnd) {
            const start = new Date(customStart);
            const end = new Date(customEnd);
            const diffInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
            if (diffInDays > 365) {
                appError = {
                    message: 'Custom range must be less than 1 year (365 days).',
                    code: 'INVALID_CUSTOM_RANGE',
                    timestamp: new Date().toISOString(),
                    retryable: false
                };
                isBulkExporting = false;
                return;
            }
        }

        // Validate date range is not in the future
        const now = new Date();
        const startRange = new Date(dateRange.start);
        const endRange = new Date(dateRange.end);
        if (startRange > now || endRange > now) {
            appError = {
                message: 'Reporting period cannot be in the future.',
                code: 'FUTURE_DATE_RANGE',
                timestamp: new Date().toISOString(),
                retryable: false
            };
            isBulkExporting = false;
            return;
        }

        try {
            const response = await fetch('/api/generate/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey,
                    teamIds: selectedTeamIds,
                    customColors: { primary: primaryColor },
                    hidePoweredBy,
                    timeframe: {
                        startDate: dateRange.start,
                        endDate: dateRange.end,
                        periodLabel
                    }
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Wirespeed_Reports_Bulk_${new Date().toISOString().slice(0, 10)}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                const errorData = (await response.json()) as { error?: AppError };
                appError = errorData.error || {
                    message: 'Failed to generate bulk reports.',
                    code: 'BULK_GEN_ERROR',
                    timestamp: new Date().toISOString(),
                    retryable: true
                };
            }
        } catch (e: any) {
            console.error('Bulk export error:', e);
            appError = {
                message: 'An unexpected error occurred during bulk export.',
                code: 'UNEXPECTED_BULK_ERROR',
                details: e.message,
                timestamp: new Date().toISOString(),
                retryable: true
            };
        } finally {
            isBulkExporting = false;
        }
    }

    function printReport() {
        window.print();
    }
</script>

<div class="flex h-screen bg-gray-100 overflow-hidden print:h-auto print:overflow-visible print:block">
    <!-- Sidebar -->
    <aside class="w-full sm:w-60 md:w-64 lg:w-72 flex-shrink-0 bg-gradient-to-b from-[#5b21b6] to-[#4c1d95] text-white flex flex-col z-10 print:hidden transition-all duration-300 border-r border-white/10">
        <div class="p-4 border-b border-white/10">
            <h1 class="text-lg font-black tracking-tight uppercase">Report Generator</h1>
            <p class="text-[10px] text-white/80 mt-0.5">Configure your security report</p>
        </div>

        <div class="flex-grow p-4 space-y-6 overflow-y-auto">
            <!-- Global Config: API Key & Mode -->
            <div class="space-y-4">
                <div class="space-y-2">
                    <label for="apiKey" class="text-[10px] font-black uppercase tracking-widest text-white/80">API Key</label>
                    <div class="flex gap-2">
                        <input 
                            type="password" 
                            id="apiKey"
                            bind:value={apiKey}
                            placeholder="Paste your Wirespeed API Key"
                            class="flex-grow bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/60 transition-colors text-white placeholder:text-white/70"
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <p class="text-[10px] font-black uppercase tracking-widest text-white/80">Account Mode</p>
                    <div class="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 overflow-hidden relative min-h-[40px]">
                        {#if isFetchingTeams}
                            <div in:fade={{ duration: 200 }} class="absolute inset-x-4 flex items-center gap-2">
                                <div class="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin"></div>
                                <span class="text-[10px] font-black uppercase tracking-wider text-white/40 animate-pulse">
                                    Fetching Details...
                                </span>
                            </div>
                        {:else}
                            {#key mode}
                                <div in:fade={{ duration: 300 }} class="absolute inset-x-4 flex items-center">
                                    <span class="text-[10px] font-black uppercase tracking-wider text-white">
                                        {mode === 'service-provider' ? 'Service Provider' : 'Individual'}
                                    </span>
                                </div>
                            {/key}
                        {/if}
                    </div>
                </div>

                {#if mode === 'service-provider'}
                    <div transition:slide={{ duration: 300 }} class="grid grid-cols-2 gap-3 pt-2">
                        <div class="space-y-1">
                            <label for="themeSelect" class="text-[9px] font-black uppercase tracking-widest text-white/80">Logo Theme</label>
                            <div class="flex p-0.5 bg-white/5 rounded-lg border border-white/10 h-[36px] items-center">
                                <button 
                                    onclick={() => theme = 'light'}
                                    class="flex-1 h-full py-0.5 text-[8px] font-black uppercase tracking-wider rounded transition-all {theme === 'light' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}"
                                >
                                    Light
                                </button>
                                <button 
                                    onclick={() => theme = 'dark'}
                                    class="flex-1 h-full py-0.5 text-[8px] font-black uppercase tracking-wider rounded transition-all {theme === 'dark' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}"
                                >
                                    Dark
                                </button>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label for="primaryColor" class="text-[9px] font-black uppercase tracking-widest text-white/80">Color</label>
                            <div class="flex items-center h-[36px] px-2 bg-white/5 rounded-lg border border-white/10">
                                <div class="flex items-center gap-2 w-full">
                                    <input 
                                        type="color" 
                                        id="primaryColor"
                                        bind:value={primaryColor}
                                        class="w-5 h-5 rounded border-none bg-transparent cursor-pointer p-0"
                                    />
                                    <span class="text-[9px] font-mono text-white/40 uppercase truncate flex-grow">{primaryColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}

                {#if mode === 'service-provider'}
                    <label class="flex items-center gap-3 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors group">
                        <div class="relative flex items-center">
                            <input 
                                type="checkbox" 
                                bind:checked={hidePoweredBy}
                                class="peer sr-only"
                            />
                            <div class="w-8 h-4 bg-white/10 rounded-full transition-colors peer-checked:bg-white/30"></div>
                            <div class="absolute left-0.5 w-3 h-3 bg-white/40 rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-white"></div>
                        </div>
                        <span class="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">Hide "Powered by Wirespeed"</span>
                    </label>
                {/if}

                <div class="space-y-4 pt-2">
                    <p class="text-[10px] font-black uppercase tracking-widest text-white/80">Reporting Period</p>
                    
                    <div class="space-y-2">
                        <label for="periodType" class="text-xs text-white/90">Type</label>
                        <select 
                            id="periodType"
                            bind:value={periodType}
                            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/40 transition-colors text-white [color-scheme:dark] *:bg-[#6d28d9]"
                        >
                            <option value="days">Days</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {#if periodType === 'days'}
                        <div class="space-y-2">
                            <label for="daysSelect" class="text-xs text-white/90">Range</label>
                            <select 
                                id="daysSelect"
                                bind:value={selectedDays}
                                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/40 transition-colors text-white [color-scheme:dark] *:bg-[#6d28d9]"
                            >
                                <option value={30}>30 Days</option>
                                <option value={60}>60 Days</option>
                                <option value={90}>90 Days</option>
                                <option value={180}>180 Days</option>
                            </select>
                        </div>
                    {:else if periodType === 'monthly'}
                        <div class="space-y-2">
                            <label for="monthPicker" class="text-xs text-white/70">Select Month</label>
                            <input 
                                type="month" 
                                id="monthPicker"
                                bind:value={selectedMonth}
                                max={currentMonth}
                                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/40 transition-colors text-white [color-scheme:dark]"
                            />
                        </div>
                    {:else if periodType === 'quarterly'}
                        <div class="grid grid-cols-2 gap-2">
                            <div class="space-y-2">
                                <label for="quarterPicker" class="text-xs text-white/70">Quarter</label>
                                <select 
                                    id="quarterPicker"
                                    bind:value={selectedQuarter}
                                    class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/40 transition-colors text-white [color-scheme:dark] *:bg-[#6d28d9]"
                                >
                                    <option value={1} disabled={selectedYear === currentYear && currentQuarter < 1}>Q1</option>
                                    <option value={2} disabled={selectedYear === currentYear && currentQuarter < 2}>Q2</option>
                                    <option value={3} disabled={selectedYear === currentYear && currentQuarter < 3}>Q3</option>
                                    <option value={4} disabled={selectedYear === currentYear && currentQuarter < 4}>Q4</option>
                                </select>
                            </div>
                            <div class="space-y-2">
                                <label for="yearPicker" class="text-xs text-white/70">Year</label>
                                <input 
                                    type="number" 
                                    id="yearPicker"
                                    bind:value={selectedYear}
                                    max={currentYear}
                                    oninput={(e) => {
                                        if (selectedYear === currentYear && selectedQuarter > currentQuarter) {
                                            selectedQuarter = currentQuarter;
                                        }
                                    }}
                                    class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/40 transition-colors text-white"
                                />
                            </div>
                        </div>
                    {:else if periodType === 'yearly'}
                        <div class="space-y-2">
                            <label for="yearPickerOnly" class="text-xs text-white/70">Select Year</label>
                            <input 
                                type="number" 
                                id="yearPickerOnly"
                                bind:value={selectedYear}
                                max={currentYear}
                                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/40 transition-colors text-white"
                            />
                        </div>
                    {:else if periodType === 'custom'}
                        <div class="space-y-2">
                            <label for="customStart" class="text-xs text-white/70">Start Date</label>
                            <input 
                                type="date" 
                                id="customStart"
                                bind:value={customStart}
                                max={today}
                                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/40 transition-colors text-white [color-scheme:dark]"
                            />
                        </div>
                        <div class="space-y-2">
                            <label for="customEnd" class="text-xs text-white/70">End Date</label>
                            <input 
                                type="date" 
                                id="customEnd"
                                bind:value={customEnd}
                                max={today}
                                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/40 transition-colors text-white [color-scheme:dark]"
                            />
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Report Type Split -->
            <div class="pt-6 border-t border-white/10 space-y-6">
                {#if mode === 'service-provider'}
                    <div class="flex p-1 bg-white/5 rounded-lg">
                        <button 
                            onclick={() => reportingMode = 'single'}
                            class="flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded transition-all {reportingMode === 'single' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}"
                        >
                            Individual
                        </button>
                        <button 
                            onclick={() => reportingMode = 'bulk'}
                            class="flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded transition-all {reportingMode === 'bulk' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}"
                        >
                            Bulk
                        </button>
                    </div>
                {/if}

                {#if reportingMode === 'single'}
                    <div class="space-y-4 animate-in fade-in slide-in-from-top-2">
                        {#if mode === 'service-provider'}
                            <div class="space-y-2">
                                <label for="clientSelect" class="text-[10px] font-black uppercase tracking-widest text-white/50">Select Client</label>
                                <select 
                                    id="clientSelect"
                                    bind:value={selectedTeamId}
                                    disabled={isFetchingTeams}
                                    class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/40 transition-colors text-white [color-scheme:dark] *:bg-[#6d28d9] disabled:opacity-50"
                                >
                                    <option value="">{isFetchingTeams ? 'Retrieving clients...' : 'Select a client'}</option>
                                    {#each teams as team}
                                        <option value={team.id}>{team.name}</option>
                                    {/each}
                                </select>
                            </div>
                        {/if}

                        <button 
                            onclick={() => generateReport()}
                            disabled={isGenerating || (mode === 'service-provider' && !selectedTeamId)}
                            class="w-full bg-[#f3f4f6] text-[#6d28d9] font-bold py-2.5 rounded-lg hover:bg-[#f3f4f6]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {#if isGenerating}
                                <div class="flex items-center gap-1">
                                    <div class="w-1 h-1 bg-[#6d28d9] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div class="w-1 h-1 bg-[#6d28d9] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div class="w-1 h-1 bg-[#6d28d9] rounded-full animate-bounce"></div>
                                </div>
                                <span class="text-xs">Preparing Report...</span>
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                <span class="text-sm">Generate Report</span>
                            {/if}
                        </button>
                    </div>
                {:else}
                    <div class="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div class="space-y-2">
                            <p class="text-[10px] font-black uppercase tracking-widest text-white/50">Select Clients ({selectedTeamIds.length})</p>
                            <div class="max-h-48 overflow-y-auto bg-white/5 border border-white/10 rounded-lg p-2 space-y-1">
                                {#each teams as team}
                                    <label class="flex items-center gap-3 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors">
                                        <input 
                                            type="checkbox" 
                                            value={team.id}
                                            checked={selectedTeamIds.includes(team.id)}
                                            onchange={(e) => {
                                                if (e.currentTarget.checked) {
                                                    selectedTeamIds = [...selectedTeamIds, team.id];
                                                } else {
                                                    selectedTeamIds = selectedTeamIds.filter(id => id !== team.id);
                                                }
                                            }}
                                            class="rounded border-white/20 bg-transparent text-accent focus:ring-accent cursor-pointer"
                                        />
                                        <span class="text-xs truncate">{team.name}</span>
                                    </label>
                                {/each}
                                {#if teams.length === 0}
                                    <p class="text-[10px] text-white/30 text-center py-4">No clients found</p>
                                {/if}
                            </div>
                        </div>

                        <button 
                            onclick={bulkExport}
                            disabled={isBulkExporting || selectedTeamIds.length === 0}
                            class="w-full bg-accent text-primary font-bold py-2.5 rounded-lg hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {#if isBulkExporting}
                                <div class="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                <span class="text-sm">Exporting...</span>
                            {:else}
                                <span class="text-sm">Bulk Export</span>
                            {/if}
                        </button>
                    </div>
                {/if}
            </div>
        </div>

        <div class="p-4 border-t border-white/10 bg-black/20">
            <button 
                onclick={printReport}
                class="w-full border border-white/20 hover:bg-white/5 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                <span class="text-sm">Print / Download</span>
            </button>
        </div>
    </aside>

    <!-- Preview Area -->
    <main class="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-8 print:p-0 print:bg-white print:block print:h-auto print:overflow-visible">
        {#if appError}
            <ErrorReport error={appError} onDismiss={() => appError = null} />
        {/if}

        {#if reportData && !isBulkExporting}
            <div class="flex justify-center origin-top transform scale-[0.6] sm:scale-[0.8] lg:scale-[0.9] xl:scale-100 transition-all duration-300 print:transform-none print:scale-100 print:block">
                <Report data={reportData} />
            </div>
        {:else if isGenerating || isBulkExporting}
            <div class="h-full flex flex-col items-center justify-center gap-12 animate-in fade-in duration-700">
                <div class="relative">
                    <div class="relative w-32 h-32">
                        <!-- Outer rotating ring -->
                        <div class="absolute inset-0 border-4 border-[#6d28d9]/10 rounded-full"></div>
                        <div class="absolute inset-0 border-4 border-t-[#6d28d9] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite]"></div>
                        
                        <!-- Middle counter-rotating ring -->
                        <div class="absolute inset-4 border-2 border-b-[#6d28d9]/40 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
                        
                        <!-- Inner pulsing shield/icon placeholder -->
                        <div class="absolute inset-8 bg-gradient-to-br from-[#6d28d9]/20 to-[#6d28d9]/5 rounded-xl rotate-45 animate-pulse flex items-center justify-center">
                            {#if isBulkExporting}
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#6d28d9] -rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#6d28d9] -rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                            {/if}
                        </div>
                    </div>
                    
                    <!-- Floating particles animation -->
                    <div class="absolute -top-4 -right-4 w-3 h-3 bg-[#6d28d9]/20 rounded-full animate-ping"></div>
                    <div class="absolute -bottom-2 -left-6 w-2 h-2 bg-[#6d28d9]/30 rounded-full animate-ping [animation-delay:0.5s]"></div>
                </div>

                <div class="text-center space-y-3 max-w-md">
                    <h2 class="text-2xl font-black text-gray-900 tracking-tight">
                        {isBulkExporting ? 'Generating Report Batch' : 'Generating Client Report'}
                    </h2>
                    <div class="flex flex-col items-center gap-2">
                        <p class="text-sm text-gray-500 font-medium leading-relaxed">
                            {isBulkExporting 
                                ? 'Processing multiple client reports and preparing your secure download package.' 
                                : 'Aggregating telemetry from across your security stack and generating high-fidelity analytics.'}
                        </p>
                    </div>
                </div>
                
            </div>
        {:else}
            <div class="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <p class="font-medium text-gray-400">Configure settings and generate a report to see the preview</p>
            </div>
        {/if}

        {#if isIncompatible}
            <IncompatibleDevice />
        {/if}
    </main>

    <!-- GitHub Link -->
    <a 
        href="https://github.com/DeathTrooperr/WirespeedReports"
        target="_blank" 
        rel="noopener noreferrer"
        class="fixed bottom-6 right-6 p-2 bg-[#24292e] rounded-full shadow-lg border border-white/10 hover:shadow-xl hover:scale-110 transition-all duration-300 z-50 print:hidden group"
        aria-label="View on GitHub"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white group-hover:text-white/80">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
            <path d="M9 18c-4.51 2-5-2-7-2"/>
        </svg>
    </a>

    <!-- Disclaimer Popup -->
    {#if showDisclaimer}
        <div 
            transition:fade={{ duration: 200 }}
            class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden"
        >
            <div 
                class="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300"
            >
                <div class="bg-[#6d28d9] p-6 text-white relative">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div class="relative z-10 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <h3 class="text-xl font-black uppercase tracking-tight">Open Source & Third-Party Disclaimer</h3>
                    </div>
                </div>
                
                <div class="p-8 space-y-4">
                    <p class="text-gray-600 leading-relaxed font-medium">
                        This project is <span class="text-[#6d28d9] font-bold">fully open source</span> and free to use. It is an independent community project and is <span class="font-bold text-gray-900">not affiliated with, endorsed by, or sponsored by <span class="text-[#6d28d9] font-bold">Wirespeed</span></span>.
                    </p>
                    <p class="text-gray-500 text-sm leading-relaxed">
                        Users connect the project to their own <span class="text-[#6d28d9] font-medium">Wirespeed</span> instances using their own API keys. This project does not provide, host, or resell any <span class="text-[#6d28d9] font-medium">Wirespeed</span> services.
                    </p>
                    <p class="text-gray-500 text-sm leading-relaxed">
                        All trademarks, product names, and logos are the property of their respective owners and are used for identification purposes only.
                    </p>
                    <p class="text-gray-500 text-sm leading-relaxed">
                        The complete source code is available at the GitHub link in the lower right corner. Self-hosting and deploying your own instance is encouraged for regular or production use.
                    </p>
                    
                    <div class="pt-4">
                        <button 
                            onclick={dismissDisclaimer}
                            class="w-full bg-[#6d28d9] text-white font-black py-4 rounded-xl hover:bg-[#6d28d9]/90 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }
    
    @media print {
        :global(body) {
            background: white !important;
            overflow: visible !important;
            height: auto !important;
        }
        aside {
            display: none !important;
        }
        main {
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
            height: auto !important;
        }
        .transform {
            transform: none !important;
            scale: none !important;
        }
    }
</style>
