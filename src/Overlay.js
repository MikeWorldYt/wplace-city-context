export function initOverlay() {
  const panel = document.createElement('div');
  panel.id = 'cc-wplace-panel';

  panel.innerHTML = `
    <div style="text-align: center; "><b>Wplace City Context</b></div>
    <div id="cc-win-log">
      <p>Credential:</p>
      <div class="input-wrapper">
        <input type="password" id="credential" placeholder="Enter credential" />
        <img id="toggleEye" 
          src="https://raw.githubusercontent.com/MikeWorldYt/wplace-city-context/main/src/assets/eye-closed.svg"
          style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; cursor: pointer;">
      </div>
      <button id="send-credential">
        Send
      </button>
    </div>
    <div id="cc-win-zone">
    </div>
    <div id="cc-win-info-node">
    </div>
  `;

  document.body.appendChild(panel);

  const input = panel.querySelector('#credential');
  const eye = panel.querySelector('#toggleEye');

  eye.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    eye.src = isHidden
      ? 'https://raw.githubusercontent.com/MikeWorldYt/wplace-city-context/main/src/assets/eye-open.svg'
      : 'https://raw.githubusercontent.com/MikeWorldYt/wplace-city-context/main/src/assets/eye-closed.svg';
  });
}
