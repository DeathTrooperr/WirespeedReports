<script lang="ts">
    import type { ReportData } from '$lib/scripts/types/report.types.js';
    import ReportPage from '../layout/ReportPage.svelte';
    import ReportSection from '../layout/ReportSection.svelte';

    let { data, chunk, index, totalPages }: {
        data: ReportData, 
        chunk: any[],
        index: number,
        totalPages: number 
    } = $props();
    
    // Use pre-mapped data from server
    const mappedStats = $derived(data.mappedDetectionStats || []);
    const categories = $derived(mappedStats.map(s => s.category));
    
    // Calculate display values with a non-linear scale or a boosted minimum 
    // to make the graph look better when percentages are small
    const values = $derived(mappedStats.map(s => s.percentage));
    
    const size = 300;
    const center = size / 2;
    const radius = size * 0.4;
    const angleStep = $derived((Math.PI * 2) / categories.length);

    // We'll use a Square Root scale for the visual graph to boost smaller values 
    // while keeping 100% at the edge. This makes "detection coverage" look more balanced.
    function getDisplayValue(actualPercentage: number) {
        if (actualPercentage === 0) return 0;
        // sqrt(p/100) * 100 gives a nice curve: 1% -> 10%, 25% -> 50%, 100% -> 100%
        return Math.sqrt(actualPercentage / 100) * 100;
    }

    function getPoint(index: number, value: number, isGrid = false) {
        const angle = index * angleStep - Math.PI / 2;
        const displayValue = isGrid ? value : getDisplayValue(value);
        const x = center + radius * (displayValue / 100) * Math.cos(angle);
        const y = center + radius * (displayValue / 100) * Math.sin(angle);
        return { x, y };
    }

    const points = $derived(values.map((v, i) => getPoint(i, v)));
    const polygonPath = $derived(points.map(p => `${p.x},${p.y}`).join(' '));

    const gridLevels = [25, 50, 75, 100];
</script>

<ReportPage 
    pageNumber={4 + index} 
    {totalPages}
    reportPeriodLabel={data.reportPeriodLabel}
    branding={data.branding}
>
    {#if index === 0}
    <ReportSection title="Detections Breakdown" isMain={true}>
        <div class="flex items-start justify-between gap-12 py-4">
            <div class="relative w-full aspect-square max-w-[380px] flex items-center justify-center -ml-4">
                <svg viewBox="0 0 300 300" class="w-full h-full overflow-visible">
                    <g>
                        <!-- Grid lines -->
                        {#each gridLevels as level}
                            <polygon 
                                points={categories.map((_, i) => {
                                    const p = getPoint(i, level, true);
                                    return `${p.x},${p.y}`;
                                }).join(' ')}
                                fill="none"
                                stroke="rgba(0,0,0,0.05)"
                                stroke-width="1"
                            />
                        {/each}

                        <!-- Axis lines -->
                        {#each categories as _, i}
                            {@const p = getPoint(i, 100, true)}
                            <line 
                                x1={center} y1={center} 
                                x2={p.x} y2={p.y} 
                                stroke="rgba(0,0,0,0.05)" 
                                stroke-width="1" 
                            />
                        {/each}

                        <!-- Data polygon -->
                        <polygon 
                            points={polygonPath}
                            fill="currentColor"
                            stroke="currentColor"
                            stroke-width="3"
                            class="text-primary/20 fill-current stroke-primary transition-all duration-500"
                        />

                        <!-- Data points -->
                        {#each points as p}
                            <circle cx={p.x} cy={p.y} r="3" class="fill-primary" />
                        {/each}

                        <!-- Labels -->
                        {#each categories as category, i}
                            {@const p = getPoint(i, 115, true)}
                            <text 
                                x={p.x} 
                                y={p.y} 
                                text-anchor="middle" 
                                alignment-baseline="middle"
                                class="text-[9px] font-bold uppercase tracking-wider fill-foreground/60"
                            >
                                {category}
                            </text>
                        {/each}
                    </g>
                </svg>
            </div>

            <div class="flex-grow max-w-[280px] space-y-2">
                {#each mappedStats as stat}
                    <div class="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div class="absolute top-0 left-0 w-1 h-full bg-primary/20 transition-all group-hover:bg-primary"></div>
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="text-[7px] uppercase font-black text-foreground/40 tracking-widest">{stat.category}</p>
                                <p class="text-lg font-black text-primary tracking-tighter leading-none">
                                    {stat.percentage?.toFixed(1) || 0}%
                                </p>
                            </div>
                            <div class="text-right">
                                <p class="text-[8px] text-foreground/50 font-medium">
                                    {stat.count?.toLocaleString() || 0} <span class="text-[7px] uppercase font-bold opacity-70">Detections</span>
                                </p>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </ReportSection>
    {/if}

    <ReportSection 
        title={index === 0 ? "Detection Coverage" : "Detection Coverage (Continued)"} 
        isMain={index > 0}
        mt={index === 0 ? "mt-2" : "mt-8"}
    >
        <div class="grid grid-cols-2 gap-x-12 gap-y-4 py-4">
            {#each chunk as integ, i}
                <div class="flex items-center justify-between {i < chunk.length - 2 ? 'border-b border-gray-50 pb-2' : ''}">
                    <div class="flex items-center gap-3">
<!--                        <div class="w-8 h-8 rounded-lg flex items-center justify-center {integ.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}">-->
<!--                            {#if integ.enabled}-->
<!--                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">-->
<!--                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />-->
<!--                                </svg>-->
<!--                            {:else}-->
<!--                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">-->
<!--                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />-->
<!--                                </svg>-->
<!--                            {/if}-->
<!--                        </div>-->
                        <div class="flex items-center gap-2">
                            {#if integ.logo}
                                <img src={`https://app.wirespeed.co${integ.logo}`} alt={integ.name} class="w-4 h-4 rounded-sm" />
                            {/if}
                            <div>
                                <p class="text-xs font-bold text-foreground">{integ.name}</p>
                                <p class="text-[9px] text-foreground/40 uppercase font-black tracking-widest">{integ.types.join(' • ')}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        {#if integ.enabled}
                            <span class="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100/50">Active</span>
                        {:else}
                            <span class="text-[8px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">Inactive</span>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </ReportSection>
</ReportPage>

