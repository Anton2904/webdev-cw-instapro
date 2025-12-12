import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

/**
 * renderAddPostPageComponent({ appEl, onAddPostClick, user })
 *
 * onAddPostClick должен быть async function({ description, imageUrl }) => {}
 */

export function renderAddPostPageComponent({ appEl, onAddPostClick, user }) {
  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>

      <form class="add-post-form">
        <h2>Добавить пост</h2>

        <div class="add-post-form__row">
          <label>Фото</label>
          <div class="add-post-form__image-input"></div>
        </div>

        <div class="add-post-form__row">
          <label>Описание</label>
          <textarea class="add-post-form__description" rows="4" placeholder="Напишите описание..."></textarea>
        </div>

        <div class="add-post-form__row">
          <button type="button" class="add-post-form__button">Опубликовать</button>
        </div>
      </form>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  const imageContainer = document.querySelector(".add-post-form__image-input");
  const descriptionInput = document.querySelector(".add-post-form__description");
  const submitButton = document.querySelector(".add-post-form__button");

  let uploadedImageUrl = "";

  // Интеграция с готовым компонентом загрузки изображения
  renderUploadImageComponent({
    element: imageContainer,
    onImageUrlChange: (url) => {
      uploadedImageUrl = url;
    },
  });

  submitButton.addEventListener("click", async () => {
    const description = descriptionInput.value.trim();

    if (!uploadedImageUrl) {
      alert("Пожалуйста, загрузите изображение.");
      return;
    }
    if (!description) {
      alert("Пожалуйста, добавьте описание.");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Публикация...";

    try {
      if (typeof onAddPostClick === "function") {
        await onAddPostClick({ description, imageUrl: uploadedImageUrl });
      }
    } catch (err) {
      console.error("Ошибка при добавлении поста", err);
      alert("Не удалось добавить пост: " + (err.message || err));
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Опубликовать";
    }
  });
}
