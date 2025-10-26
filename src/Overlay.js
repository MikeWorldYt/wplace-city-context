export function initOverlay() {
  const panel = document.createElement('div');
  panel.id = 'cc-wplace-panel';
  panel.innerHTML = `
    <div><b>Wplace City Context</b></div>
    <input type="text" id="credential" placeholder="Enter credential" />
    <button id="run">RUN</button>
  `;
  document.body.appendChild(panel);
}