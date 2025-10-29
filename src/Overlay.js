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

  // Auto Location button functionality
  document.getElementById('btnLoc')?.addEventListener('click', () => {
    const span = document.querySelector('#bm-h');
    if (!span) {
      console.warn('No se encontró el span con coordenadas.');
      return;
    }
    // Extract coordinates from the text
    const text = span.textContent;
    const match = text.match(/Tl X:\s*(\d+),\s*Tl Y:\s*(\d+),\s*Px X:\s*(\d+),\s*Px Y:\s*(\d+)/);
    // Check if coordinates were extracted
    if (!match) {
      console.warn('No se pudieron extraer las coordenadas del texto.');
      return;
    }
    // Extracted coordinates
    const [_, tlx, tly, pxx, pxy] = match;
    document.getElementById('b1').value = tlx;
    document.getElementById('b2').value = tly;
    document.getElementById('b3').value = pxx;
    document.getElementById('b4').value = pxy;
    // Local variables for global use
    window.ccTlx = parseInt(tlx);
    window.ccTly = parseInt(tly);
    window.ccPxx = parseInt(pxx);
    window.ccPxy = parseInt(pxy);
    console.log('WCC:📍 Autolocation:', { ccTlx, ccTly, ccPxx, ccPxy });
  });




}
