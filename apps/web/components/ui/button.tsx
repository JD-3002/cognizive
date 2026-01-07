import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export function Button({ loading, children, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={[
        "inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white",
        "hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed",
      ].join(" ")}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
