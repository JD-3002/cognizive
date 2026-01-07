export function cookieName() {
  return process.env.COOKIE_NAME || "cognivize_token";
}

export function cookieOptions() {
  const secure = String(process.env.COOKIE_SECURE || "false").toLowerCase() === "true";
  const sameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();

  return {
    httpOnly: true,
    secure,
    sameSite, // "lax" | "strict" | "none"
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
