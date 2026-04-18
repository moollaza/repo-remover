export const MARKDOWN_BODY_MARKER = "data-guide-markdown-body";

const PROSE_CLASSES = [
  "prose prose-lg dark:prose-invert max-w-none",
  "prose-headings:text-foreground prose-headings:font-bold",
  "prose-p:text-default-600 prose-p:leading-relaxed",
  // `[&_a:hover]:underline` puts :hover on the anchor itself.
  // `hover:prose-a:underline` puts it on the container, which underlines every
  // link whenever the cursor is anywhere in the article (prior regression).
  "prose-a:text-primary prose-a:no-underline [&_a:hover]:underline",
  "prose-strong:text-foreground",
  "prose-code:text-primary prose-code:bg-content2 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
  "prose-pre:bg-content2 prose-pre:border prose-pre:border-divider",
  "prose-li:text-default-600",
  "prose-table:border-collapse",
  "prose-th:border prose-th:border-divider prose-th:px-4 prose-th:py-2 prose-th:bg-content1",
  "prose-td:border prose-td:border-divider prose-td:px-4 prose-td:py-2",
].join(" ");

// The body is rendered as a placeholder <div> with a unique data-attribute.
// The build script (scripts/build-guides.tsx) replaces this placeholder with
// the markdown-to-HTML output at string level after React renders. This keeps
// React pure and confines raw HTML handling to one well-audited call site.
export function ProseArticle({ title }: { title: string }) {
  return (
    <article className={PROSE_CLASSES}>
      <h1>{title}</h1>
      <div {...{ [MARKDOWN_BODY_MARKER]: "" }} />
    </article>
  );
}
