import { getStoredUser, clearUser } from "../helpers.js";
import { goToPage } from "../index.js";
import { POSTS_PAGE, ADD_POSTS_PAGE, AUTH_PAGE } from "../routes.js";

export function renderHeaderComponent({ element }) {
  const user = getStoredUser();

  element.innerHTML = `
    <div class="header-container">
      <h1 class="header__logo">instapro</h1>

      <div class="header__actions">
        ${
          user
            ? `
              <button class="header__button header__button-add">Добавить</button>
              <button class="header__button header__button-logout">Выйти</button>
            `
            : `
              <button class="header__button header__button-login">
                Войти
              </button>
            `
        }
      </div>
    </div>
  `;

  // логотип → лента
  element.querySelector(".header__logo").addEventListener("click", () => {
    goToPage(POSTS_PAGE);
  });

  if (user) {
    element
      .querySelector(".header__button-add")
      .addEventListener("click", () => {
        goToPage(ADD_POSTS_PAGE);
      });

    element
      .querySelector(".header__button-logout")
      .addEventListener("click", () => {
        clearUser();
        goToPage(POSTS_PAGE);
      });
  } else {
    element
      .querySelector(".header__button-login")
      .addEventListener("click", () => {
        goToPage(AUTH_PAGE);
      });
  }
}
