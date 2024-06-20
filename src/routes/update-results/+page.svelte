<script lang="ts">
  import { getFileURL, stateDisplay, timeUntil } from '$lib';
  import type { PageServerData } from './$types';

  export let data: PageServerData;
  $: updates = data.update;
</script>

<div class="scroll-transparent flex w-full gap-4 overflow-x-auto overflow-y-hidden pb-8">
  {#each updates as serverResult}
    {@const server = serverResult.server}
    {@const resultPromise = serverResult.updates}
    {@const display = stateDisplay(server.state)}
    <div class="my-2 flex w-[90vw] max-w-2xl flex-shrink-0 flex-col rounded-md bg-gray-800">
      <div class="flex gap-4 p-4">
        <img class="pixelated aspect-square h-24 rounded-sm max-sm:h-16" src={getFileURL(server.collectionId, server.id, server.icon)} alt="Server Icon" />
        <div class="w-full">
          <h2 class="text-xl font-bold">
            {server.title}
            <span class="px-2 text-sm font-thin text-gray-400">{server.id}</span>
          </h2>
          <p class="">{server.gameVersion} {server.serverSoftware} {server.worldType} world</p>
          <div class="mt-2 flex items-center gap-2">
            <div class={`h-3 w-3 rounded-full ${display.indicatorColor}`}></div>
            <p class="text-sm font-medium">{display.message}</p>
            <div class="text-sm font-thin text-gray-400">{server.serverFilesMissing ? 'um.. the server files are missing' : ''}</div>
          </div>
          <div class="flex w-full flex-col-reverse">
            {#await resultPromise}
              Loading...
            {:then result}
              {#each result as record (record)}
                {#if record.hasError}
                  <div class="border-b border-gray-600 p-2 first:border-b-0">
                    <details>
                      <summary class="cursor-pointer text-red-200">
                        <span class="float-right text-sm text-gray-500" title={record.variables.time}>{timeUntil(record.variables.time)} </span>
                        {record.error?.message}
                      </summary>
                      <table>
                        {#each Object.entries(record.variables) as variable}
                          <tr>
                            <td class="pr-6">{variable[0]}</td>
                            <td>{variable[1]}</td>
                          </tr>
                        {/each}
                      </table>
                      <details>
                        <summary class="cursor-pointer text-red-200"> Show Error </summary>
                        <pre>
                          {JSON.stringify(record.error?.error, null, 2).replace(/\\n/g, '\n')}
                        </pre>
                      </details>
                    </details>
                  </div>
                {:else}
                  <div class="border-b border-gray-600 p-2 first:border-b-0">
                    <details>
                      <summary class="cursor-pointer text-blue-200">
                        <span class="float-right text-sm text-gray-500" title={record.variables.time}>{timeUntil(record.variables.time)} </span>
                        {record.value}
                      </summary>
                      <table>
                        {#each Object.entries(record.variables) as variable}
                          <tr>
                            <td class="pr-6">{variable[0]}</td>
                            <td>{variable[1]}</td>
                          </tr>
                        {/each}
                      </table>
                    </details>
                  </div>
                {/if}
              {/each}
            {/await}
          </div>
        </div>
      </div>
    </div>
  {/each}
  {#if updates.length === 0}
    <p class="p-8 text-center">No servers or no updates run yet</p>
  {/if}
</div>
