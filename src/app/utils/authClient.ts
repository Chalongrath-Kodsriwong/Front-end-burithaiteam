export function clearClientAuthData() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("username");
  localStorage.removeItem("first_name");

  const expired = "Thu, 01 Jan 1970 00:00:00 GMT";
  const cookieNames = ["token", "access_token", "refresh_token", "auth_token"];

  for (const name of cookieNames) {
    document.cookie = `${name}=; expires=${expired}; path=/`;
  }
}

export async function fetchAuthSession(apiBaseUrl: string) {
  const endpoints = ["/api/auth/me", "/api/account/profile"];

  for (const endpoint of endpoints) {
    const res = await fetch(`${apiBaseUrl}${endpoint}`, {
      credentials: "include",
      cache: "no-store",
    });

    if (res.status !== 404) return res;
  }

  return new Response(null, { status: 404 });
}
