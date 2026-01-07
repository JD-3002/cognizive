import { verifyToken } from "../lib/jwt.js";
import { cookieName } from "../lib/cookies.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, headerToken] = header.split(" ");

  const tokenFromHeader = scheme === "Bearer" ? headerToken : null;
  const tokenFromCookie = req.cookies?.[cookieName()] || null;

  const token = tokenFromHeader || tokenFromCookie;

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
