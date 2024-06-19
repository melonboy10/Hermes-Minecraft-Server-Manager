<script lang="ts">
  import { env as publicENV } from '$env/dynamic/public';
  import { getFileURL, stateDisplay, timeUntil } from '$lib';
  import { ServerState, TimeToLiveMiliseconds } from '$lib/database/types';

  import type { PageServerData } from './$types';
  import FormLoadingButton from './[serverID]/FormLoadingButton.svelte';

  export let data: PageServerData;
  let indexOfFirstStartedOrPaused = data.servers.findIndex((s) => s.state == ServerState.Running || s.state == ServerState.Paused);
  let indexOfFirstStopped = data.servers.findIndex((s) => s.state == ServerState.Stopped);
</script>

{#each data.servers as server, i}
  {#if indexOfFirstStartedOrPaused == i || indexOfFirstStopped == i}
    <div class="flex w-full items-center">
      <div class="h-px w-full bg-gray-800" />
      <div class="mx-4 whitespace-nowrap text-sm font-thin">{indexOfFirstStopped == i ? 'Past Servers' : 'Servers'}</div>
      <div class="h-px w-full bg-gray-800" />
    </div>
  {/if}
  {@const display = stateDisplay(server.state)}
  <a class="my-2 flex w-full max-w-2xl flex-col rounded-md bg-gray-800" href={`/${server.id}`} data-sveltekit-preload-data="false">
    {#if server.state == ServerState.Stopped && server.canBeDeleted && server.deletionDate}
      <FormLoadingButton action={`/${server.id}/?/start`} text="Revive" class="flex w-full items-center justify-between rounded-t-sm bg-red-800 p-1 px-4" buttonClass="bg-green-600 disabled:bg-green-800 disabled:cursor-not-allowed">
        Deleting {server.deletionDate ? timeUntil(server.deletionDate) : '...'}
      </FormLoadingButton>
    {:else if server.state == ServerState.Paused}
      <div class="flex w-full items-center justify-between rounded-t-sm bg-green-700 p-1 px-4">
        Stopping {server.startDate && server.timeToLive ? timeUntil(Date.parse(server.startDate) + TimeToLiveMiliseconds[server.timeToLive]) : '...'}
      </div>
    {/if}
    <div class="flex gap-4 p-4">
      <img class="pixelated aspect-square h-24 rounded-sm max-sm:h-16" src={getFileURL(server.collectionId, server.id, server.icon)} alt="Server Icon" />
      <div>
        <h2 class="text-xl font-bold">
          {server.title}
          <span class="px-2 text-sm font-thin text-gray-400">{server.id}</span>
        </h2>
        <p class="">{server.gameVersion} {server.serverSoftware} {server.worldType} world</p>
        <button class="group flex items-center gap-2 font-bold active:scale-95 active:text-gray-300" on:click|preventDefault={() => navigator.clipboard.writeText(`${server.subdomain}.${publicENV.PUBLIC_ROOT_DOMAIN}`)}>
          {server.subdomain}.{publicENV.PUBLIC_ROOT_DOMAIN}
          <svg xmlns="http://www.w3.org/2000/svg" class="hidden h-5 w-5 fill-white group-hover:inline" viewBox="0 -960 960 960"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" /></svg>
        </button>
        <div class="mt-2 flex items-center gap-2">
          <div class={`h-3 w-3 rounded-full ${display.indicatorColor}`}></div>
          <p class="text-sm font-medium">{display.message}</p>
          <div class="text-sm font-thin text-gray-400">{server.serverFilesMissing ? 'um.. the server files are missing' : ''}</div>
        </div>
      </div>
    </div>
  </a>
{/each}
{#if data.servers.length === 0}
  <p class="text-center">No servers available</p>
{/if}
