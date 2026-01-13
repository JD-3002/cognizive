import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function Button({ loading, variant = "primary", className = "", children, ...props }: Props) {
  const variants: Record<string, string> = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-800 hover:bg-slate-100",
  };

  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={[
        "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium",
        "disabled:opacity-60 disabled:cursor-not-allowed transition",
        variants[variant] || variants.primary,
        className,
      ].join(" ")}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
