<script lang="ts">
  import { enhance } from '$app/forms';
  import { env as publicENV } from '$env/dynamic/public';
  import { ServerSoftware, ServerSoftwareOptions, TimeToLive, WorldType } from '$lib/database/types';
  import type { ServerCreationSchema } from '$lib/servers/schema';
  import { type SafeParseError, type typeToFlattenedError } from 'zod';
  import type { ActionData } from './$types';
  import MinecraftRawEditor from './MinecraftRawEditor.svelte';
  import PlayerList from './PlayerList.svelte';
  import DraggableList from './SuperflatLayersList.svelte';

  type ExtractErrorType<T> = T extends SafeParseError<infer V> ? V : never;
  type ErrorsObject = typeToFlattenedError<ExtractErrorType<ReturnType<typeof ServerCreationSchema.safeParse>>>['fieldErrors'];

  export let form: ActionData;
  let errors: ErrorsObject = {
    //// resourcepackURL: ['true'],
    //// datapackURL: ['true'],
    //// mods: ['true'],
    //// plugins: ['true'],
    //// allowNether: ['true'],
    //// bannedPlayers: ['true'],
  };
  $: errors = form == null || form.success == true ? {} : form.fields;

  let exportMotd: string | undefined = undefined;

  let selectedTimeToLive: TimeToLive = TimeToLive['12 hr'];
  let selectedSoftware: ServerSoftware = ServerSoftware.Vanilla;
  let selectedGameVersion: string;
  $: if (!ServerSoftwareOptions[selectedSoftware]?.versions.flat().includes(selectedGameVersion)) selectedGameVersion = ServerSoftwareOptions[selectedSoftware]?.versions.at(-1)?.at(-1) ?? '';

  let worldCreator: 'new' | 'source' = 'new';
  $: selectedSoftware, (worldCreator = 'new');
  let worldType: WorldType = WorldType.Normal;
  let superflatLayers: { id: number; block: string; height: number }[] = [{ id: 0, block: 'minecraft:grass_block', height: 1 }];

  let whitelistPlayers: { id: number; name: string }[] = [];
  let operatorPlayers: { id: number; name: string }[] = [];

  let iconImageElement: HTMLImageElement;
  let iconFileElement: HTMLInputElement;

  let createButtonLoading = false;

  function handleIconChange() {
    if (iconFileElement?.files?.length) {
      const file = iconFileElement.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        iconImageElement.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // let additionalDatapacks: { url: string; file: File | null }[] = [];
</script>

<!-- ORIGINAL FORM!!! -->

<!-- {JSON.stringify(form)} -->

{#if form?.success == false}
  {form.message}
  <pre>
{JSON.stringify(errors, null, 2)}
  </pre>
{/if}

<form
  method="post"
  class="flex w-full max-w-4xl flex-col gap-4 p-8 max-sm:p-0"
  enctype="multipart/form-data"
  use:enhance={() => {
    createButtonLoading = true;
    return ({ update }) => {
      createButtonLoading = false;
      update();
    };
  }}>
  <div class="flex w-full items-center pb-8">
    <div class="h-px w-full bg-gray-800" />
    <div class="mx-4 whitespace-nowrap text-sm font-thin">Display Information</div>
    <div class="h-px w-full bg-gray-800" />
  </div>

  <!-- SERVER DISPLAY INFO -->

  <!-- Title & Subdomain -->
  <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
    <label class={`block`}>
      <span class="font-semibold text-gray-400">Server Title<sup class="text-red-400">*</sup></span>
      <div class={`${errors.title ? 'error-outline' : ''}`}>
        <input type="text" name="title" id="title" placeholder="Server Title" class="w-full rounded-md bg-gray-800 p-2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        <span class={`block w-full text-center font-handwriting ${errors.title ? '' : 'hidden'}`}>{errors.title}</span>
      </div>
    </label>
    <label class={`block`}>
      <span class="font-semibold text-gray-400">Subdomain</span>
      <div class={`${errors.subdomain ? 'error-outline' : ''}`}>
        <input type="text" name="subdomain" placeholder="Subdomain" class="w-full rounded-md bg-gray-800 p-2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        <span class={`block w-full text-center font-handwriting ${errors.subdomain ? '' : 'hidden'}`}>{errors.subdomain}</span>
      </div>
    </label>
  </div>

  <!-- Icon -->
  <label class={`rounded-md  bg-gray-800 ${errors.icon ? 'error-outline' : ''}`}>
    <div class="flex items-center gap-2 p-4 max-sm:flex-col">
      <img class="aspect-square w-10 rounded-sm max-sm:w-36" alt="" bind:this={iconImageElement} src={publicENV.PUBLIC_DEFAULT_ICON_URL} />
      <input
        type="file"
        name="icon"
        placeholder="Server Icon"
        accept="image/*"
        bind:this={iconFileElement}
        on:change={handleIconChange}
        class="w-full file:mr-4 file:cursor-pointer file:rounded-md
        file:border-2 file:border-solid
        file:border-secondary
        file:bg-transparent
        file:px-4
        file:py-2 file:text-sm
        file:font-semibold
        file:text-secondary
      hover:file:bg-secondary hover:file:text-black" />
      <span class="whitespace-nowrap text-sm text-gray-400">*Image will be resized</span>
    </div>
    <span class={`block w-full text-center font-handwriting ${errors.icon ? '' : 'hidden'}`}>{errors.icon}</span>
  </label>

  <!-- MOTD -->
  <div class={`${errors.motd ? 'error-outline' : ''}`}>
    <!-- AHHHH -->
    <!-- <textarea name="motd" class="w-full" placeholder="A Hermes Minecraft Server" /> -->
    <input type="text" name="motd" value={exportMotd} class=" hidden" />
    <MinecraftRawEditor bind:exportMotd />
    <span class={`block w-full text-center font-handwriting ${errors.motd ? '' : 'hidden'}`}>{errors.motd}</span>
  </div>

  <div class="flex w-full items-center py-8">
    <div class="h-px w-full bg-gray-800" />
    <div class="mx-4 whitespace-nowrap text-sm font-thin">Servers Options</div>
    <div class="h-px w-full bg-gray-800" />
  </div>

  <!-- SERVER CONFIG -->

  <!-- Time to Live -->
  <div class="font-semibold text-gray-400">Time to Live</div>
  <div class={`grid grid-cols-2 gap-4 md:grid-cols-4 ${errors.timeToLive ? 'error-outline' : ''}`}>
    {#each Object.entries(TimeToLive) as [timeName, time]}
      <label class={`flex cursor-pointer items-center gap-2 rounded-md bg-gray-800 px-4 py-2 capitalize has-[:checked]:ring-2 has-[:checked]:ring-primary`}>
        <input type="radio" name="timeToLive" value={time} bind:group={selectedTimeToLive} class=" hidden" />
        {timeName}
      </label>
    {/each}
  </div>
  <span class={`block w-full text-center font-handwriting ${errors.timeToLive ? '' : 'hidden'}`}>{errors.timeToLive}</span>

  <!-- Server Software -->

  <div class="font-semibold text-gray-400">Server Software</div>
  <div class={`grid grid-cols-2 gap-4 md:grid-cols-4 ${errors.serverSoftware ? 'error-outline' : ''}`}>
    {#each Object.keys(ServerSoftwareOptions) as software}
      <label class={`flex cursor-pointer items-center gap-2 rounded-md bg-gray-800 px-4 py-2 capitalize has-[:checked]:ring-2 has-[:checked]:ring-primary`}>
        <input type="radio" name="serverSoftware" value={software} bind:group={selectedSoftware} class=" hidden" />
        {software}
      </label>
    {/each}
  </div>
  <span class={`block w-full text-center font-handwriting ${errors.serverSoftware ? '' : 'hidden'}`}>{errors.serverSoftware}</span>

  <!-- Game Version -->

  <div class="font-semibold text-gray-400">Game Version</div>
  <div class={` flex flex-wrap gap-4 ${errors.gameVersion ? 'error-outline' : ''}`}>
    {#each ServerSoftwareOptions[selectedSoftware]?.versions ?? [] as version}
      {@const hiddenNumber = version.includes(selectedGameVersion) ? selectedGameVersion : version[0]}
      <div class="group relative">
        <!-- Invisible first number just so the button are the right size and can be abolutely positioned -->
        <div class={`invisible flex w-full justify-between gap-1 px-4 py-2`}>
          {hiddenNumber}
          {#if version.length > 1 && (version[0] == hiddenNumber || selectedGameVersion === hiddenNumber)}
            <div class="h-4 w-4"></div>
          {/if}
        </div>
        <div class="absolute top-0 h-fit rounded-md shadow-lg hover:z-10 group-hover:bg-gray-800">
          {#each version as versionNumber}
            <label
              class={`
                flex w-full items-center justify-between gap-1 rounded-md bg-gray-800 px-4 py-2 text-left 
                first:relative checked:block hover:bg-gray-700 group-hover:flex group-hover:bg-transparent 
                ${selectedGameVersion === versionNumber ? 'z-10 text-primary ring-2 ring-primary' : 'text-white'}
                ${(version[0] == versionNumber && !version.includes(selectedGameVersion)) || selectedGameVersion == versionNumber ? 'block' : 'hidden'} 
              `}>
              {versionNumber}
              {#if version.length > 1 && (version[0] == versionNumber || selectedGameVersion === versionNumber)}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:invisible" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              {/if}
              <input type="radio" name="gameVersion" class="hidden" value={versionNumber} bind:group={selectedGameVersion} />
            </label>
          {/each}
        </div>
      </div>
    {/each}
  </div>
  <span class={`block w-full text-center font-handwriting ${errors.gameVersion ? '' : 'hidden'}`}>{errors.gameVersion}</span>

  <div class="flex w-full items-center py-8">
    <div class="h-px w-full bg-gray-800" />
    <div class="mx-4 whitespace-nowrap text-sm font-thin">World Options</div>
    <div class="h-px w-full bg-gray-800" />
  </div>

  <!-- WORLD OPTIONS -->

  {#if ServerSoftwareOptions[selectedSoftware]?.newWorld || ServerSoftwareOptions[selectedSoftware]?.fromSource}
    <!-- Selector -->
    <div class={`flex justify-center gap-4 ${errors.worldCreator ? 'error-outline' : ''}`}>
      {#if ServerSoftwareOptions[selectedSoftware]?.newWorld}
        <label class="cursor-pointer border-b-4 border-gray-700 px-4 py-2 has-[:checked]:border-primary has-[:checked]:font-bold">
          <input type="radio" name="worldCreator" value="new" bind:group={worldCreator} class="hidden" />
          New World
        </label>
      {/if}
      {#if ServerSoftwareOptions[selectedSoftware]?.fromSource}
        <label class="cursor-pointer border-b-4 border-gray-700 px-4 py-2 has-[:checked]:border-primary has-[:checked]:font-bold">
          <input type="radio" name="worldCreator" value="source" bind:group={worldCreator} class="hidden" />
          From Source
        </label>
      {/if}
    </div>
    <span class={`block w-full text-center font-handwriting ${errors.worldCreator ? '' : 'hidden'}`}>{errors.worldCreator}</span>

    <!-- New World Option -->

    {#if worldCreator == 'new'}
      <!-- Seed -->
      <div class="font-semibold text-gray-400">World Seed</div>
      <label class={`block ${errors.worldSeed ? 'error-outline' : ''}`}>
        <input type="text" class="w-full rounded-md bg-gray-800 p-2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" name="worldSeed" placeholder="World Seed" />
        <span class={`block w-full text-center font-handwriting ${errors.worldSeed ? '' : 'hidden'}`}>{errors.worldSeed}</span>
      </label>

      <!-- World Type -->
      <div class="font-semibold text-gray-400">World Type</div>
      <div class={`grid grid-cols-2 gap-4 md:grid-cols-4 ${errors.worldType ? 'error-outline' : ''}`}>
        {#each Object.values(WorldType) as type}
          <label class="flex cursor-pointer items-center gap-2 rounded-md bg-gray-800 px-4 py-2 capitalize has-[:checked]:text-primary has-[:checked]:ring-2 has-[:checked]:ring-primary">
            <input type="radio" name="worldType" value={type} bind:group={worldType} class="hidden" />
            {type.replace('_', ' ')}
          </label>
        {/each}
      </div>
      <span class={`block w-full text-center font-handwriting ${errors.worldType ? '' : 'hidden'}`}>{errors.worldType}</span>

      {#if worldType == WorldType.Flat}
        <!-- Make flat -->
        <input type="text" name="superflatLayers" value={JSON.stringify(superflatLayers)} hidden />
        <!-- Superflat creator -->
        <div class={`m-auto w-3/4 max-sm:w-full ${errors.superflatLayers ? 'error-outline' : ''}`}>
          <DraggableList bind:list={superflatLayers}></DraggableList>
        </div>
      {/if}
    {:else if worldCreator == 'source'}
      <div class="font-semibold text-gray-400">World Source</div>
      <label class={`block ${errors.worldSourceURL ? 'error-outline' : ''}`}>
        <input type="url" class="w-full rounded-md bg-gray-800 p-2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" name="worldSourceURL" placeholder="www.downloadlink.com" />
        <span class={`block w-full text-center font-handwriting ${errors.worldSourceURL ? '' : 'hidden'}`}>{errors.worldSourceURL}</span>
      </label>

      <div class="font-semibold text-gray-400">World File</div>
      <label class={`${errors.worldSource ? 'error-outline' : ''}`}>
        <input
          type="file"
          class="w-full rounded-md bg-gray-800 p-2
            file:mr-4 file:cursor-pointer
          file:rounded-md
            file:border-2
            file:border-solid
            file:border-secondary file:bg-transparent
            file:px-4
          file:py-2
          file:text-sm file:font-semibold
            file:text-secondary hover:file:bg-secondary hover:file:text-black"
          name="worldSource"
          accept="application/zip"
          placeholder="World File" />
        <span class={`block w-full text-center font-handwriting ${errors.worldSource ? '' : 'hidden'}`}>{errors.worldSource}</span>
      </label>
    {/if}
  {/if}

  <div class="flex w-full items-center py-8">
    <div class="h-px w-full bg-gray-800" />
    <div class="mx-4 whitespace-nowrap text-sm font-thin">Additional Configuration</div>
    <div class="h-px w-full bg-gray-800" />
  </div>

  <div class="grid grid-cols-2 gap-4 max-sm:flex max-sm:flex-col">
    <!-- Difficulty Selector -->
    <label class={`flex items-center justify-between rounded-md bg-gray-800 p-2 px-4 max-sm:order-1 ${errors.difficulty ? 'error-outline' : ''}`}>
      Difficulty
      <select name="difficulty" class="w-1/2 rounded-md bg-gray-700 p-1 px-4">
        <option value="peaceful">Peaceful</option>
        <option value="easy">Easy</option>
        <option value="normal" selected>Normal</option>
        <option value="hard">Hard</option>
      </select>
    </label>
    <span class={`block w-full text-center font-handwriting ${errors.difficulty ? '' : 'hidden'}`}>{errors.difficulty}</span>

    <!-- Gamemode Selector -->
    <label class={`flex items-center justify-between rounded-md bg-gray-800 p-2 px-4 max-sm:order-2 ${errors.gamemode ? 'error-outline' : ''}`}>
      Gamemode
      <select name="gamemode" class="w-1/2 rounded-md bg-gray-700 p-1 px-4">
        <option value="survival" selected>Survival</option>
        <option value="creative">Creative</option>
        <option value="adventure">Adventure</option>
        <option value="spectator">Spectator</option>
      </select>
    </label>
    <span class={`block w-full text-center font-handwriting ${errors.gamemode ? '' : 'hidden'}`}>{errors.gamemode}</span>

    <!-- Max Players -->
    <label class={`flex items-center justify-between rounded-md bg-gray-800 p-2 px-4 max-sm:order-3 ${errors.maxPlayers ? 'error-outline' : ''}`}>
      Max Players
      <input type="number" class="w-1/2 rounded-md bg-gray-700 p-1 px-4 text-center" name="maxPlayers" placeholder="Max Players" value="10" />
    </label>
    <span class={`block w-full text-center font-handwriting ${errors.maxPlayers ? '' : 'hidden'}`}>{errors.maxPlayers}</span>

    <label class={`flex items-center justify-between rounded-md bg-gray-800 p-2 px-4 max-sm:order-6 ${errors.enablePVP ? 'error-outline' : ''} flex cursor-pointer items-center gap-2 `}>
      PvP
      <input type="checkbox" class="w-8 scale-150 rounded-md bg-gray-700 text-center checked:accent-primary" value="true" checked name="enablePVP" />
    </label>
    <span class={`block w-full text-center font-handwriting ${errors.enablePVP ? '' : 'hidden'}`}>{errors.enablePVP}</span>

    <label class={`flex items-center justify-between rounded-md bg-gray-800 p-2 px-4 max-sm:order-4 ${errors.viewDistance ? 'error-outline' : ''}`}>
      View Distance
      <input type="number" class="w-1/2 rounded-md bg-gray-700 p-1 px-4 text-center" value="16" name="viewDistance" placeholder="View Distance" />
    </label>
    <span class={`block w-full text-center font-handwriting ${errors.viewDistance ? '' : 'hidden'}`}>{errors.viewDistance}</span>

    <label class={`flex items-center justify-between rounded-md bg-gray-800 p-2 px-4 max-sm:order-7 ${errors.hardcore ? 'error-outline' : ''} flex cursor-pointer items-center gap-2 `}>
      Hardcore
      <input type="checkbox" class="w-8 scale-150 rounded-md bg-gray-700 text-center checked:accent-primary" value="true" name="hardcore" />
    </label>
    <span class={`block w-full text-center font-handwriting ${errors.hardcore ? '' : 'hidden'}`}>{errors.hardcore}</span>

    <label class={`flex items-center justify-between rounded-md bg-gray-800 p-2 px-4 max-sm:order-5 ${errors.simulationDistance ? 'error-outline' : ''}`}>
      Simulation Distance
      <input type="number" class="w-1/2 rounded-md bg-gray-700 p-1 px-4 text-center" value="10" name="simulationDistance" placeholder="Simulation Distance" />
    </label>
    <span class={`block w-full text-center font-handwriting ${errors.simulationDistance ? '' : 'hidden'}`}>{errors.simulationDistance}</span>

    <label class={`flex items-center justify-between rounded-md bg-gray-800 p-2 px-4 max-sm:order-8 ${errors.enableCommandBlock ? 'error-outline' : ''} flex cursor-pointer items-center gap-2 `}>
      Enable Command Blocks
      <input type="checkbox" class="w-8 scale-150 rounded-md bg-gray-700 text-center checked:accent-primary" value="true" checked name="enableCommandBlock" />
    </label>
    <span class={`block w-full text-center font-handwriting ${errors.enableCommandBlock ? '' : 'hidden'}`}>{errors.enableCommandBlock}</span>
  </div>

  <div class="grid grid-cols-2 gap-x-8 px-8 max-sm:flex max-sm:flex-col">
    <label class={`${errors.whitelist ? 'error-outline' : ''}`}>
      <div class="font-semibold text-gray-400">Whitelist</div>
      <!-- <textarea class="h-full w-full" name="whitelist" placeholder={`[\n\t{\n\t\tuuid: "0000-0000-0000-0000",\n\t\tname: "username"\n\t}\n]`} /> -->
      <input name="whitelist" class="hidden" value={JSON.stringify(whitelistPlayers)} />
      <PlayerList bind:list={whitelistPlayers} />
      <span class={`block w-full text-center font-handwriting ${errors.motd ? '' : 'hidden'}`}>{errors.motd}</span>
    </label>
    <label class={`${errors.ops ? 'error-outline' : ''}`}>
      <div class="font-semibold text-gray-400">Operators</div>
      <!-- <textarea class="h-full w-full" name="ops" placeholder={`[\n\t{\n\t\tuuid: "0000-0000-0000-0000"\n\t\tname: "username"\n\t\tlevel: 4,\n\t\tbypassesPlayerLimit: true\n\t}\n]`} /> -->
      <input name="ops" class="hidden" value={JSON.stringify(operatorPlayers)} />
      <PlayerList bind:list={operatorPlayers} />
      <span class={`block w-full text-center font-handwriting ${errors.motd ? '' : 'hidden'}`}>{errors.motd}</span>
    </label>
    <!-- <label class={`min-h-[16rem] ${errors.bannedPlayers ? 'error-outline' : ''}`}>
      Banned Players
      <textarea class="h-full w-full whitespace-pre" name="bannedPlayers" placeholder={`[\n\t{\n\t\tuuid: "0000-0000-0000-0000",\n\t\tname: "username",\n\t\tcreated: "1970-01-01T00:00:00.000Z",\n\t\tsource: "username",\n\t\texpires: "1970-01-01T00:00:00.000Z",\n\t\treason: "Ban Hammer"\n\t}\n]`} />
    </label> -->
  </div>

  <!-- <hr /> -->

  <!-- <div class="text-lg font-bold">Server Properties</div>
  <div>This file will override all set properties above <br /> (only enable if you know what you are doing)</div>
  <label class={`${errors.serverProperties ? 'error-outline' : ''}`}>
    <input
      type="file"
      class="w-full rounded-md bg-gray-800 p-2
        file:mr-4 file:cursor-pointer
      file:rounded-md
        file:border-2
        file:border-solid
        file:border-secondary file:bg-transparent
        file:px-4
      file:py-2
      file:text-sm file:font-semibold
        file:text-secondary hover:file:bg-secondary hover:file:text-black"
      name="serverProperties"
      accept=".properties"
      placeholder="Server Properties" />
  </label> -->

  <div class="flex w-full items-center py-8">
    <div class="h-px w-full bg-gray-800" />
    <div class="mx-4 whitespace-nowrap text-sm font-thin">Start the Server</div>
    <div class="h-px w-full bg-gray-800" />
  </div>

  <div class="grid grid-cols-3 gap-4 max-sm:flex max-sm:flex-col">
    <label class={`flex cursor-pointer items-center justify-center gap-2 rounded-md bg-gray-800 p-2 ${errors.eula ? 'error-outline' : ''}`}>
      <input type="checkbox" name="eula" value="true" class="accent-primary" />
      <span>
        <span>I agree to the</span> <a href="https://www.minecraft.net/en-us/eula" target="_blank" rel="noopener noreferrer" class="underline">Minecraft EULA</a>
      </span>
    </label>
    <button type="submit" disabled={createButtonLoading} class="flex items-center justify-center rounded-md border-2 border-primary bg-transparent p-2 px-4 text-lg font-bold text-primary transition-colors hover:bg-primary hover:text-black disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:bg-transparent disabled:hover:text-primary">
      {#if createButtonLoading}
        <svg class="-ml-1 mr-3 h-5 w-5 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      {/if}
      Create
    </button>
    <!-- <label class={`flex items-center justify-between rounded-md bg-gray-800 p-2 px-4 ${errors.timeToLive ? 'error-outline' : ''}`}>
      Time to Live
      <select name="timeToLive" class="w-1/2 rounded-md bg-gray-700 p-1 px-4">
        {#each Object.values(TimeToLive) as timeToLive}
          <option value={timeToLive}>{timeToLive.replace('_', ' ')}</option>
        {/each}
      </select>
    </label> -->
  </div>
</form>
