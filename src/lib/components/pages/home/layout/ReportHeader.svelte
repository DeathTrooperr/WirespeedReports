<script lang="ts">
    import type { ReportData } from '$lib/scripts/types/report.types.js';

    let { reportPeriodLabel, branding }: { 
        reportPeriodLabel: string,
        branding?: ReportData['branding']
    } = $props();

    function formatLogo(logo: string | undefined) {
        if (!logo) return undefined;
        // Clean up any double data URI prefixes if they exist
        const cleanedLogo = logo.replace(/^data:image\/png;base64,data:image\/png;base64,/, 'data:image/png;base64,');
        if (cleanedLogo.startsWith('data:') || cleanedLogo.startsWith('http') || cleanedLogo.startsWith('/')) return cleanedLogo;
        // If it doesn't look like a URL or data URI, treat as raw base64
        return `data:image/png;base64,${cleanedLogo}`;
    }

    let activeLogo = $derived.by(() => {
        if (!branding) return '/wirespeed.avif';
        const logo = (branding.theme === 'dark' && branding.logoDark) ? branding.logoDark :
                     (branding.theme === 'light' && branding.logoLight) ? branding.logoLight :
                     branding.logo;
        
        return formatLogo(logo) || '/wirespeed.avif';
    });

    let isDefaultLogo = $state(false);

    $effect(() => {
        isDefaultLogo = !branding?.logo && !branding?.logoLight && !branding?.logoDark;
    });

    function handleLogoError(e: Event) {
        const target = e.target as HTMLImageElement;
        if (target.src !== window.location.origin + '/wirespeed.avif') {
            target.src = '/wirespeed.avif';
            isDefaultLogo = true;
        }
    }
</script>

<!-- Inline header change px-12 to px-[20mm] -->
<header class="bg-primary -mx-[20mm] -mt-[20mm] h-20 flex items-center px-12 relative overflow-hidden shrink-0">
    <div class="flex items-center gap-6 z-10 w-full">
        <div class="flex items-center justify-center h-10 w-[150px] shrink-0">
            <img 
                src={activeLogo} 
                alt={branding?.spName || 'Platform Logo'} 
                class="max-h-full max-w-full object-contain {isDefaultLogo ? 'brightness-0 invert' : ''}" 
                onerror={handleLogoError}
            />
        </div>
        <div class="h-10 w-px bg-white/10 shrink-0"></div>
        <div class="truncate">
            <p class="text-white/80 text-lg tracking-tight font-bold leading-none mb-1.5 truncate">{reportPeriodLabel}</p>
            <h1 class="text-white text-[9px] tracking-[0.5em] font-black uppercase leading-none truncate">
                Security Operations Report
            </h1>
        </div>
    </div>
    
    <!-- Decorative elements -->
    <div class="absolute right-0 top-0 w-64 h-full bg-white/5 -skew-x-12 translate-x-32"></div>
    <div class="absolute right-0 top-0 w-32 h-full bg-white/5 -skew-x-12 translate-x-16"></div>
</header>
