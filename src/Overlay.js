/* 0.0.1 */

(function () {
  'use strict';

  // --- CONFIGURACIÓN ---
  const GRID_SIZE = 1000;
  const overlay = document.createElement('canvas');
  overlay.id = 'wplace-overlay';
  overlay.classList.add('wplace-overlay');
  overlay.width = window.innerWidth;
  overlay.height = window.innerHeight;

  // --- INSERCIÓN EN EL DOM ---
  document.body.appendChild(overlay);
  const ctx = overlay.getContext('2d');

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
