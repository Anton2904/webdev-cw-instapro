import { renderHeaderComponent } from "./header-component.js";

export function renderAuthPageComponent({ appEl, onLogin, onRegister }) {
  const appHtml = `
    <div class="header-container"></div>
    <div style="padding:8px;">
      <div class="center">
        <h2>Вход / Регистрация</h2>
      </div>

      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:260px;">
          <h3>Войти</h3>
          <div>
            <input class="input-inline login-login" placeholder="Логин" />
          </div>
          <div style="margin-top:8px;">
            <input type="password" class="input-inline login-password" placeholder="Пароль" />
          </div>
          <div style="margin-top:8px;">
            <button class="login-button">Войти</button>
          </div>
        </div>

        <div style="flex:1;min-width:260px;">
          <h3>Регистрация</h3>
          <div>
            <input class="input-inline reg-login" placeholder="Логин" />
          </div>
          <div style="margin-top:8px;">
            <input class="input-inline reg-name" placeholder="Имя" />
          </div>
          <div style="margin-top:8px;">
            <input type="password" class="input-inline reg-password" placeholder="Пароль" />
          </div>
          <div style="margin-top:8px;">
            <button class="reg-button">Зарегистрироваться</button>
          </div>
        </div>
      </div>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({ element: document.querySelector(".header-container") });

  const loginInput = appEl.querySelector(".login-login");
  const loginPass = appEl.querySelector(".login-password");
  const loginBtn = appEl.querySelector(".login-button");

  const regLogin = appEl.querySelector(".reg-login");
  const regName = appEl.querySelector(".reg-name");
  const regPass = appEl.querySelector(".reg-password");
  const regBtn = appEl.querySelector(".reg-button");

  loginBtn.addEventListener("click", async () => {
    const login = loginInput.value.trim();
    const password = loginPass.value;
    if (!login || !password) {
      alert("Введите логин и пароль");
      return;
    }
    loginBtn.disabled = true;
    try {
      if (typeof onLogin === "function") {
        await onLogin({ login, password });
      }
    } catch (e) {
      alert("Ошибка входа: " + (e.message || e));
    } finally {
      loginBtn.disabled = false;
    }
  });

  regBtn.addEventListener("click", async () => {
    const login = regLogin.value.trim();
    const name = regName.value.trim();
    const password = regPass.value;
    if (!login || !name || !password) {
      alert("Заполните все поля для регистрации");
      return;
    }
    regBtn.disabled = true;
    try {
      if (typeof onRegister === "function") {
        await onRegister({ login, name, password });
      }
    } catch (e) {
      alert("Ошибка регистрации: " + (e.message || e));
    } finally {
      regBtn.disabled = false;
    }
  });
}
