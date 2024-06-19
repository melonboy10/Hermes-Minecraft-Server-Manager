<script lang="ts">
  import { Color } from '@tiptap/extension-color';
  import TextStyle from '@tiptap/extension-text-style';

  import Bold from '@tiptap/extension-bold';
  import Document from '@tiptap/extension-document';
  import History from '@tiptap/extension-history';
  import Italic from '@tiptap/extension-italic';
  import Paragraph from '@tiptap/extension-paragraph';
  import Strike from '@tiptap/extension-strike';
  import Text from '@tiptap/extension-text';
  import Underline from '@tiptap/extension-underline';
  import { generateJSON } from '@tiptap/html';

  import { env as publicENV } from '$env/dynamic/public';
  import { Editor, Extension } from '@tiptap/core';
  import HardBreak from '@tiptap/extension-hard-break';
  import { Plugin, PluginKey } from 'prosemirror-state';
  import { onMount } from 'svelte';

  let element: HTMLDivElement;
  let editor: Editor;
  export let exportMotd: string | undefined;
  $: exportMotd = generateMOTDString(editor);

  // Code Name            Foreground color                   Background color              Equivalent ANSI escape code
  // §0 | black           | 0    0    0     |    #000000   |    0    0    0    | #000000 |     \e[0;30m
  // §1 | dark_blue       | 0    0    170   |    #0000AA   |    0    0    42   | #00002A |     \e[0;34m
  // §2 | dark_green      | 0    170  0     |    #00AA00   |    0    42   0    | #002A00 |     \e[0;32m
  // §3 | dark_aqua       | 0    170  170   |    #00AAAA   |    0    42   42   | #002A2A |     \e[0;36m
  // §4 | dark_red        | 170  0    0     |    #AA0000   |    42   0    0    | #2A0000 |     \e[0;31m
  // §5 | dark_purple     | 170  0    170   |    #AA00AA   |    42   0    42   | #2A002A |     \e[0;35m
  // §6 | gold            | 255  170  0     |    #FFAA00   |    42   42   0    | #2A2A00 |     \e[0;33m
  // §7 | gray            | 170  170  170   |    #AAAAAA   |    42   42   42   | #2A2A2A |     \e[0;37m
  // §8 | dark_gray       | 85   85   85    |    #555555   |    21   21   21   | #151515 |     \e[0;90m
  // §9 | blue            | 85   85   255   |    #5555FF   |    21   21   63   | #15153F |     \e[0;94m
  // §a | green           | 85   255  85    |    #55FF55   |    21   63   21   | #153F15 |     \e[0;92m
  // §b | aqua            | 85   255  255   |    #55FFFF   |    21   63   63   | #153F3F |     \e[0;96m
  // §c | red             | 255  85   85    |    #FF5555   |    63   21   21   | #3F1515 |     \e[0;91m
  // §d | light_purple    | 255  85   255   |    #FF55FF   |    63   21   63   | #3F153F |     \e[0;95m
  // §e | yellow          | 255  255  85    |    #FFFF55   |    63   63   21   | #3F3F15 |     \e[0;93m
  // §f | white           | 255  255  255   |    #FFFFFF   |    63   63   63   | #3F3F3F |     \e[0;97m

  const minecraftColors = [
    { name: 'black', hex: '#000000', code: '§0' },
    { name: 'dark_blue', hex: '#0000AA', code: '§1' },
    { name: 'dark_green', hex: '#00AA00', code: '§2' },
    { name: 'dark_aqua', hex: '#00AAAA', code: '§3' },
    { name: 'dark_red', hex: '#AA0000', code: '§4' },
    { name: 'dark_purple', hex: '#AA00AA', code: '§5' },
    { name: 'gold', hex: '#FFAA00', code: '§6' },
    { name: 'gray', hex: '#AAAAAA', code: '§7' },
    { name: 'dark_gray', hex: '#555555', code: '§8' },
    { name: 'blue', hex: '#5555FF', code: '§9' },
    { name: 'green', hex: '#55FF55', code: '§a' },
    { name: 'aqua', hex: '#55FFFF', code: '§b' },
    { name: 'red', hex: '#FF5555', code: '§c' },
    { name: 'light_purple', hex: '#FF55FF', code: '§d' },
    { name: 'yellow', hex: '#FFFF55', code: '§e' },
    { name: 'white', hex: '#FFFFFF', code: '§f' }
  ];

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [
        Document,
        Text,
        Paragraph,
        HardBreak,
        History,
        Bold,
        Italic,
        Strike,
        Underline,
        TextStyle,
        Color,
        Extension.create({
          name: 'nonewlines',
          addProseMirrorPlugins() {
            return [
              new Plugin({
                key: new PluginKey('eventHandler'),
                props: {
                  handleKeyDown: (view, event) => {
                    if (event.key === 'Enter') {
                      const cursorPositon = view.state.selection.anchor;
                      const beforeCursor = editor.getHTML().indexOf('<br>') - 1 <= cursorPositon;
                      editor.commands.setContent(editor.getHTML().replace('<br>', ''));
                      editor.commands.setTextSelection(cursorPositon + (beforeCursor ? -1 : 0));
                      editor.commands.setHardBreak();
                      return true;
                    }
                  }
                }
              })
            ];
          }
        })
      ],
      content: `${publicENV.PUBLIC_DEFAULT_MOTD}<br>`,
      editorProps: {
        attributes: {
          class: 'scroll-transparent font-minecraftia focus:outline-none focus:ring-2 p-2 ring-primary rounded-md whitespace-nowrap *:whitespace-nowrap overflow-x-auto'
        }
      },
      onTransaction: () => {
        editor = editor;
      },
      onUpdate: () => {
        const html = editor.getHTML().split('<br>');
        if (html.length > 2) {
          editor.commands.setContent(`${html[0]}<br>${html.slice(1).join('')}`);
        } else if (html.length == 1) {
          const cursorPositon = editor.state.selection.anchor;
          editor.commands.focus('end');
          editor.commands.setHardBreak();
          editor.commands.setTextSelection(cursorPositon);
        }
      }
    });
  });

  function generateMOTDString(editor: Editor) {
    if (!editor) return;
    // HTML: <p><u><span style="color: rgb(170, 0, 0)">A</span></u> <strong><em><span style="color: rgb(0, 170, 0)">Hermes</span></em> <span style="color: rgb(255, 170, 0)">Minecraft</span></strong> <u><span style="color: rgb(85, 255, 85)">Server</span></u><br></p>
    // JSON: {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"underline"},{"type":"textStyle","attrs":{"color":"rgb(170, 0, 0)"}}],"text":"A"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"bold"},{"type":"italic"},{"type":"textStyle","attrs":{"color":"rgb(0, 170, 0)"}}],"text":"Hermes"},{"type":"text","marks":[{"type":"bold"}],"text":" "},{"type":"text","marks":[{"type":"bold"},{"type":"textStyle","attrs":{"color":"rgb(255, 170, 0)"}}],"text":"Minecraft"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"underline"},{"type":"textStyle","attrs":{"color":"rgb(85, 255, 85)"}}],"text":"Server"},{"type":"hardBreak"}]}]}
    // MOTD: §n§l§o§cA§r §l§o§aHermes§r §l§aMinecraft §n§aServer
    const json = generateJSON(editor.getHTML() ?? '', [Document, Text, Paragraph, HardBreak, History, Bold, Italic, Strike, Underline, TextStyle, Color]) as { type: 'document'; content: [{ type: 'paragraph'; content: ({ type: 'text'; text: string; marks: undefined | ({ type: 'underline' } | { type: 'bold' } | { type: 'strike' } | { type: 'italic' } | { type: 'textStyle'; attrs: { color: string } })[] } | { type: 'hardbreak' })[] }] };
    const nodes = json.content[0].content;
    let motd = '';
    for (const node of nodes) {
      switch (node.type) {
        case 'text': {
          const marks = node.marks ?? [];
          motd += '§r';
          for (const mark of marks) {
            switch (mark.type) {
              case 'underline':
                motd += '§n';
                break;
              case 'bold':
                motd += '§l';
                break;
              case 'italic':
                motd += '§o';
                break;
              case 'strike':
                motd += '§m';
                break;
              case 'textStyle': {
                const hexColor = mark.attrs.color;
                const colorCode = minecraftColors.find((c) => c.hex == hexColor)?.code ?? '§f';
                motd += colorCode;
                break;
              }
            }
          }
          motd += node.text;
          break;
        }
        case 'hardbreak': {
          motd += '\n';
        }
      }
    }
    return motd;
  }
</script>

<div class="flex flex-col gap-2 rounded-md bg-gray-800 p-4">
  {#if editor}
    <div class="flex flex-wrap gap-2 *:rounded-md *:bg-gray-700 *:p-1 *:px-3 *:max-sm:p-2 *:max-sm:px-5">
      <button class={`${editor.isActive('bold') ? 'ring-2 ring-primary' : ''}`} type="button" on:click={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()}> Bold </button>
      <button class={`${editor.isActive('italic') ? 'ring-2 ring-primary' : ''}`} type="button" on:click={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()}> Italic </button>
      <button class={`${editor.isActive('strike') ? 'ring-2 ring-primary' : ''}`} type="button" on:click={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()}> Strikethrough </button>
      <button class={`${editor.isActive('underline') ? 'ring-2 ring-primary' : ''}`} type="button" on:click={() => editor.chain().focus().setUnderline().run()} disabled={!editor.can().chain().focus().setUnderline().run()}> Underline </button>
      <button type="button" on:click={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}> Undo </button>
      <button type="button" on:click={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}> Redo </button>
    </div>
    <div class="flex flex-wrap gap-1 *:aspect-square *:w-6 *:rounded-sm *:max-sm:w-10">
      {#each minecraftColors as color}
        <button type="button" on:click={() => editor.chain().focus().setColor(color.hex).run()} class={editor.isActive('textStyle', { color: color.hex }) ? 'ring-2 ring-primary' : ''} style={`background-color: ${color.hex}`} title={color.name}></button>
      {/each}
    </div>
  {/if}

  <div class="rounded-md bg-gray-700 font-minecraftia" bind:this={element} />
</div>
