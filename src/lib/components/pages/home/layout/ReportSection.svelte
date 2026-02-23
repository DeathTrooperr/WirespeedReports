<script lang="ts">
    import type { Snippet } from 'svelte';

    let { 
        title, 
        children, 
        isMain = false, 
        mt = "mt-8",
        mb = "mb-6",
        flexGrow = false
    }: { 
        title?: string, 
        children: Snippet, 
        isMain?: boolean, 
        mt?: string,
        mb?: string,
        flexGrow?: boolean
    } = $props();
</script>

<section class="{mt} {flexGrow ? 'flex-grow flex flex-col' : ''}">
    {#if isMain && title}
        <div class="flex flex-col gap-1 {mb}">
            <h2 class="text-primary text-2xl font-black tracking-tighter uppercase">{title}</h2>
            <div class="h-1 w-20 bg-primary/20 rounded-full"></div>
        </div>
    {:else if title}
        <h3 class="text-foreground/40 text-[10px] font-black {mb} uppercase tracking-[0.3em] flex items-center gap-3">
            <span class="w-8 h-px bg-primary/30"></span>
            {title}
        </h3>
    {/if}
    {@render children()}
</section>
