import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-pre:rounded-xl prose-pre:border prose-pre:border-[var(--border)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
