"use client";

export type ResponseData = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
};

function statusTone(status: number) {
  if (status >= 200 && status < 300) return "text-status-success";
  if (status >= 300 && status < 400) return "text-status-info";
  if (status >= 400 && status < 500) return "text-status-warning";
  return "text-status-error";
}

export function ResponseViewer({ data }: { data: ResponseData }) {
  const headerLines = Object.entries(data.headers).map(
    ([k, v]) => `${k}: ${v}`,
  );

  return (
    <pre className="whitespace-pre-wrap break-words rounded-xl border border-border bg-card p-4 font-mono text-xs leading-relaxed">
      <span className={statusTone(data.status)}>
        {data.status} {data.statusText}
      </span>
      {"\n"}
      {headerLines.join("\n")}
      {headerLines.length > 0 ? "\n" : ""}
      {"\n"}
      {data.body}
    </pre>
  );
}
