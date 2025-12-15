import { USER_POSTS_PAGE, POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, getToken, getCurrentUserId } from "../index.js";
import { addLike, removeLike } from "../api.js";

export function renderPostsPageComponent({ appEl, postsForRender } = {}) {
  const dataPosts = postsForRender || posts || [];

  const postsHtml = dataPosts
    .map((post) => {
      const user = post.user || {};
      const createdAt = post.createdAt ? new Date(post.createdAt).toLocaleString() : "";
      const myId = (typeof getCurrentUserId === "function" && getCurrentUserId()) || "";
      const isLiked = post.likes && post.likes.some((u) => (u.id || u._id) === myId);
      const likesCount = post.likes ? post.likes.length : 0;

      return `
        <li class="post" data-post-id="${post.id || post._id || ""}">
          <div class="post-header" data-user-id="${(user && (user.id || user._id)) || ""}">
            <img src="${(user && user.imageUrl) || "./assets/images/default-user.jpg"}" class="post-header__user-image" />
            <p class="post-header__user-name">${(user && user.name) || "Неизвестный"}</p>
          </div>

          <div class="post-image">
            <img src="${post.imageUrl || ""}" class="post-image__img" />
          </div>

          <div class="post-body">
            <div class="post-description">${post.description || ""}</div>

            <div class="post-actions">
              <button class="like-button" data-post-id="${post.id || post._id || ""}" aria-label="like-button">
                <img src="${isLiked ? "./assets/images/like-active.svg" : "./assets/images/like-not-active.svg"}" />
              </button>
              <span class="likes-count" data-post-id="${post.id || post._id || ""}">${likesCount}</span>
            </div>

            <p class="post-created-at small">${createdAt}</p>
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

  renderHeaderComponent({ element: document.querySelector(".header-container") });

  document.querySelectorAll(".post-header").forEach((el) => {
    el.addEventListener("click", () => {
      const userId = el.dataset.userId;
      if (!userId) return;
      goToPage(USER_POSTS_PAGE, { userId });
    });
  });

  document.querySelectorAll(".like-button").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      event.stopPropagation();
      const postId = btn.dataset.postId;
      if (!postId) return;
      try {
        const token = typeof getToken === "function" ? getToken() : null;
        if (!token) {
          alert("Требуется войти в систему");
          goToPage("/auth");
          return;
        }

        const img = btn.querySelector("img");
        const isLikedNow = img && img.getAttribute("src").includes("like-active");
        if (isLikedNow) {
          await removeLike({ token, postId });
        } else {
          await addLike({ token, postId });
        }

        // после изменения получим свежие посты и перерисуем
        const { getPosts } = await import("../api.js");
        const fresh = await getPosts();
        // заменим глобальные posts — импортированный модуль index.js держит posts
        // Импортировать posts напрямую здесь рискованно; проще вызвать goToPage на POSTS_PAGE
        goToPage(POSTS_PAGE);
      } catch (err) {
        console.error("Ошибка лайка", err);
        alert("Не удалось обновить лайк");
      }
    });
  });
}
