<script lang="ts">
    import { untrack } from 'svelte';
    import { fade, slide } from 'svelte/transition';
    import Report from '$lib/components/pages/home/Report.svelte';
    import type { ReportData } from '$lib/scripts/types/report.types.js';
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

        // 3. Handle Automatic Team Fetching
        const currentKey = apiKey;
        if (currentKey && currentKey.length >= 32 && currentKey !== lastFetchedKey) {
            const timer = setTimeout(() => {
                untrack(() => fetchTeams());
            }, 500);
            return () => clearTimeout(timer);
        }
    });

    let apiKey = $state('');
    let selectedTeamId = $state('');
    let selectedTeamIds = $state<string[]>([]);
    let teams = $state<Team[]>([]);
    let isFetchingTeams = $state(false);
    let theme = $state<'light' | 'dark'>('light');

    let primaryColor = $state('#6d28d9'); // Default primary

    let periodType = $state<'monthly' | 'quarterly' | 'yearly' | 'all-time' | 'custom'>('monthly');
    let selectedMonth = $state(new Date().toISOString().slice(0, 7));
    let selectedYear = $state(new Date().getFullYear());
    let selectedQuarter = $state(Math.floor(new Date().getMonth() / 3) + 1);
    let customStart = $state('');
    let customEnd = $state('');
    let errorMessage = $state('');

    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentYear = new Date().getFullYear();
    const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;

    const dateRange = $derived.by(() => {
        let start = '';
        let end = '';
        
        switch (periodType) {
            case 'monthly':
                if (selectedMonth) {
                    const [y, m] = selectedMonth.split('-').map(Number);
                    start = `${selectedMonth}-01`;
                    end = new Date(y, m, 0).toISOString().slice(0, 10);
                }
                break;
            case 'quarterly':
                const qStartMonth = (selectedQuarter - 1) * 3;
                start = new Date(selectedYear, qStartMonth, 1).toISOString().slice(0, 10);
                end = new Date(selectedYear, qStartMonth + 3, 0).toISOString().slice(0, 10);
                break;
            case 'yearly':
                start = `${selectedYear}-01-01`;
                end = `${selectedYear}-12-31`;
                break;
            case 'all-time':
                start = '2020-01-01'; 
                end = new Date().toISOString().slice(0, 10);
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
            case 'all-time':
                return 'All Time';
            case 'custom':
                if (customStart && customEnd) return `${customStart} to ${customEnd}`;
                break;
        }
        return '';
    });

    let reportData: ReportData | null = $state(null);
    let isGenerating = $state(false);

    let lastFetchedKey = '';
    async function fetchTeams() {
        if (!apiKey || apiKey === lastFetchedKey) return;
        isFetchingTeams = true;
        errorMessage = '';
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
                const errorData = (await response.json()) as { error?: string };
                errorMessage = errorData.error || 'Unable to fetch account details. Please verify your API key and try again.';
                mode = 'individual';
            }
        } catch (e) {
            errorMessage = 'A network error occurred while fetching account details. Please check your connection.';
            mode = 'individual';
        } finally {
            isFetchingTeams = false;
        }
    }

    async function generateReport(targetTeamId?: string) {
        const teamIdToUse = targetTeamId || (mode === 'service-provider' ? selectedTeamId : undefined);

        if (!apiKey) {
            errorMessage = 'Please enter an API Key to generate the report.';
            return;
        }

        if (mode === 'service-provider' && !teamIdToUse) {
            errorMessage = 'Please select a client to generate the report for.';
            return;
        }

        if (!targetTeamId) isGenerating = true;
        errorMessage = '';
        
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
                const errorData = (await response.json()) as { error?: string };
                errorMessage = errorData.error || 'The report could not be generated. This may be due to missing data for the selected period.';
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
            errorMessage = 'An unexpected error occurred while generating the report. Please try again later.';
        } finally {
            if (!targetTeamId) isGenerating = false;
        }
    }

    let isBulkExporting = $state(false);
    async function bulkExport() {
        if (selectedTeamIds.length === 0) {
            errorMessage = 'Please select at least one client for bulk export.';
            return;
        }

        isBulkExporting = true;
        errorMessage = '';

        try {
            const response = await fetch('/api/generate/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey,
                    teamIds: selectedTeamIds,
                    customColors: { primary: primaryColor },
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
                const errorData = (await response.json()) as { error?: string };
                errorMessage = errorData.error || 'Failed to generate bulk reports.';
            }
        } catch (e) {
            console.error('Bulk export error:', e);
            errorMessage = 'An unexpected error occurred during bulk export.';
        } finally {
            isBulkExporting = false;
        }
    }

    function printReport() {
        window.print();
    }
</script>

<div class="flex h-screen bg-gray-50 overflow-hidden print:h-auto print:overflow-visible print:block">
    <!-- Sidebar -->
    <aside class="w-80 bg-[#6d28d9] text-white flex flex-col shadow-xl z-10 print:hidden">
        <div class="p-6 border-b border-white/10">
            <h1 class="text-xl font-black tracking-tight uppercase">Report Generator</h1>
            <p class="text-xs text-white/60 mt-1">Configure your security report</p>
        </div>

        <div class="flex-grow p-6 space-y-6 overflow-y-auto">
            <!-- Global Config: API Key & Mode -->
            <div class="space-y-4">
                <div class="space-y-2">
                    <label for="apiKey" class="text-[10px] font-black uppercase tracking-widest text-white/50">API Key</label>
                    <div class="flex gap-2">
                        <input 
                            type="password" 
                            id="apiKey"
                            bind:value={apiKey}
                            placeholder="Paste your Wirespeed API Key"
                            class="flex-grow bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/40 transition-colors text-white"
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <p class="text-[10px] font-black uppercase tracking-widest text-white/50">Account Mode</p>
                    <div class="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 overflow-hidden relative min-h-[40px]">
                        {#key mode}
                            <div in:fade={{ duration: 300 }} class="absolute inset-x-4 flex items-center">
                                <span class="text-[10px] font-black uppercase tracking-wider text-white">
                                    {mode === 'service-provider' ? 'Service Provider' : 'Individual'}
                                </span>
                            </div>
                        {/key}
                    </div>
                </div>

                {#if mode === 'service-provider'}
                    <div transition:slide={{ duration: 300 }} class="grid grid-cols-2 gap-3 pt-2">
                        <div class="space-y-2">
                            <label for="themeSelect" class="text-[10px] font-black uppercase tracking-widest text-white/50">Logo Theme</label>
                            <div class="flex p-1 bg-white/5 rounded-lg border border-white/10 h-[40px] items-center">
                                <button 
                                    onclick={() => theme = 'light'}
                                    class="flex-1 h-full py-1 text-[9px] font-black uppercase tracking-wider rounded transition-all {theme === 'light' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}"
                                >
                                    Light
                                </button>
                                <button 
                                    onclick={() => theme = 'dark'}
                                    class="flex-1 h-full py-1 text-[9px] font-black uppercase tracking-wider rounded transition-all {theme === 'dark' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}"
                                >
                                    Dark
                                </button>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label for="primaryColor" class="text-[10px] font-black uppercase tracking-widest text-white/50">Color</label>
                            <div class="flex items-center h-[40px] px-3 bg-white/5 rounded-lg border border-white/10">
                                <div class="flex items-center gap-2 w-full">
                                    <input 
                                        type="color" 
                                        id="primaryColor"
                                        bind:value={primaryColor}
                                        class="w-6 h-6 rounded border-none bg-transparent cursor-pointer p-0"
                                    />
                                    <span class="text-[10px] font-mono text-white/40 uppercase truncate flex-grow">{primaryColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}

                <div class="space-y-4 pt-2">
                    <p class="text-[10px] font-black uppercase tracking-widest text-white/50">Reporting Period</p>
                    
                    <div class="space-y-2">
                        <label for="periodType" class="text-xs text-white/70">Type</label>
                        <select 
                            id="periodType"
                            bind:value={periodType}
                            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/40 transition-colors text-white [color-scheme:dark] *:bg-[#6d28d9]"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                            <option value="all-time">All Time</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {#if periodType === 'monthly'}
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
                            class="w-full bg-[#f3f4f6] text-[#6d28d9] font-bold py-3 rounded-lg hover:bg-[#f3f4f6]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {#if isGenerating}
                                <div class="flex items-center gap-1.5">
                                    <div class="w-1.5 h-1.5 bg-[#6d28d9] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div class="w-1.5 h-1.5 bg-[#6d28d9] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div class="w-1.5 h-1.5 bg-[#6d28d9] rounded-full animate-bounce"></div>
                                </div>
                                <span class="text-sm">Preparing Report...</span>
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                Generate Report
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
                                            class="rounded border-white/20 bg-transparent text-accent focus:ring-accent"
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
                            class="w-full bg-accent text-primary font-bold py-3 rounded-lg hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {#if isBulkExporting}
                                <div class="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                Exporting...
                            {:else}
                                Bulk Export
                            {/if}
                        </button>
                    </div>
                {/if}
            </div>
        </div>

        <div class="p-6 border-t border-white/10 bg-black/20">
            <button 
                onclick={printReport}
                class="w-full border border-white/20 hover:bg-white/5 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Print / Download
            </button>
        </div>
    </aside>

    <!-- Preview Area -->
    <main class="flex-1 overflow-y-auto bg-gray-100 p-8 print:p-0 print:bg-white print:block print:h-auto print:overflow-visible">
        {#if errorMessage}
            <div class="max-w-5xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <p class="text-sm font-medium">{errorMessage}</p>
                <button onclick={() => errorMessage = ''} class="ml-auto hover:text-red-900 transition-colors" aria-label="Dismiss error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        {/if}

        {#if reportData && !isBulkExporting}
            <div class="flex justify-center origin-top transform scale-[0.7] sm:scale-[0.85] xl:scale-100 transition-transform print:transform-none print:scale-100 print:block">
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
                        {isBulkExporting ? 'Generating Batch' : 'Compiling Intelligence'}
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
    </main>
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
