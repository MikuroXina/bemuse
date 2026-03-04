<script lang="ts">
  import Markdown from "markdown-it";

  const markdown = new Markdown({
    linkify: true,
    breaks: true,
    typographer: true,
  });

  const { source }: { source: string } = $props();

  const html = $derived(markdown.render(source));
</script>

{@html html}
