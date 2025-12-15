// API wrapper — использует ключ prod (как вы попросили)
const API_BASE = "https://wedev-api.sky.pro/api/v1/prod/instapro";
const USERS_API = "https://wedev-api.sky.pro/api/user";

/**
 * Получить общие посты
 * Возвращает массив постов
 */
export async function getPosts() {
  const res = await fetch(`${API_BASE}/`);
  if (!res.ok) {
    throw new Error("Не удалось получить посты");
  }
  const data = await res.json();
  // API возвращает { posts: [...] }
  return data.posts || [];
}

/**
 * Получить посты конкретного пользователя
 */
export async function getUserPosts(userId) {
  const res = await fetch(`${API_BASE}/user-posts/${userId}`);
  if (!res.ok) {
    throw new Error("Не удалось получить посты пользователя");
  }
  const data = await res.json();
  return data.posts || [];
}

/**
 * Создать пост (Authorization: Bearer <token>)
 */
export async function createPost({ token, description, imageUrl }) {
  if (!token) throw new Error("Требуется авторизация");
  const res = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description, imageUrl }),
  });
  if (res.status === 400) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Некорректные данные");
  }
  if (!res.ok) {
    throw new Error("Ошибка при создании поста");
  }
  return res.json();
}

/**
 * Лайк (POST /:id/like)
 */
export async function addLike({ token, postId }) {
  if (!token) throw new Error("Требуется авторизация");
  const res = await fetch(`${API_BASE}/${postId}/like`, {
    method: "POST",
    headers: { Authorization: token },
  });
  if (!res.ok) {
    throw new Error("Не удалось поставить лайк");
  }
  const data = await res.json();
  return data.post || data;
}

/**
 * Дизлайк (POST /:id/dislike)
 */
export async function removeLike({ token, postId }) {
  if (!token) throw new Error("Требуется авторизация");
  const res = await fetch(`${API_BASE}/${postId}/dislike`, {
    method: "POST",
    headers: { Authorization: token },
  });
  if (!res.ok) {
    throw new Error("Не удалось убрать лайк");
  }
  const data = await res.json();
  return data.post || data;
}

/**
 * Удалить пост (DELETE /:id)
 */
export async function deletePost({ token, postId }) {
  if (!token) throw new Error("Требуется авторизация");
  const res = await fetch(`${API_BASE}/${postId}`, {
    method: "DELETE",
    headers: { Authorization: token },
  });
  if (!res.ok) {
    throw new Error("Не удалось удалить пост");
  }
  return res.json();
}

/* ----------------- API для пользователей ----------------- */

/**
 * Регистрация
 * POST https://wedev-api.sky.pro/api/user
 * body: { login, name, password }
 */
export async function registerUser({ login, name, password }) {
  const res = await fetch("https://wedev-api.sky.pro/api/user", {
    method: "POST",
    body: JSON.stringify({
      login: login.trim(),
      name: name.trim(),
      password: password,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("REGISTER ERROR:", data);
    throw new Error(data.error || "Ошибка регистрации");
  }

  return data.user;
}

/**
 * Авторизация
 * POST https://wedev-api.sky.pro/api/user/login
 * body: { login, password }
 */
export async function loginUser({ login, password }) {
  const res = await fetch("https://wedev-api.sky.pro/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login: login.trim(),
      password: password,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Ошибка входа");
  }

  return data.user;
}
