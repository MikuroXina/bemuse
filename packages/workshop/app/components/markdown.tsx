import MarkdownIt from "markdown-it";
import { memo } from "react";

export const Markdown = memo(function Markdown({ source }: { source: string }) {
  const markdown = new MarkdownIt({
    linkify: true,
    breaks: true,
    typographer: true,
  });

  const html = markdown.render(source);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
});
