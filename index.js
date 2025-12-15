import { POSTS_PAGE, ADD_POSTS_PAGE, AUTH_PAGE, USER_POSTS_PAGE, ROOT } from "./routes.js";
import { getPosts, createPost, getUserPosts, addLike, removeLike, loginUser, registerUser } from "./api.js";
import { saveUser, clearUser, getStoredUser, getStoredToken } from "./helpers.js";

import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import { renderHeaderComponent } from "./components/header-component.js";

const appEl = document.getElementById("app");

// состояние
export let posts = [];
export let currentPage = ROOT;
export let currentData = null;

// утилиты для других модулей
export function goToPage(page, data) {
  currentPage = page;
  currentData = data || null;
  renderApp();
}

export function getToken() {
  return getStoredToken();
}

export function getCurrentUserId() {
  const u = getStoredUser();
  if (!u) return null;
  return u && (u.id || u._id) ? (u.id || u._id) : null;
}

// инициализация: загрузить посты
async function loadPosts() {
  try {
    posts = await getPosts();
  } catch (e) {
    console.error("Не удалось загрузить посты", e);
    posts = [];
  }
}

async function renderApp() {
  // общая обёртка: header + content handled by components
  // header component сам рисует в контейнере в компонентах
  // Но здесь обеспечим данные и маршрутизацию

  // ensure posts loaded before rendering main pages that need them
  if (!posts || posts.length === 0) {
    await loadPosts();
  }

  if (currentPage === ROOT || currentPage === POSTS_PAGE) {
    // render posts feed
    const pageContainer = document.createElement("div");
    pageContainer.className = "page-container";
    appEl.innerHTML = "";
    appEl.appendChild(pageContainer);
    renderPostsPageComponent({ appEl: pageContainer });
    return;
  }

  if (currentPage === ADD_POSTS_PAGE) {
    const pageContainer = document.createElement("div");
    pageContainer.className = "page-container";
    appEl.innerHTML = "";
    appEl.appendChild(pageContainer);
    renderAddPostPageComponent({
      appEl: pageContainer,
      user: getStoredUser(),
      onAddPostClick: async ({ description, imageUrl }) => {
        const token = getToken();
        if (!token) {
          alert("Требуется войти в систему");
          goToPage(AUTH_PAGE);
          return;
        }
        try {
          await createPost({ token, description, imageUrl });
          // обновим ленту
          posts = await getPosts();
          goToPage(POSTS_PAGE);
        } catch (err) {
          console.error("Ошибка создания поста", err);
          alert("Не удалось добавить пост: " + (err.message || err));
        }
      },
    });
    return;
  }

  if (currentPage === AUTH_PAGE) {
    const pageContainer = document.createElement("div");
    pageContainer.className = "page-container";
    appEl.innerHTML = "";
    appEl.appendChild(pageContainer);
    renderAuthPageComponent({
      appEl: pageContainer,
      onLogin: async ({ login, password }) => {
        try {
          const user = await loginUser({ login, password });
          saveUser(user);
          // обновим ленту (т.к. isLiked может зависеть от пользователя)
          posts = await getPosts();
          goToPage(POSTS_PAGE);
        } catch (err) {
          alert("Ошибка входа: " + (err.message || err));
        }
      },
      onRegister: async ({ login, name, password }) => {
        try {
          const user = await registerUser({ login, name, password });
          saveUser(user);
          posts = await getPosts();
          goToPage(POSTS_PAGE);
        } catch (err) {
          alert("Ошибка регистрации: " + (err.message || err));
        }
      },
    });
    return;
  }

  if (currentPage === USER_POSTS_PAGE) {
    const pageContainer = document.createElement("div");
    pageContainer.className = "page-container";
    appEl.innerHTML = "";
    appEl.appendChild(pageContainer);
    const userId = currentData && currentData.userId;
    if (!userId) {
      pageContainer.innerHTML = "<p>Пользователь не указан</p>";
      return;
    }
    try {
      const userPosts = await getUserPosts(userId);
      renderPostsPageComponent({ appEl: pageContainer, postsForRender: userPosts });
    } catch (err) {
      // fallback: отфильтровать локально
      const filtered = posts.filter((p) => {
        const uid = (p.user && (p.user.id || p.user._id)) || "";
        return uid === userId;
      });
      renderPostsPageComponent({ appEl: pageContainer, postsForRender: filtered });
    }
    return;
  }

  // fallback
  goToPage(POSTS_PAGE);
}

// render header globally in a top area (the components also render header into header-container inside page containers)
function initGlobalHeader() {
  // insert header at top of body (above app)
  // We'll let each page show own header area — skip global header
}

// start
(async function main() {
  // initial route
  await loadPosts();
  goToPage(POSTS_PAGE);
})();


