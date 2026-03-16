"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidBlock } from "./mermaid-block";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-pre:rounded-xl prose-pre:border prose-pre:border-[var(--border)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match?.[1];
            const codeStr = String(children).replace(/\n$/, "");

            if (lang === "mermaid") {
              return <MermaidBlock code={codeStr} />;
            }

            // Inline code
            if (!className) {
              return <code {...props}>{children}</code>;
            }

            // Block code (default rendering)
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
