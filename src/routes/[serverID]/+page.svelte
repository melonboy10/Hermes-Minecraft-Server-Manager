<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { env as publicENV } from '$env/dynamic/public';
  import { stateDisplay } from '$lib';
  import { ServerState } from '$lib/database/types';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { PageData } from './$types';
  import FormLoadingButton from './FormLoadingButton.svelte';

  export let data: PageData;
  let cacheLogs = data.logs;
  let cacheStats = data.stats;
  // export let form: ActionData;

  $: serverStatus = stateDisplay(data.server.state);
  let commandMessage = '';

  let updateButtonLoading = false;
  async function updateStatsAndLogs() {
    updateButtonLoading = true;
    // TODO: This is probably a bad way to do this
    await invalidateAll();

    await data.stats;
    cacheStats = data.stats;
    await data.logs;
    cacheLogs = data.logs;
    updateButtonLoading = false;
  }
  onMount(() => {
    const intervalTime = server.state == ServerState.Running ? 1000 * 10 /* 10s */ : 1000 * 60; /* 1m */
    const interval = setInterval(updateStatsAndLogs, intervalTime);
    return () => clearInterval(interval);
  });
</script>

<div class="flex w-full max-w-3xl flex-col gap-4">
  <!-- Server Information -->
  <div class="grid grid-cols-[1fr_auto] items-center gap-4 max-sm:grid-cols-1">
    <div>
      <h1 class="text-2xl font-bold">
        {data.server.title}
        <span class="text-sm text-gray-400">{data.server.id}</span>
      </h1>
      <p>{data.server.gameVersion} {data.server.serverSoftware} {data.server.worldType} world</p>
      <button class="group flex items-center gap-2 font-bold active:scale-95 active:text-gray-300" on:click={() => navigator.clipboard.writeText(`${data.server.subdomain}.${publicENV.PUBLIC_ROOT_DOMAIN}`)}>
        {data.server.subdomain}.{publicENV.PUBLIC_ROOT_DOMAIN}
        <svg xmlns="http://www.w3.org/2000/svg" class="hidden h-5 w-5 fill-white group-hover:inline" viewBox="0 -960 960 960"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" /></svg>
      </button>
    </div>
    <div class="flex gap-2 max-sm:justify-end">
      <div class="flex items-center gap-2">
        <div class={`h-3 w-3 rounded-full ${serverStatus.indicatorColor}`}></div>
        <h2 class="text-lg">{serverStatus.message}</h2>
      </div>
      <FormLoadingButton action="?/start" disabled={data.server.state == ServerState.Running || data.server.state == ServerState.Paused} text="Start" />
      <FormLoadingButton action="?/stop" disabled={data.server.state == ServerState.Stopped} text="Stop" />
    </div>
  </div>

  <div class="flex items-center gap-4">
    {#await cacheStats}
      <div class="flex h-6 w-full animate-pulse items-center gap-2 rounded-md bg-gray-600" />
      <div class="flex h-6 w-full animate-pulse items-center gap-2 rounded-md bg-gray-600" />
    {:then stats}
      {#if stats.error}
        <div class="flex w-full items-center gap-2">
          <p class="text-red-500">Error: {stats.error.message}</p>
        </div>
      {:else}
        <div class="flex w-full items-center gap-2">
          CPU:
          {stats.value.CPUPerc}
          <!-- <meter class="w-1/2" max="100" value="54"></meter> -->
        </div>
        <!-- <div class="flex w-full items-center gap-2">
        RAM:
        {stats.MemPerc}
        <!-- <meter class="w-1/2" max="2" value=".54"></meter> --
        </div> -->
        <div class="flex w-full items-center gap-2">
          RAM:
          {stats.value.MemUsage.split('/')[0]}
          <!-- <meter class="w-1/2" max="2" value=".54"></meter> -->
        </div>
      {/if}
    {/await}

    <!-- Logs -->
    <div class="flex items-center justify-between">
      <button class="flex items-center rounded-md bg-gray-800 px-4 py-2 disabled:bg-gray-900" disabled={updateButtonLoading} on:click={updateStatsAndLogs}>
        {#if updateButtonLoading}
          <svg class="-ml-1 mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        {/if}
        Update
      </button>
    </div>
  </div>

  <!-- Command Input -->

  <FormLoadingButton
    class="grid grid-cols-[1fr_auto] gap-2"
    action="?/command"
    disabled={data.server.state == ServerState.Stopped}
    text="Send"
    callback={({ result }) => {
      if (result.type == 'success' && result.data && result.data.action == 'command') commandMessage = result.data.value[0] ?? '';
    }}>
    <input type="text" name="command" placeholder="Enter MC Command Here" class="w-full rounded-md bg-gray-800 px-4 py-2" />
  </FormLoadingButton>
  {commandMessage}
</div>
<div class="scroll-transparent flex h-[65vh] w-full max-w-6xl resize-y flex-col-reverse overflow-x-scroll whitespace-nowrap rounded-md bg-gray-800 p-4 font-mono text-sm [overflow-anchor:auto] max-sm:text-[.70rem]">
  {#await cacheLogs}
    <div class="h-full w-full animate-pulse rounded-md bg-gray-600" />
  {:then logs}
    {#if logs.error}
      <div class="flex w-full items-center gap-2">
        <pre class="text-red-500">Error: {logs.error.message}</pre>
      </div>
    {:else if logs.value.length > 0}
      {#each logs.value.reverse() as log, i (i)}
        <div>
          <span in:fade|global={{ delay: i * 15, duration: 100 }} class="text-cyan-500 max-sm:hidden">{log.split('|')[0]} |</span>
          <span in:fade|global={{ delay: i * 15, duration: 100 }} class="text-gray-400">{log.split('|')[1]}</span>
        </div>
      {/each}
      {#if logs.value.length == 0}
        <p class="w-full text-center">No logs available</p>
      {/if}
    {:else}
      <p class="w-full text-center">No logs available</p>
    {/if}
  {/await}
</div>
