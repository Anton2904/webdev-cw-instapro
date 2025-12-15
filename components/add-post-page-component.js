import { renderHeaderComponent } from "./header-component.js";

export function renderAddPostPageComponent({ appEl, user, onAddPostClick }) {
  appEl.innerHTML = `
    <div class="header-container"></div>
    <div style="padding:8px;">
      <h2>Добавить пост</h2>
      <div>
        <input class="input-inline post-description" placeholder="Описание поста" />
      </div>
      <div style="margin-top:8px;">
        <input class="input-inline post-image" placeholder="Ссылка на изображение (https://...)" />
      </div>
      <div style="margin-top:8px;">
        <button class="add-post-button">Добавить пост</button>
      </div>
    </div>
  `;

  renderHeaderComponent({ element: document.querySelector(".header-container") });

  const descInput = appEl.querySelector(".post-description");
  const imgInput = appEl.querySelector(".post-image");
  const addBtn = appEl.querySelector(".add-post-button");

  addBtn.addEventListener("click", async () => {
    const description = descInput.value.trim();
    const imageUrl = imgInput.value.trim();

    if (!description || !imageUrl) {
      alert("Заполните описание и ссылку на изображение");
      return;
    }

    addBtn.disabled = true;

    try {
      if (typeof onAddPostClick === "function") {
        await onAddPostClick({ description, imageUrl });
      }
      descInput.value = "";
      imgInput.value = "";
    } catch (err) {
      console.error("Ошибка создания поста", err);
      let errorText = "Не удалось добавить пост: ";
      if (err instanceof Error) {
        errorText += err.message;
      } else if (typeof err === "object") {
        errorText += JSON.stringify(err);
      } else {
        errorText += err;
      }
      alert(errorText);
    } finally {
      addBtn.disabled = false;
    }
  });
}
