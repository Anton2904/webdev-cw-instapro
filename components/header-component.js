import { getStoredUser, clearUser as clearUserStorage } from "../helpers.js";
import { goToPage } from "../index.js";
import { POSTS_PAGE, ADD_POSTS_PAGE, AUTH_PAGE } from "../routes.js";

export function renderHeaderComponent({ element }) {
  const user = getStoredUser();

  const headerEl = document.createElement("div");
  headerEl.className = "header";

  const left = document.createElement("div");
  left.className = "logo";
  left.textContent = "instapro";

  const actions = document.createElement("div");
  actions.className = "header-actions";

  // Home button
  const btnHome = document.createElement("button");
  btnHome.textContent = "Лента";
  btnHome.addEventListener("click", () => goToPage(POSTS_PAGE));
  actions.appendChild(btnHome);

  if (user) {
    const btnAdd = document.createElement("button");
    btnAdd.textContent = "Добавить пост";
    btnAdd.addEventListener("click", () => goToPage(ADD_POSTS_PAGE));
    actions.appendChild(btnAdd);

    const btnLogout = document.createElement("button");
    btnLogout.textContent = "Выйти";
    btnLogout.addEventListener("click", () => {
      clearUserStorage();
      // reload posts as non-auth user
      goToPage(POSTS_PAGE);
    });
    actions.appendChild(btnLogout);
  } else {
    const btnLogin = document.createElement("button");
    btnLogin.textContent = "Войти / Регистрация";
    btnLogin.addEventListener("click", () => goToPage(AUTH_PAGE));
    actions.appendChild(btnLogin);
  }

  headerEl.appendChild(left);
  headerEl.appendChild(actions);

  // render into provided element
  element.innerHTML = "";
  element.appendChild(headerEl);
}
