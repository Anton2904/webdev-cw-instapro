/**
 * renderUploadImageComponent({ element, onImageUrlChange })
 *
 * element — DOM-элемент контейнер, куда компонент рендерит
 * onImageUrlChange(url) — callback с url загруженного изображения (или data URL)
 */

export function renderUploadImageComponent({ element, onImageUrlChange }) {
  element.innerHTML = `
    <div class="upload-block">
      <div style="display:flex;gap:8px;align-items:center;">
        <input class="input-inline upload-url-input" placeholder="Вставьте ссылку на изображение" />
        <button class="upload-url-button">OK</button>
      </div>
      <div style="margin-top:8px;">
        <label class="small">Или выберите файл (будет использован data URL)</label>
        <input type="file" class="upload-file-input" accept="image/*" />
      </div>
      <div class="upload-preview" style="margin-top:8px;display:none;">
        <img style="max-width:100%;height:auto;border-radius:6px" class="upload-preview-img" />
      </div>
    </div>
  `;

  const urlInput = element.querySelector(".upload-url-input");
  const urlBtn = element.querySelector(".upload-url-button");
  const fileInput = element.querySelector(".upload-file-input");
  const previewBlock = element.querySelector(".upload-preview");
  const previewImg = element.querySelector(".upload-preview-img");

  urlBtn.addEventListener("click", () => {
    const url = urlInput.value.trim();
    if (!url) {
      alert("Введите URL изображения");
      return;
    }
    // Простая проверка URL
    previewImg.src = url;
    previewBlock.style.display = "block";
    if (typeof onImageUrlChange === "function") onImageUrlChange(url);
  });

  fileInput.addEventListener("change", () => {
    const f = fileInput.files && fileInput.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      previewImg.src = dataUrl;
      previewBlock.style.display = "block";
      if (typeof onImageUrlChange === "function") onImageUrlChange(dataUrl);
    };
    reader.readAsDataURL(f);
  });
}
