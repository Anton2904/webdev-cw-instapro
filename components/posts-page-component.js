import { USER_POSTS_PAGE, POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, getToken, getCurrentUserId } from "../index.js";
import { addLike, removeLike } from "../api.js";

// Функция для форматирования времени комментария
function formatCommentDate(dateString) {
  if (!dateString) return "";
  
  const now = new Date();
  const commentDate = new Date(dateString);
  const diffMs = now - commentDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return "только что";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${getNoun(diffMinutes, ["минуту", "минуты", "минут"])} назад`;
  } else if (diffHours < 24) {
    return `${diffHours} ${getNoun(diffHours, ["час", "часа", "часов"])} назад`;
  } else if (diffDays < 7) {
    return `${diffDays} ${getNoun(diffDays, ["день", "дня", "дней"])} назад`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} ${getNoun(diffWeeks, ["неделю", "недели", "недель"])} назад`;
  } else if (diffMonths < 12) {
    return `${diffMonths} ${getNoun(diffMonths, ["месяц", "месяца", "месяцев"])} назад`;
  } else {
    return `${diffYears} ${getNoun(diffYears, ["год", "года", "лет"])} назад`;
  }
}

// Вспомогательная функция для склонения существительных
function getNoun(number, words) {
  number = Math.abs(number) % 100;
  const lastDigit = number % 10;
  
  if (number > 10 && number < 20) return words[2];
  if (lastDigit > 1 && lastDigit < 5) return words[1];
  if (lastDigit === 1) return words[0];
  return words[2];
}

export function renderPostsPageComponent({ appEl, postsForRender } = {}) {
  const dataPosts = postsForRender || posts || [];
  const myId = getCurrentUserId?.();

  const postsHtml = dataPosts
    .map((post) => {
      const user = post.user || {};
      const postId = post.id || post._id;
      const isLiked = post.likes?.some((u) => (u.id || u._id) === myId) || false;

      // Формируем текст лайков в стиле прототипа
      const likesCount = post.likes?.length || 0;
      let likesText = "";
      if (likesCount > 0) {
        const firstUser = post.likes[0].name;
        if (likesCount === 1) {
          likesText = `Нравится: ${firstUser}`;
        } else {
          likesText = `Нравится: ${firstUser} и еще ${likesCount - 1}`;
        }
      }

      // Генерируем HTML для комментариев
      const commentsHtml = post.comments?.map((comment) => {
        const commentUser = comment.user || {};
        const timeAgo = formatCommentDate(comment.createdAt || comment.date);
        
        return `
          <div class="post-comment">
            <div class="comment-user-info">
              <span class="comment-user-name">${commentUser.name || "Неизвестный"}</span>
              <span class="comment-text">${comment.text || ""}</span>
            </div>
            <div class="comment-time">${timeAgo}</div>
          </div>
        `;
      }).join("") || "";

      return `
        <div class="post" data-post-id="${postId}">
          <div class="post__header" data-user-id="${user.id || user._id}">
            <img class="post__avatar" src="${user.imageUrl || "./assets/images/default-user.jpg"}" />
            <div class="post__username">${user.name || "Неизвестный"}</div>
          </div>
          <div class="post-image-container">
          <img class="post__image" src="${post.imageUrl}" />
          </div>
          <div class="post__actions">
            <img
              class="post__like"
              data-post-id="${postId}"
              src="./assets/images/${isLiked ? "like-active.svg" : "like-not-active.svg"}"
            />
            <span class="post__likes-text">${likesText}</span>
          </div>

          <div class="post__description">
            <b>${user.name}</b> ${post.description || ""}
          </div>
          
          ${commentsHtml ? `
            <div class="post-comments">
              ${commentsHtml}
            </div>
          ` : ""}
        </div>
      `;
    })
    .join("");

  appEl.innerHTML = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="posts-container">${postsHtml}</div>
    </div>
  `;

  renderHeaderComponent({ element: appEl.querySelector(".header-container") });

  // Переход к постам пользователя
  appEl.querySelectorAll(".post__header").forEach((el) => {
    el.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, { userId: el.dataset.userId });
    });
  });

  // Лайки с реальным обновлением состояния
  appEl.querySelectorAll(".post__like").forEach((likeEl) => {
    likeEl.addEventListener("click", async (e) => {
      e.stopPropagation();
      const postId = likeEl.dataset.postId;
      const token = getToken();
      if (!token) {
        alert("Нужно войти");
        goToPage("/auth");
        return;
      }

      const liked = likeEl.src.includes("like-active");

      try {
        let updatedPost;
        if (liked) {
          updatedPost = await removeLike({ token, postId });
        } else {
          updatedPost = await addLike({ token, postId });
        }

        // Обновляем UI без полной перезагрузки
        const likesCount = updatedPost.likes?.length || 0;
        let likesText = "";
        if (likesCount > 0) {
          const firstUser = updatedPost.likes[0].name;
          if (likesCount === 1) {
            likesText = `Нравится: ${firstUser}`;
          } else {
            likesText = `Нравится: ${firstUser} и еще ${likesCount - 1}`;
          }
        }

        likeEl.src = liked
          ? "./assets/images/like-not-active.svg"
          : "./assets/images/like-active.svg";

        const likesTextEl = likeEl.nextElementSibling;
        if (likesTextEl) likesTextEl.textContent = likesText;

        // Обновляем локальный массив posts
        const postIndex = posts.findIndex((p) => (p.id || p._id) === postId);
        if (postIndex !== -1) {
          posts[postIndex] = updatedPost;
        }
      } catch (err) {
        console.error("Ошибка лайка", err);
        alert("Не удалось обновить лайк");
      }
    });
  });
}