<script lang="ts">
    import type { ReportData, EscalatedCase } from '$lib/scripts/types/report.types.js';
    import TitlePage from './reportPages/01-TitlePage.svelte';
    import ExecutiveSummaryPage from './reportPages/02-ExecutiveSummaryPage.svelte';
    import DetectionAnalysisPage from './reportPages/03-DetectionAnalysisPage.svelte';
    import ResponseActivityPage from './reportPages/04-ResponseActivityPage.svelte';
    import AssetIntelligencePage from './reportPages/05-AssetIntelligencePage.svelte';
    import DataIngestionPage from './reportPages/06-DataIngestionPage.svelte';

    let { data }: { data: ReportData } = $props();

    function calculateRowHeight(item: EscalatedCase): number {
        const basePadding = 24; // py-3 (12px) * 2
        
        // Incident Column: Title (11px, leading-tight ~14px) + Date (8px)
        const titleCharsPerLine = 22;
        const titleLines = Math.ceil(item.title.length / titleCharsPerLine) || 1;
        const incidentHeight = (titleLines * 14) + 16; // Title + Date + gaps

        // Summary Column: Text (10px, leading-relaxed ~16px)
        // Note: matching the truncation in ResponseActivityPage
        const summaryLimit = 300; 
        const summaryText = item.response.length > summaryLimit ? item.response.slice(0, summaryLimit) + '...' : item.response;
        const summaryCharsPerLine = 55;
        const summaryLines = Math.ceil(summaryText.length / summaryCharsPerLine) || 1;
        let summaryHeight = (summaryLines * 16);
        if (item.response.length > summaryLimit) summaryHeight += 20; // Details link + gap

        return basePadding + Math.max(incidentHeight, summaryHeight, 32);
    }

    let caseChunks = $derived((() => {
        const chunks: EscalatedCase[][] = [];
        const cases = data.escalatedCases;
        if (cases.length === 0) return [[]];
        
        const PAGE_HEIGHT = 800; // Available height in pixels
        const VERDICT_ACCURACY_HEIGHT = 320;
        const TABLE_HEADER_HEIGHT = 60;
        const QA_NOTE_HEIGHT = 100;

        let currentPage: EscalatedCase[] = [];
        let currentHeight = 0;
        let isFirstPage = true;

        for (let i = 0; i < cases.length; i++) {
            const item = cases[i];
            const rowHeight = calculateRowHeight(item);
            
            let availableHeight = PAGE_HEIGHT - TABLE_HEADER_HEIGHT;
            if (isFirstPage) {
                availableHeight -= VERDICT_ACCURACY_HEIGHT;
            }

            // If it's the last item, we need to ensure the QA note fits
            const isLastItem = i === cases.length - 1;
            const extraHeightNeeded = isLastItem ? QA_NOTE_HEIGHT : 0;

            if (currentPage.length > 0 && (currentHeight + rowHeight + extraHeightNeeded > availableHeight)) {
                chunks.push(currentPage);
                currentPage = [item];
                currentHeight = rowHeight;
                isFirstPage = false;
            } else {
                currentPage.push(item);
                currentHeight += rowHeight;
            }
        }

        if (currentPage.length > 0) {
            chunks.push(currentPage);
        }
        
        return chunks;
    })());

    let totalCasePages = $derived(caseChunks.length);
    let totalPages = $derived(5 + totalCasePages);

    function hexToHsl(hex: string): string {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(s => s + s).join('');
        
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
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
    }

    function getContrastColor(hex: string): string {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(s => s + s).join('');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '224 71.4% 4.1%' : '210 20% 98%'; // foreground vs primary-foreground roughly
    }

    let customStyles = $derived.by(() => {
        let styles = '';
        if (data.branding?.colors) {
            const { primary } = data.branding.colors;
            if (primary) {
                try {
                    const hsl = hexToHsl(primary);
                    const contrast = getContrastColor(primary);
                    // Update the raw variables that Tailwind uses via hsl()
                    styles += `--primary: ${hsl}; --ring: ${hsl}; --chart-1: ${hsl}; --primary-foreground: ${contrast};`;
                } catch (e) {
                    console.error('Invalid primary color:', primary);
                }
            }
        }
        return styles;
    });

    // Directly apply styles to root when they change to ensure global CSS vars are updated
    $effect(() => {
        if (data.branding?.colors) {
            const { primary } = data.branding.colors;
            if (primary) {
                try {
                    const hsl = hexToHsl(primary);
                    const contrast = getContrastColor(primary);
                    document.documentElement.style.setProperty('--primary', hsl);
                    document.documentElement.style.setProperty('--ring', hsl);
                    document.documentElement.style.setProperty('--chart-1', hsl);
                    document.documentElement.style.setProperty('--primary-foreground', contrast);
                } catch (e) {}
            }
        }
    });
</script>

<div class="py-10 print:p-0 print:bg-white" style={customStyles}>
    <TitlePage {data} {totalPages} />
    
    <ExecutiveSummaryPage {data} {totalPages} />
    
    <DetectionAnalysisPage {data} {totalPages} />
    
    {#each caseChunks as chunk, i}
        <ResponseActivityPage 
            {data} 
            {chunk} 
            index={i} 
            {totalCasePages} 
            {totalPages}
        />
    {/each}

    <AssetIntelligencePage {data} pageNumber={4 + totalCasePages} {totalPages} />

    <DataIngestionPage {data} pageNumber={5 + totalCasePages} {totalPages} />
</div>
