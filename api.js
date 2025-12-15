// API wrapper — использует ключ prod
const API_BASE = "https://wedev-api.sky.pro/api/v1/prod/instapro";
const USERS_API = "https://wedev-api.sky.pro/api/user";

export async function getPosts() {
  const res = await fetch(`${API_BASE}/`);
  if (!res.ok) throw new Error("Не удалось получить посты");
  const data = await res.json();
  return data.posts || [];
}

export async function getUserPosts(userId) {
  const res = await fetch(`${API_BASE}/user-posts/${userId}`);
  if (!res.ok) throw new Error("Не удалось получить посты пользователя");
  const data = await res.json();
  return data.posts || [];
}

export async function createPost({ token, description, imageUrl }) {
  if (!token) throw new Error("Требуется авторизация");
  if (!description || !imageUrl) throw new Error("Описание и ссылка на изображение обязательны");

  const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      
    },
    body: JSON.stringify({ description, imageUrl }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || "Некорректные данные");
  }
  return data;
}

export async function addLike({ token, postId }) {
  if (!token) throw new Error("Требуется авторизация");
  const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/${postId}/like`, {
    method: "POST",
    headers: { Authorization: authHeader }, // ТОЛЬКО Authorization
  });
  if (!res.ok) throw new Error("Не удалось поставить лайк");
  const data = await res.json();
  return data.post || data;
}

export async function removeLike({ token, postId }) {
  if (!token) throw new Error("Требуется авторизация");
  const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/${postId}/dislike`, {
    method: "POST",
    headers: { Authorization: authHeader },
  });
  if (!res.ok) throw new Error("Не удалось убрать лайк");
  const data = await res.json();
  return data.post || data;
}

export async function deletePost({ token, postId }) {
  if (!token) throw new Error("Требуется авторизация");
  const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/${postId}`, {
    method: "DELETE",
    headers: { Authorization: authHeader },
  });
  if (!res.ok) throw new Error("Не удалось удалить пост");
  return res.json();
}

/* ----------------- API для пользователей ----------------- */

export async function registerUser({ login, name, password }) {
  const res = await fetch(`${USERS_API}`, {
    method: "POST",
    body: JSON.stringify({ login, name, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Ошибка регистрации");
  return data.user;
}

export async function loginUser({ login, password }) {
  const res = await fetch(`${USERS_API}/login`, {
    method: "POST",
    body: JSON.stringify({ login, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Ошибка входа");
  return data.user;
}
