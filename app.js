// Universal URL & LocalStorage Hybrid Sync Engine

function getUrlParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

function getSecretPassword() {
  const urlKey = getUrlParam('key');
  if (urlKey) return urlKey.trim();
  return (localStorage.getItem('couple_app_password') || 'GLOBAL').trim();
}

function getAppKey(key) {
  const pwd = getSecretPassword();
  return `couple_app_${pwd}_${key}`;
}

function saveChoice(key, value) {
  if (key === 'room_password') {
    const cleanPwd = String(value).trim();
    // Creates a unique room signature if one doesn't exist
    let roomSignature = localStorage.getItem('couple_room_sig');
    if (!roomSignature) {
      roomSignature = cleanPwd + '_' + Math.random().toString(36).substring(2, 7);
      localStorage.setItem('couple_room_sig', roomSignature);
    }
    localStorage.setItem('couple_app_password', roomSignature);
  } else if (key === 'user') {
    const isPartner = !!getUrlParam('key');
    const roleKey = isPartner ? 'partner_name' : 'creator_name';
    const nameVal = typeof value === 'object' ? (value.name || JSON.stringify(value)) : String(value);
    
    localStorage.setItem(getAppKey(roleKey), nameVal);
    localStorage.setItem(getAppKey('last_user'), nameVal);
  } else {
    // Edit Cap Enforcer (Max 3 edits per option)
    if (['date', 'vibe', 'activity', 'gift'].includes(key)) {
      const editKey = getAppKey(`${key}_edits`);
      let count = parseInt(localStorage.getItem(editKey) || '0');
      if (count >= 3) {
        showSweetError(`Oopsie! You've already reached the limit of 3 edits for this option 💕`);
        return false;
      }
      localStorage.setItem(editKey, (count + 1).toString());
      
      // Save change alert flag for partner
      localStorage.setItem(getAppKey('partner_updated'), 'true');
      localStorage.setItem(getAppKey('last_change'), key);
    }
    const valToStore = typeof value === 'object' ? JSON.stringify(value) : String(value);
    localStorage.setItem(getAppKey(key), valToStore);
  }
  return true;
}

function getChoice(key) {
  if (key === 'user') {
    const urlUser = getUrlParam('user');
    if (urlUser) return urlUser;

    const creator = localStorage.getItem(getAppKey('creator_name'));
    const partner = localStorage.getItem(getAppKey('partner_name'));

    if (creator && partner) {
      return creator === partner ? `${creator} & ${partner} (You 💕)` : `${creator} & ${partner}`;
    }
    return creator || partner || "Us 💕";
  }

  const urlVal = getUrlParam(key);
  if (urlVal) {
    saveChoice(key, urlVal);
    return urlVal;
  }

  if (key === 'room_password') {
    return getSecretPassword();
  }
  
  const raw = localStorage.getItem(getAppKey(key));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return raw; }
}

function parseValue(val) {
  if (!val) return "Not selected yet";
  if (typeof val === 'object') return val.name || val.title || val.date || JSON.stringify(val);
  return String(val);
}

function formatDDMMYYYY(val) {
  const raw = parseValue(val);
  if (raw === "Not selected yet") return raw;
  const parts = raw.split('-');
  if (parts.length === 3 && parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return raw;
}

function enforceStep(requiredKey, redirectTo) {
  if (!getChoice(requiredKey)) {
    window.location.href = redirectTo;
  }
}

function showSweetError(msg) {
  let box = document.getElementById('sweetErrorBox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'sweetErrorBox';
    box.className = 'sweet-error';
    const container = document.querySelector('.container, .summary-card');
    if (container) container.appendChild(box);
  }
  box.innerText = msg;
  box.style.display = 'block';
}

function checkPartnerNotifications() {
  const updated = localStorage.getItem(getAppKey('partner_updated'));
  if (updated === 'true') {
    const lastChange = localStorage.getItem(getAppKey('last_change')) || 'selections';
    const toast = document.createElement('div');
    toast.className = 'notify-toast';
    toast.innerHTML = `💌 <strong>Sweet Alert!</strong> Your partner updated the <em>${lastChange}</em>! ✨`;
    document.body.appendChild(toast);
    toast.style.display = 'block';
    
    localStorage.removeItem(getAppKey('partner_updated'));
    setTimeout(() => toast.remove(), 6000);
  }
}

function startUniqueAnimation() {
  const container = document.getElementById('heartContainer');
  if (!container) return;
  const emojis = ['💖', '💕', '✨', '🌸', '🍷', '🎉'];
  setInterval(() => {
    const el = document.createElement('div');
    el.classList.add('floating-heart');
    el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 95 + 'vw';
    el.style.fontSize = (Math.random() * 20 + 15) + 'px';
    el.style.animationDuration = (Math.random() * 3 + 4) + 's';
    container.appendChild(el);
    setTimeout(() => el.remove(), 7000);
  }, 1000);
}
