/* ==========================================================================
   SWEET COMPLIMENT DICTIONARY
   ========================================================================== */
const SWEET_COMPLIMENTS = {
  date: [
    "Ooh, that date sounds perfect! Marking my calendar right now 💕",
    "Can't wait to count down the days until this special date with you! ✨",
    "That day just instantly became my favorite day of the month 🗓️❤️"
  ],
  vibe: [
    "Ooh, I love this vibe! You have the absolute best taste 🥰",
    "Setting the mood... this is going to be so cozy and romantic ✨",
    "Matching your vibe is my absolute favorite thing to do 💖"
  ],
  drink: [
    "Cheers to us! That drink choice sounds delicious 🥂",
    "Sip sip hooray! Excellent choice, my love 🍹💕",
    "Adding a splash of romance to our date night! 🍷✨"
  ],
  treat: [
    "Mmm, something sweet for someone even sweeter! 🍰❤️",
    "You read my mind! That treat sounds divine 🍨✨",
    "Yum! Saving room for dessert (and lots of kisses)! 🍓🍫"
  ],
  activity: [
    "Yes! Doing this together is going to be so much fun 💖",
    "Making memories with you is my favorite pastime ✨",
    "Best plan ever! I'm so excited to do this with you 🥰"
  ],
  default: [
    "Great choice, my love! Adding it to our special plan 💕",
    "Every choice with you makes this date more magical! ✨",
    "Ooh, I like how you think! Perfect selection 🥰"
  ]
};

function getRandomCompliment(category) {
  const list = SWEET_COMPLIMENTS[category] || SWEET_COMPLIMENTS.default;
  return list[Math.floor(Math.random() * list.length)];
}

function displaySweetToast(message) {
  let toast = document.getElementById('complimentToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'complimentToast';
    toast.className = 'notify-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `💌 <strong>Sweet Choice!</strong> ${message}`;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 4000);
}

/* ==========================================================================
   STORAGE ENGINE & DUPLICATE NAME ISOLATOR
   ========================================================================== */

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
    localStorage.setItem('couple_app_password', cleanPwd);
  } else if (key === 'user') {
    const isPartner = !!getUrlParam('key');
    const roleKey = isPartner ? 'partner_name' : 'creator_name';
    const nameVal = typeof value === 'object' ? (value.name || JSON.stringify(value)) : String(value);
    
    localStorage.setItem(getAppKey(roleKey), nameVal);
    localStorage.setItem(getAppKey('last_user'), nameVal);
  } else {
    if (['date', 'vibe', 'drink', 'treat', 'activity', 'gift'].includes(key)) {
      const editKey = getAppKey(`${key}_edits`);
      let count = parseInt(localStorage.getItem(editKey) || '0');
      if (count >= 3) {
        showSweetError(`Oopsie! You've already reached the limit of 3 edits for this option 💕`);
        return false;
      }
      localStorage.setItem(editKey, (count + 1).toString());
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
    setTimeout(() => toast.remove(), 5000);
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

// Auto Attach Click Listeners to Option Cards for Compliments
document.addEventListener('DOMContentLoaded', () => {
  startUniqueAnimation();
  checkPartnerNotifications();

  const cards = document.querySelectorAll('.option-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const pageCategory = document.body.className.replace('bg-', '') || 'default';
      const optionText = card.querySelector('.text')?.innerText || 'selection';

      if (saveChoice(pageCategory, optionText)) {
        const complimentMsg = getRandomCompliment(pageCategory);
        displaySweetToast(complimentMsg);
      }
    });
  });
});
