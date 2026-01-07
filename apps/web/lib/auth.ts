"use client";

export async function logout(apiBaseUrl: string) {
  await fetch(`${apiBaseUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
