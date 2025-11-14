export function initOverlay() {
  const siteCanvas = document.querySelector('#map');
  const layers = document.createElement('div');
  layers.id = 'cc-layers-overlay';
  layers.className = 'h-screen w-screen';
  
  layers.innerHTML = `
    <canvas id="layer-1" class="h-screen w-screen" style="position: absolute; pointer-events: none; z-index: 10;"></canvas>
  `

  siteCanvas.appendChild(layers);

  const layer1 = document.getElementById('layer-1');
  // layer1.width = layer1.offsetWidth;
  // layer1.height = layer1.offsetHeight;

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
      <button id="btnLoc">
        <img src="https://raw.githubusercontent.com/MikeWorldYt/wplace-city-context/main/src/assets/location-pin.svg" 
          alt="Location" width="20" height="20" />
      </button>
      <input type="text" id="b1" placeholder="T1 X" />
      <input type="text" id="b2" placeholder="T1 Y" />
      <input type="text" id="b3" placeholder="Px X" />
      <input type="text" id="b4" placeholder="Px Y" />
      <button id="btnAsk">Ask</button>
    </div>

    <div id="cc-win-info-node">
      <div class="cc-info-node-title">
        <p>Title:</p>
        <span> Nothing selected! </span>
      </div>
      <div class="cc-info-node-date">
        <p>Date:</p>
        <span> </span>
      </div>
      <div class="cc-info-node-comments">
        <span> No data. </span>
      </div>
      <div class="cc-info-node-buttons">
        <button id="info-node-edit-btn">Edit</button>
        <button id="info-node-delete-btn">Delete</button>
        <button id="info-node-close-btn">Close</button>
      </div>
      <div id="cc-log">
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  const input = panel.querySelector('#credential');
  const eye = panel.querySelector('#toggleEye');
  const sendBtn = panel.querySelector('#send-credential');

  // Toggle password visibility
  eye.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    eye.src = isHidden
      ? 'https://raw.githubusercontent.com/MikeWorldYt/wplace-city-context/main/src/assets/eye-open.svg'
      : 'https://raw.githubusercontent.com/MikeWorldYt/wplace-city-context/main/src/assets/eye-closed.svg';
  });

  // Credential validation
  async function validateCredential(credential) {
    try {
      const res = await fetch(`https://wplace-city-context.vercel.app/api/validate?credential=${encodeURIComponent(credential)}`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      return data.valid === true;
      ;
    } catch (err) {
      console.error('[Auth Error]', err);
      return false;
    }
  }

  sendBtn.addEventListener('click', async () => {
    const credential = input.value.trim();
    if (!credential) {
      alert('Please enter a credential.');
      return;
    }

    const valid = await validateCredential(credential);
    if (valid) {
      alert('✅ Credential is valid.');
    } else {
      alert('❌ Invalid credential.');
    }
  });

  // Hook - Intercept fetch requests from the page
  function injectFetchHook() {
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
          const url = args[0];
          const response = await originalFetch(...args);
          const rawUrl = typeof args[0] === 'string' ? args[0] : args[0].url;
  
          // ** Filter to watch Chunks ** //
          CHUNK_WIDTH = 1000;
          CHUNK_HEIGHT = 1000;
          if (typeof rawUrl === 'string' && rawUrl.includes('/files/')) {
            const m = rawUrl.match(/https?:\/\/[^\/]+\/files\/(.+)/);
            const getParts = m ? m[1] : null;
            const parts = getParts.split('/');
            const [chunkY, chunkX] = [parts.at(-2), parts.at(-1).split(".")[0]];
            const canvas = new OffscreenCanvas(CHUNK_WIDTH, CHUNK_HEIGHT);
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            console.log('🧪 WCC: Intercepted Chunk:', { chunkY, chunkX });
            if (chunkY !== undefined && chunkX !== undefined) {
              // ** Copy to Overlay ** //
              const layer1 = document.getElementById('layer-1');
              layer1.width = layer1.offsetWidth;
              layer1.height = layer1.offsetHeight;
              const overlayCtx = layer1.getContext('2d');
              // ** Chunk border
              ctx.lineWidth = 1;
              ctx.strokeStyle = 'red';
              ctx.strokeRect(0, 0, CHUNK_WIDTH, CHUNK_HEIGHT);
              // ** Chunk coords text
              ctx.font = '30px Arial';
              ctx.fillStyle = 'red';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${chunkY}, ${chunkX}`, CHUNK_WIDTH / 2, CHUNK_HEIGHT / 2);

              // ** Draw the chunk 
              // const posX = parseInt(chunkX) % canvas.width;
              // const posY = parseInt(chunkY) % canvas.height;
              const posX = 10;
              const posY = 10;
              // overlayCtx.drawImage(canvas, posX, posY);
              // ** remplace the chunk picture
              const blob = await canvas.convertToBlob();
              return new Response(blob, {
                headers: { "Content-Type": "image/png" }
              });
            }
          }

          // ** Filter for pixel data requests ** //
          if (typeof rawUrl === 'string' && rawUrl.includes('/pixel/')) {
            try {
              const pixelMatch = url.match(/pixel\/(\d+)\/(\d+)\?x=(\d+)&y=(\d+)/);
              if (pixelMatch) {
                const [_, tlx, tly, pxx, pxy] = pixelMatch;
                let container = document.getElementById('cc-log');
                if (!container) {
                  container = document.createElement('div');
                  container.id = 'cc-log';
                  document.body.appendChild(container);
                }
                const coords = { tlx, tly, pxx, pxy };
                for (const key in coords) {
                  let span = container.querySelector('#' + key);
                  if (!span) {
                    span = document.createElement('span');
                    span.id = key;
                    container.appendChild(span);
                  }
                  span.textContent = coords[key];
                }
                // console.log('🧪 WCC: Updated cc-log with coordinates:', coords);
                // ** Store in global variable (for other uses) ** //
                window.ccCoords = {
                  tlx: parseInt(tlx),
                  tly: parseInt(tly),
                  pxx: parseInt(pxx),
                  pxy: parseInt(pxy),
                  timestamp: Date.now()
                };
                console.log('📍 WCC: Captured coordinates:', window.ccCoords);
              }
            } catch (err) {
              console.warn('⚠ WCC: Error when capturing coordinates from fetch:', err);
            }
          }
          return response;
        };
  }
  injectFetchHook()
  const script = document.createElement('script');
  script.textContent = `(${injectFetchHook.toString()})();`;
  document.documentElement.appendChild(script);

  // Button - Autofill Location  functionality
  document.getElementById('btnLoc')?.addEventListener('click', () => {
    // Extract coordinates from the container
    const container = document.getElementById('cc-log');
    const spans = container.querySelectorAll('span');
    const coords = {};
    spans.forEach(span => {
      coords[span.id] = span.textContent;
    });
    // Check if coordinates were extracted
    if (coords.tlx === undefined) {
      console.warn('⚠️ No Coordinates found yet.');
      return;
    }
    // Extracted coordinates
    document.getElementById('b1').value = coords.tlx;
    document.getElementById('b2').value = coords.tly;
    document.getElementById('b3').value = coords.pxx;
    document.getElementById('b4').value = coords.pxy;
    console.log('📍 WCC: Coordinates filled:', coords);
  });

  // Button - Ask Server functionality
  document.getElementById('btnAsk')?.addEventListener('click', async () => {
    const tlx = Number(document.getElementById('b1').value.trim());
    const tly = Number(document.getElementById('b2').value.trim());
    const pxx = Number(document.getElementById('b3').value.trim());
    const pxy = Number(document.getElementById('b4').value.trim());
    const coords = [tlx, tly, pxx, pxy];
    if (coords.some(v => isNaN(v))) {
      console.warn('WCC:❌ Invalid coordinates or not found.');
      return;
    }
    // Server Resquest - Query
    const url = `https://wplace-city-context.vercel.app/api/data?mode=read&tlx=${tlx}&tly=${tly}&pxx=${pxx}&pxy=${pxy}`;
    // Server Response - Data
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('WCC:📬 Server Response:', data);
      // LocalStorage - Merge and Store data in localStorage
      const key = `wcc-data`;
      const zoneKey = `${tlx}-${tly}`;
      const stored = localStorage.getItem(key);
      const collection = stored ? JSON.parse(stored) : {};
      collection[zoneKey] = {
        ...(collection[zoneKey] || {}),
        ...data[zoneKey]
      }
      localStorage.setItem(key, JSON.stringify(collection));
      console.log('💾 WCC: Data merged and saved to localStorage:', collection);
    } catch (err) {
      console.error('WCC:❌ Error:', err);
    }
  });



}
