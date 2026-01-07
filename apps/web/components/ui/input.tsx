import * as React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export function Input({ label, error, ...props }: Props) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <input
        {...props}
        className={[
          "mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 outline-none transition",
          error ? "ring-red-300 focus:ring-red-400" : "ring-slate-200 focus:ring-slate-900/30",
        ].join(" ")}
      />
      {error ? <div className="mt-2 text-xs text-red-600">{error}</div> : null}
    </label>
  );
}
