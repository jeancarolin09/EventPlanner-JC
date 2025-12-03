export async function login(email, password) {
  const res = await fetch("http://localhost:8000/api/login_check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Échec login : " + res.status);
  }

  return await res.json(); // contient le token
}
