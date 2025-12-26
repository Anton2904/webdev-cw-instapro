import { POSTS_PAGE, AUTH_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user, pageData } from "../index.js";
import { dislikePost, likePost } from "../api.js";
import { escapeHtml, formatDistanceToNowRu } from "../helpers.js";

export function renderUserPostsPageComponent({ appEl }) {
  const viewedUser = posts[0]?.user;

  const render = () => {
    const headerBlock = viewedUser
      ? `
        <div class="posts-user-header">
          <img src="${viewedUser.imageUrl}" class="posts-user-header__user-image" alt="${escapeHtml(
          viewedUser.name
        )}">
          <p class="posts-user-header__user-name">${escapeHtml(viewedUser.name)}</p>
        </div>
      `
      : `<p>У пользователя пока нет постов</p>`;

    const postsHtml = posts
      .map((post) => {
        const likesCount = post.likes?.length ?? 0;
        const likeIcon = post.isLiked
          ? "./assets/images/like-active.svg"
          : "./assets/images/like-not-active.svg";

        return `
          <li class="post" data-post-id="${post.id}">
            <div class="post-image-container">
              <img class="post-image" src="${post.imageUrl}" alt="${escapeHtml(
          post.description || ""
        )}">
            </div>

            <div class="post-likes">
              <button data-post-id="${post.id}" class="like-button" aria-label="Лайк">
                <img src="${likeIcon}" alt="">
              </button>
              <p class="post-likes-text">
                Нравится: <strong>${likesCount}</strong>
              </p>
            </div>

            <p class="post-text">
              <span class="user-name">${escapeHtml(post.user.name)}</span>
              ${escapeHtml(post.description || "")}
            </p>
            <p class="post-date">${formatDistanceToNowRu(post.createdAt)}</p>
          </li>
        `;
      })
      .join("");

    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>

        <button class="link-button" id="back-button">← Назад</button>
        ${headerBlock}

        <ul class="posts">
          ${postsHtml}
        </ul>
      </div>
    `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({ element: document.querySelector(".header-container") });

    document.getElementById("back-button").addEventListener("click", () => {
      goToPage(POSTS_PAGE);
    });

    for (const likeButton of document.querySelectorAll(".like-button")) {
      likeButton.addEventListener("click", (event) => {
        event.stopPropagation();

        if (!user) {
          goToPage(AUTH_PAGE);
          return;
        }

        const postId = likeButton.dataset.postId;
        const post = posts.find((p) => p.id === postId);
        if (!post) return;

        const token = `Bearer ${user.token}`;
        const request = post.isLiked
          ? dislikePost({ postId, token })
          : likePost({ postId, token });

        likeButton.setAttribute("disabled", true);

        request
          .then(({ post: updatedPost }) => {
            const idx = posts.findIndex((p) => p.id === updatedPost.id);
            if (idx !== -1) {
              posts[idx] = updatedPost;
            }
            render();
          })
          .catch((error) => {
            console.error(error);
            alert(error.message);
          })
          .finally(() => {
            likeButton.removeAttribute("disabled");
          });
      });
    }
  };

  render();
}
