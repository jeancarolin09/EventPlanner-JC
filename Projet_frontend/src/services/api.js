const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function fetchMovies() {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}/movies`, { headers });
    if (!response.ok) {
      throw new Error("Erreur API : " + response.status);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
