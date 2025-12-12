import { USER_POSTS_PAGE, POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, getToken, getCurrentUserId } from "../index.js";
import { addLike, removeLike } from "../api.js";

/**
 * Динамический рендер постов.
 * При клике по имени — переходим на страницу пользователя.
 * При клике по лайку — переключаем состояние через API и обновляем ленту.
 *
 * Замечание: здесь используется getCurrentUserId() — это должна быть функция
 * в вашем index.js, которая возвращает id залогиненного пользователя (или null).
 */

export function renderPostsPageComponent({ appEl, postsForRender } = {}) {
  const dataPosts = postsForRender || posts || [];

  const postsHtml = dataPosts
    .map((post) => {
      const user = post.user || {};
      const createdAt = post.createdAt
        ? new Date(post.createdAt).toLocaleString()
        : "";
      const myId = (typeof getCurrentUserId === "function" && getCurrentUserId()) || "";
      const isLiked = post.likes && post.likes.includes(myId);
      const likesCount = post.likes ? post.likes.length : 0;

      return `
        <li class="post" data-post-id="${post._id || ""}">
          <div class="post-header" data-user-id="${(user && user._id) || ""}">
            <img src="${(user && user.imageUrl) || "./assets/images/default-user.jpg"}" class="post-header__user-image" />
            <p class="post-header__user-name">${(user && user.name) || "Неизвестный"}</p>
          </div>

          <div class="post-image">
            <img src="${post.imageUrl || ""}" class="post-image__img" />
          </div>

          <div class="post-body">
            <div class="post-description">${post.description || ""}</div>

            <div class="post-actions">
              <button class="like-button" data-post-id="${post._id || ""}" aria-label="like-button">
                <img src="${isLiked ? "./assets/images/like-active.svg" : "./assets/images/like-not-active.svg"}" />
              </button>
              <span class="likes-count" data-post-id="${post._id || ""}">${likesCount}</span>
            </div>

            <p class="post-created-at">${createdAt}</p>
          </div>
        </li>
      `;
    })
    .join("");

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">${postsHtml}</ul>
    </div>
  `;

  appEl.innerHTML = appHtml;

  // header
  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  // переход на страницу пользователя по клику на header (делегирование)
  document.querySelectorAll(".post-header").forEach((el) => {
    el.addEventListener("click", () => {
      const userId = el.dataset.userId;
      if (!userId) return;
      goToPage(USER_POSTS_PAGE, { userId });
    });
  });

  // лайки — обработка кнопок
  document.querySelectorAll(".like-button").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      event.stopPropagation();
      const postId = btn.dataset.postId;
      if (!postId) return;
      try {
        const token = typeof getToken === "function" ? getToken() : null;
        if (!token) {
          // Предложим авторизоваться
          alert("Требуется авторизация, пожалуйста, войдите.");
          goToPage("/auth"); // если у вас другой роут — поправьте
          return;
        }

        // Определить текущее состояние лайка локально (по картинке)
        const img = btn.querySelector("img");
        const isLikedNow = img && img.getAttribute("src").includes("like-active");

        if (isLikedNow) {
          // удалить лайк
          await removeLike({ token, postId });
        } else {
          // добавить лайк
          await addLike({ token, postId });
        }

        // Обновляем общий posts (лучше — перезапросить с сервера)
        // Попытка: если у вас есть функция getPosts в index.js, просто перезапросите и перерисуйте страницу
        if (typeof goToPage === "function") {
          // безопасный способ: переход на ту же страницу (POSTS_PAGE) с перерисовкой
          goToPage(POSTS_PAGE);
        } else {
          // иначе просто меняем картинку и счётчик локально
          const countEl = document.querySelector(`.likes-count[data-post-id="${postId}"]`);
          if (countEl) {
            const current = parseInt(countEl.textContent || "0", 10);
            countEl.textContent = isLikedNow ? Math.max(0, current - 1) : current + 1;
          }
          if (img) {
            img.src = isLikedNow ? "./assets/images/like-not-active.svg" : "./assets/images/like-active.svg";
          }
        }
      } catch (err) {
        console.error("Ошибка при переключении лайка", err);
        alert("Не удалось обновить лайк. Попробуйте ещё раз.");
      }
    });
  });
}
