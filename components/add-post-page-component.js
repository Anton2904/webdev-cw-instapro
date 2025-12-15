import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick, user }) {
  const appHtml = `
    <div class="header-container"></div>
    <div style="padding:8px;">
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
        <button class="add-post-form__button">Опубликовать</button>
      </div>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({ element: document.querySelector(".header-container") });

  const imageContainer = appEl.querySelector(".add-post-form__image-input");
  const descriptionInput = appEl.querySelector(".add-post-form__description");
  const submitButton = appEl.querySelector(".add-post-form__button");

  let uploadedImageUrl = "";

  renderUploadImageComponent({
    element: imageContainer,
    onImageUrlChange: (url) => {
      uploadedImageUrl = url;
    },
  });

  submitButton.addEventListener("click", async () => {
    const description = descriptionInput.value.trim();
    if (!uploadedImageUrl) {
      alert("Пожалуйста, загрузите изображение (или вставьте URL).");
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
      alert("Ошибка при добавлении поста: " + (err.message || err));
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Опубликовать";
    }
  });
}
