export function saveUser(user) {
  // user должен содержать поля id, login, name, token
  localStorage.setItem("user", JSON.stringify(user));
  if (user && user.token) {
    localStorage.setItem("token", user.token);
  }
}

export function clearUser() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

export function getStoredUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function getStoredToken() {
  // возвращаем строку в формате "Bearer <token>" если есть
  const t = localStorage.getItem("token");
  if (!t) return null;
  // в API docs токен передаётся как "Bearer <token>"
  return `Bearer ${t}`;
}
