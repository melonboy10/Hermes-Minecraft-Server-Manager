import adapter from '@sveltejs/adapter-node';
// import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// const addJSLines = new Map();
// /**
//  * @return {import('svelte/compiler').PreprocessorGroup}
//  */
// function transformLet() {
//   return {
//     name: '@let',
//     script: ({ content, filename, markup }) => {
//       if (!filename.endsWith('+page.svelte')) return;
//       console.log(filename);
//       console.log('script');

//       return {
//         code: content + '\n' + (addJSLines.get(filename) ?? []).join('\n')
//       };
//     },
//     markup: ({ content, filename }) => {
//       if (!filename.endsWith('+page.svelte')) return;
//       console.log(filename);
//       console.log('markup');

//       const allLets = [...(content.match(/{@let .*}/) ?? [])];
//       const toJS = allLets.map((l) => [...(l.match('(?!{)(?!@).*(?=})') ?? [])][0] + ';');
//       addJSLines.set(filename, toJS);
//       return {
//         code: content.replaceAll(/{@let .*}/g, '')
//       };
//     }
//   };
// }

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [/* transformLet(),  */ vitePreprocess()],

  kit: {
    adapter: adapter(),
    alias: {
      $assets: './src/assets/*'
    }
  }
};

export default config;
