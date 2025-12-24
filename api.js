// Замени personalKey на свой, чтобы получить независимый от других набор данных.
// "боевая" версия Instapro лежит в ключе prod.
// Документация: https://wedev-api.sky.pro/api/v1/:personal-key/instapro
const personalKey = "prod";

const baseHost = "https://wedev-api.sky.pro";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }

      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

export function getUserPosts({ userId, token }) {
  return fetch(`${postsHost}/user-posts/${userId}`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      return response.json();
    })
    .then((data) => data.posts);
}

// Создание поста.
// В ответах API у поста используется поле `description`, поэтому при создании отправляем `description`.
export function addPost({ description, imageUrl, token }) {
  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
     
    },
    body: JSON.stringify({ description, imageUrl }),
  }).then(async (response) => {
    // fetch не падает на 4xx/5xx, поэтому делаем нормальную обработку ошибок
    if (response.ok) {
      return response.json();
    }

    let details = "";
    try {
      const data = await response.json();
      details = data?.error || data?.message || JSON.stringify(data);
    } catch (e) {
      try {
        details = await response.text();
      } catch (e2) {
        details = "";
      }
    }

    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }

    // Показываем подробности сервера, чтобы быстрее отладить причину 400
    throw new Error(details ? `Ошибка публикации (${response.status}): ${details}` : `Ошибка публикации (${response.status})`);
  });
}

export function likePost({ postId, token }) {
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    return response.json();
  });
}

export function dislikePost({ postId, token }) {
  return fetch(`${postsHost}/${postId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    return response.json();
  });
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    return response.json();
  });
}

// Загружает картинку в облако, возвращает url загруженной картинки
export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    return response.json();
  });
}
