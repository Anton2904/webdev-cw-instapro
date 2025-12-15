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
      const countEl = document.querySelector(`.likes-count[data-post-id="${postId}"]`);

      // 1. Мгновенно меняем UI (оптимистичное обновление)
      if (img) {
        img.src = isLikedNow ? "./assets/images/like-not-active.svg" : "./assets/images/like-active.svg";
      }
      if (countEl) {
        const current = parseInt(countEl.textContent || "0", 10);
        countEl.textContent = isLikedNow ? Math.max(0, current - 1) : current + 1;
      }

      // 2. Отправляем запрос к API
      let updatedPost;
      if (isLikedNow) {
        updatedPost = await removeLike({ token, postId });
      } else {
        updatedPost = await addLike({ token, postId });
      }

      // 3. Обновляем локальные данные
      if (updatedPost && window.posts) {
        const postIndex = window.posts.findIndex(p => 
          (p.id || p._id) === postId
        );
        if (postIndex !== -1) {
          window.posts[postIndex] = updatedPost;
        }
      }

    } catch (err) {
      console.error("Ошибка лайка", err);
      alert("Не удалось обновить лайк");
      // Откатываем UI, если API запрос не удался
      goToPage(POSTS_PAGE); // или window.location.reload();
    }
  });
});
}
