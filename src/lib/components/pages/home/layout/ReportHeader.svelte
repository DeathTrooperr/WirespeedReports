<script lang="ts">
    import type { ReportData } from '$lib/scripts/types/report.types.js';

    let { reportPeriodLabel, branding }: { 
        reportPeriodLabel: string,
        branding?: ReportData['branding']
    } = $props();

    function formatLogo(logo: string | undefined) {
        if (!logo) return undefined;
        if (logo.startsWith('data:') || logo.startsWith('http') || logo.startsWith('/')) return logo;
        // If it doesn't look like a URL or data URI, treat as raw base64
        return `data:image/png;base64,${logo}`;
    }

    let activeLogo = $derived.by(() => {
        if (!branding) return '/wirespeed.avif';
        const logo = (branding.theme === 'dark' && branding.logoDark) ? branding.logoDark :
                     (branding.theme === 'light' && branding.logoLight) ? branding.logoLight :
                     branding.logo;
        
        return formatLogo(logo) || '/wirespeed.avif';
    });

    let isDefaultLogo = $derived(!branding?.logo && !branding?.logoLight && !branding?.logoDark);
</script>

<!-- Inline header change px-12 to px-[20mm] -->
<header class="bg-primary -mx-[20mm] -mt-[20mm] h-20 flex items-center px-12 relative overflow-hidden">
    <div class="flex items-center gap-6 z-10">
        <img src={activeLogo} alt={branding?.spName || 'Platform Logo'} class="h-10 max-w-[150px] object-contain {isDefaultLogo ? 'brightness-0 invert' : ''}" />
        <div class="h-10 w-px bg-white/10"></div>
        <div>
            <p class="text-white/80 text-lg tracking-tight font-bold leading-none mb-1.5">{reportPeriodLabel}</p>
            <h1 class="text-white text-[9px] tracking-[0.5em] font-black uppercase leading-none">
                Security Operations Report
            </h1>
        </div>
    </div>
    
    <!-- Decorative elements -->
    <div class="absolute right-0 top-0 w-64 h-full bg-white/5 -skew-x-12 translate-x-32"></div>
    <div class="absolute right-0 top-0 w-32 h-full bg-white/5 -skew-x-12 translate-x-16"></div>
</header>
