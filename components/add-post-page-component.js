import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

/**
 * Страница добавления поста
 */
export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";

  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>

        <div class="form">
          <h3 class="form-title">Новый пост</h3>

          <div class="form-inputs">
            <div class="upload-image-container"></div>
            <textarea id="description-input" class="input" rows="4" placeholder="Описание"></textarea>
            <div class="form-error"></div>
            <button class="button" id="add-button">Опубликовать</button>
          </div>
        </div>
      </div>
    `;

    appEl.innerHTML = appHtml;

    const setError = (message) => {
      appEl.querySelector(".form-error").textContent = message;
    };

    renderHeaderComponent({ element: document.querySelector(".header-container") });

    renderUploadImageComponent({
      element: appEl.querySelector(".upload-image-container"),
      onImageUrlChange(newImageUrl) {
        imageUrl = newImageUrl;
      },
    });

    document.getElementById("add-button").addEventListener("click", () => {
      setError("");
      const description = document.getElementById("description-input").value.trim();

      if (!imageUrl) {
        setError("Не выбрана фотография");
        return;
      }

      if (!description) {
        setError("Введите описание");
        return;
      }

      onAddPostClick({ description, imageUrl });
    });
  };

  render();
}
