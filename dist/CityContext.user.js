// ==UserScript==
// @name         City Context
// @namespace    https://github.com/MikeWorldYt/wplace-city-context
// @description  Local Overlay providing city context information for wplace.live
// @author       MikeWorldYt
// @version      0.1.0
// @license      MPL-2.0
// @match        https://wplace.live/*
// @grant        GM_addStyle
// @require      https://raw.githubusercontent.com/MikeWorldYt/wplace-city-context/main/src/overlay.js
// ==/UserScript==

(function () {
  'use strict';

  // --- CONFIGURACIÓN LOCAL ---
  const GRID_SIZE = 1000; // tamaño de bloque base
  const CACHE = {}; // simulación de cache local
  const MOCK_NODES = {
    "PuenteAlto_2": [
      { x: 833, y: 110, title: "Nodo A", color: "#ff0000" },
      { x: 850, y: 120, title: "Nodo B", color: "#00ff00" },
    ],
  };

  // --- CREACIÓN DEL OVERLAY ---
  const overlay = document.createElement('canvas');
  overlay.id = 'wplace-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.zIndex = '9999';
  overlay.style.pointerEvents = 'none';
  overlay.width = window.innerWidth;
  overlay.height = window.innerHeight;
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
  function drawNodes(nodes) {
    for (const node of nodes) {
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = '12px Arial';
      ctx.fillText(node.title, node.x + 8, node.y + 4);
    }
  }

  // --- DASHBOARD BÁSICO ---
  const panel = document.createElement('div');
  panel.id = 'wplace-panel';
  panel.innerHTML = `
    <style>
      #wplace-panel {
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
      #wplace-panel input, #wplace-panel button {
        margin-top: 5px;
        width: 100%;
      }
    </style>
    <div><b>Wplace City Context</b></div>
    <input type="text" id="credential" placeholder="Enter credential" />
    <button id="run">RUN</button>
  `;
  document.body.appendChild(panel);

  // --- EVENTOS ---
  document.getElementById('run').addEventListener('click', () => {
    const cred = document.getElementById('credential').value.trim();
    if (!cred) return alert('Please enter credential');
    localStorage.setItem('wplace_credential', cred);
    const zone = 'PuenteAlto_2';
    if (!CACHE[zone]) CACHE[zone] = MOCK_NODES[zone];
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    drawGrid();
    drawNodes(CACHE[zone]);
  });

  // --- INICIALIZACIÓN ---
  drawGrid();
})();
