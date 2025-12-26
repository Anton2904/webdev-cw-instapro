export function saveUserToLocalStorage(user) {
  window.localStorage.setItem("user", JSON.stringify(user));
}

export function getUserFromLocalStorage(user) {
  try {
    return JSON.parse(window.localStorage.getItem("user"));
  } catch (error) {
    return null;
  }
}

export function removeUserFromLocalStorage(user) {
  window.localStorage.removeItem("user");
}

export function escapeHtml(unsafeText = "") {
  return unsafeText
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Простое форматирование времени в духе "19 минут назад".
export function formatDistanceToNowRu(isoDateString) {
  const date = new Date(isoDateString);
  const diffMs = Date.now() - date.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (sec < 60) return "только что";
  if (min < 60) return `${min} мин назад`;
  if (hour < 24) return `${hour} ч назад`;
  if (day < 7) return `${day} дн назад`;

  // fallback — короткая дата
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
