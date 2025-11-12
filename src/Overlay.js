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
    const script = document.createElement('script');
    script.textContent = `
      (() => {
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
          const url = args[0];
          const response = await originalFetch(...args);
          const rawUrl = typeof args[0] === 'string' ? args[0] : args[0].url;
          // ** Filter for pixel data requests ** //
          if (typeof rawUrl === 'string' && rawUrl.includes('/pixel/')) {
            try {
              const pixelMatch = url.match(/pixel\\/(\\d+)\\/(\\d+)\\?x=(\\d+)&y=(\\d+)/);
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
      })();
    `;
    document.documentElement.appendChild(script);
  }
  injectFetchHook()

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

  // Ask button functionality
  document.getElementById('btnAsk')?.addEventListener('click', async () => {
    const tlx = window.ccTlx;
    const tly = window.ccTly;
    const pxx = window.ccPxx;
    const pxy = window.ccPxy;

    if ([tlx, tly, pxx, pxy].some(v => typeof v !== 'number' || isNaN(v))) {
      console.warn('WCC:❌ Coordenadas inválidas o no definidas.');
      return;
    }

    const url = `https://wplace-city-context.vercel.app/api/data?mode=read&tlx=${tlx}&tly=${tly}&pxx=${pxx}&pxy=${pxy}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('WCC:📬 Server Response:', data);
    } catch (err) {
      console.error('WCC:❌ Error:', err);
    }
  });



}
