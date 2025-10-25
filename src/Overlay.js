/* 0.0.1 */


( function () {
  const test015 = 'Overlat is loaded';
  'use strict';

  // --- CONFIGURACIÓN INICIAL ---
  const GRID_SIZE = 1000;
//   const CACHE = {}; // simulación de cache local
//   const MOCK_NODES = {
//     "PuenteAlto_2": [
//       { x: 833, y: 110, title: "Nodo A", color: "#ff0000" },
//       { x: 850, y: 120, title: "Nodo B", color: "#00ff00" },
//     ],
//   };

  // --- CREACIÓN DEL OVERLAY --
  const overlay = document.createElement('canvas');
  overlay.id = 'cc-wplace-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.zIndex = '8000';
  overlay.style.pointerEvents = 'none';
  overlay.style.borderRadius = '3px';
  overlay.classList.add('ccwplace-overlay');
  overlay.width = window.innerWidth;
  overlay.height = window.innerHeight;

  // --- INSERCIÓN EN EL DOM ---
  document.body.appendChild(overlay);
  const ctx = overlay.getContext('2d');

  // --- CREACION PANEL DASHBOARD ---
  const panel = document.createElement('div');
  panel.id = 'cc-wplace-panel';
  panel.innerHTML = `
    <style>
      #cc-wplace-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 10px;
        border-radius: 10px;
        font-family: sans-serif;
        z-index: 10000;
      }
      #cc-wplace-panel input, #cc-wplace-panel button {
        margin-top: 5px;
        width: 100%;
      }
    </style>
    <div><b>Wplace City Context</b></div>
    <input type="text" id="credential" placeholder="Enter credential" />
    <button id="run">RUN</button>
  `;
  document.body.appendChild(panel);

  // --- DIBUJAR CUADRÍCULA ---
  function drawGrid() {
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    for (let x = 0; x < overlay.width; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, overlay.height);
      ctx.stroke();
    }
    for (let y = 0; y < overlay.height; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(overlay.width, y);
      ctx.stroke();
    }
  }

  // --- DIBUJAR NODOS ---
  function drawNodes(nodes = []) {
    for (const node of nodes) {
      ctx.fillStyle = node.color || '#ff0000';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = '12px Arial';
      ctx.fillText(node.title || 'Nodo', node.x + 8, node.y + 4);
    }
  }

  // --- RESETEAR OVERLAY ---
  function clearOverlay() {
    ctx.clearRect(0, 0, overlay.width, overlay.height);
  }

  // --- API GLOBAL DEL OVERLAY ---
  window.WplaceOverlay = {
    drawGrid,
    drawNodes,
    clearOverlay,
    ctx,
    overlay,
  };

  // --- AUTOEJECUCIÓN INICIAL ---
  drawGrid();
})();