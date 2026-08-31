(function () {
  const heroDate = document.getElementById('heroDate');
  const heroBadgeDate = document.getElementById('heroBadgeDate');
  const heroPlace = document.getElementById('heroPlace');
  const eventPlace = document.getElementById('eventPlace');
  const eventDateEl = document.getElementById('eventDate');
  const eventTimeEl = document.getElementById('eventTime');
  const countdownMessage = document.getElementById('countdownMessage');
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpList = document.getElementById('rsvpList');
  const dateInput = document.getElementById('eventDateTimeInput');
  const saveDateBtn = document.getElementById('saveDateBtn');
  const setNowBtn = document.getElementById('setNow');
  const editDetailsBtn = document.getElementById('editDetails');
  const musicToggle = document.getElementById('musicToggle');
  const weddingMusic = document.getElementById('weddingMusic');

  const STORE_KEY = 'wedding_invite_data_v1';
  const DEFAULT_EVENT = '2026-11-16T11:00';
  const CLIP_START = 0;
  const CLIP_END = 44;
  let countdownTimer = null;
  let fallbackAudio = null;

  function loadStore() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    } catch (error) {
      return {};
    }
  }

  function saveStore(store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  function formatDate(dateValue) {
    return new Date(dateValue).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function formatTime(dateValue) {
    return new Date(dateValue).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  function toInputLocal(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function updateMeta(dateValue, placeValue) {
    const safePlace = placeValue || 'Đang cập nhật địa điểm';
    const dateText = dateValue ? formatDate(dateValue) : '16/11/2026';
    const timeText = dateValue ? formatTime(dateValue) : '11:00';

    if (heroDate) heroDate.textContent = dateText;
    if (heroBadgeDate) heroBadgeDate.textContent = dateText;
    if (heroPlace) heroPlace.textContent = safePlace;
    if (eventPlace) eventPlace.textContent = safePlace;
    if (eventDateEl) eventDateEl.textContent = dateText;
    if (eventTimeEl) eventTimeEl.textContent = timeText;
  }

  function startCountdown(targetDate) {
    if (countdownTimer) clearInterval(countdownTimer);

    function update() {
      const now = new Date();
      const diff = new Date(targetDate).getTime() - now.getTime();

      if (diff <= 0) {
        if (countdownMessage) countdownMessage.textContent = 'Sự kiện đã diễn ra — hẹn gặp lại!';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (daysEl) daysEl.textContent = days;
      if (hoursEl) hoursEl.textContent = hours;
      if (minutesEl) minutesEl.textContent = minutes;
      if (secondsEl) secondsEl.textContent = seconds;
      if (countdownMessage) countdownMessage.textContent = 'Chúng tôi đang rất mong chờ ngày này.';
    }

    update();
    countdownTimer = setInterval(update, 1000);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      })[char];
    });
  }

  function renderRsvps(list) {
    if (!rsvpList) return;
    rsvpList.innerHTML = '';

    if (!list || list.length === 0) {
      rsvpList.innerHTML = '<div class="rsvp-item"><strong>Chưa có lời chúc nào.</strong><p>Hãy là người đầu tiên gửi lời chúc cho cặp đôi.</p></div>';
      return;
    }

    list.slice().reverse().forEach(function (item) {
      const block = document.createElement('div');
      block.className = 'rsvp-item';
      const time = new Date(item.time).toLocaleString('vi-VN');
      block.innerHTML = `
        <strong>${escapeHtml(item.name)}</strong>
        <small>${time}</small>
        <p>${escapeHtml(item.msg || 'Đã gửi lời chúc.')}</p>
      `;
      rsvpList.appendChild(block);
    });
  }

  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) {
        item.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.16 });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function initMotion() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const heroVisual = document.querySelector('.photo-frame');
    if (!heroVisual) return;

    const handlePointerMove = function (event) {
      const offsetX = (event.clientX / window.innerWidth - 0.5) * 18;
      const offsetY = (event.clientY / window.innerHeight - 0.5) * 18;
      heroVisual.style.transform = `translate3d(${offsetX * 0.7}px, ${offsetY * 0.7}px, 0) rotate(${offsetX * 0.35}deg)`;
    };

    const handleLeave = function () {
      heroVisual.style.transform = '';
    };

    document.addEventListener('pointermove', handlePointerMove);
    heroVisual.addEventListener('pointerleave', handleLeave);
  }

  function stopFallbackAudio() {
    if (!fallbackAudio) return;
    if (fallbackAudio.intervalId) {
      clearInterval(fallbackAudio.intervalId);
      fallbackAudio.intervalId = null;
    }
    if (fallbackAudio.context && fallbackAudio.gainNode) {
      fallbackAudio.gainNode.gain.setValueAtTime(0, fallbackAudio.context.currentTime);
    }
    fallbackAudio.active = false;
  }

  function startFallbackAudio() {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    if (!fallbackAudio) {
      fallbackAudio = {
        context: new AudioContextCtor(),
        gainNode: null,
        intervalId: null,
        active: false
      };
      fallbackAudio.gainNode = fallbackAudio.context.createGain();
      fallbackAudio.gainNode.gain.value = 0.06;
      fallbackAudio.gainNode.connect(fallbackAudio.context.destination);
    }

    if (fallbackAudio.context.state === 'suspended') {
      fallbackAudio.context.resume();
    }

    if (fallbackAudio.intervalId) {
      clearInterval(fallbackAudio.intervalId);
    }

    const notes = [261.63, 329.63, 349.23, 392.0, 349.23, 329.63, 293.66, 329.63];
    let index = 0;
    fallbackAudio.active = true;

    fallbackAudio.intervalId = setInterval(function () {
      if (!fallbackAudio || !fallbackAudio.active) return;
      const osc = fallbackAudio.context.createOscillator();
      const gain = fallbackAudio.context.createGain();
      osc.type = 'sine';
      osc.frequency.value = notes[index % notes.length];
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(fallbackAudio.gainNode);
      const now = fallbackAudio.context.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      index += 1;
    }, 420);
  }

  function setMusicState(isPlaying) {
    if (!musicToggle || !weddingMusic) return;
    musicToggle.classList.toggle('is-muted', !isPlaying);
    musicToggle.textContent = isPlaying ? '❚❚' : '♫';
    musicToggle.setAttribute('aria-label', isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền');
    weddingMusic.muted = !isPlaying;
  }

  function setClipRange(audio) {
    if (!audio || Number.isNaN(audio.duration) || audio.duration <= 0) return;

    if (audio.currentTime < CLIP_START || audio.currentTime >= audio.duration - 0.1) {
      audio.currentTime = CLIP_START;
    }
  }

  function bindMusic() {
    if (!musicToggle || !weddingMusic) return;

    weddingMusic.addEventListener('loadedmetadata', function () {
      weddingMusic.currentTime = CLIP_START;
      setClipRange(weddingMusic);
    });

    weddingMusic.addEventListener('timeupdate', function () {
      if (weddingMusic.duration && weddingMusic.currentTime >= weddingMusic.duration - 0.15) {
        weddingMusic.currentTime = CLIP_START;
      }
    });

    weddingMusic.addEventListener('play', function () {
      setClipRange(weddingMusic);
    });

    setMusicState(false);

    const startMusicFromUserGesture = async function () {
      try {
        if (weddingMusic.readyState === 0) {
          weddingMusic.load();
        }
        if (weddingMusic.currentTime < CLIP_START || weddingMusic.currentTime >= weddingMusic.duration - 0.15) {
          weddingMusic.currentTime = CLIP_START;
        }
        await weddingMusic.play();
        stopFallbackAudio();
        setMusicState(true);
      } catch (error) {
        if (weddingMusic && weddingMusic.paused) {
          startFallbackAudio();
        } else {
          stopFallbackAudio();
        }
        setMusicState(false);
      }
    };

    const openInvitationBtn = document.getElementById('openInvitationBtn');
    if (openInvitationBtn) {
      openInvitationBtn.addEventListener('click', async function (event) {
        event.preventDefault();
        const isOpen = document.body.classList.contains('page-opened');
        if (!isOpen) {
          document.body.classList.remove('page-closed');
          document.body.classList.add('page-opened');
          openInvitationBtn.textContent = 'Đóng thiệp';
          openInvitationBtn.setAttribute('aria-expanded', 'true');
          try {
            if (weddingMusic && weddingMusic.readyState === 0) weddingMusic.load();
            await startMusicFromUserGesture();
          } catch (err) {
            startFallbackAudio();
            setMusicState(false);
          }
          setTimeout(function () {
            const storySection = document.getElementById('story');
            if (storySection) storySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 260);
        } else {
          document.body.classList.remove('page-opened');
          document.body.classList.add('page-closed');
          openInvitationBtn.textContent = 'Mở thiệp';
          openInvitationBtn.setAttribute('aria-expanded', 'false');
          if (weddingMusic && !weddingMusic.paused) {
            weddingMusic.pause();
            stopFallbackAudio();
            setMusicState(false);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    musicToggle.addEventListener('click', async function () {
      try {
        if (weddingMusic.paused) {
          await startMusicFromUserGesture();
        } else {
          weddingMusic.pause();
          stopFallbackAudio();
          setMusicState(false);
        }
      } catch (error) {
        setMusicState(false);
      }
    });
  }

  function init() {
    const store = loadStore();
    const selectedDate = store.dateTime || DEFAULT_EVENT;
    const selectedPlace = store.place || 'Đang cập nhật địa điểm';

    if (dateInput) dateInput.value = selectedDate;
    updateMeta(selectedDate, selectedPlace);
    startCountdown(selectedDate);

    if (store.rsvps) renderRsvps(store.rsvps);
    initReveal();
    initMotion();
    bindMusic();
  }

  if (saveDateBtn) {
    saveDateBtn.addEventListener('click', function () {
      const value = dateInput ? dateInput.value : '';
      if (!value) {
        alert('Vui lòng chọn ngày và giờ cho sự kiện.');
        return;
      }

      const dateObj = new Date(value);
      if (Number.isNaN(dateObj.getTime())) {
        alert('Ngày giờ không hợp lệ.');
        return;
      }

      const store = loadStore();
      store.dateTime = value;
      saveStore(store);
      updateMeta(value, store.place || 'Đang cập nhật địa điểm');
      startCountdown(value);
      alert('Đã lưu thời gian sự kiện thành công.');
    });
  }

  if (setNowBtn) {
    setNowBtn.addEventListener('click', function () {
      if (dateInput) dateInput.value = toInputLocal(new Date());
    });
  }

  if (editDetailsBtn) {
    editDetailsBtn.addEventListener('click', function () {
      const current = (eventPlace && eventPlace.textContent === 'Đang cập nhật địa điểm') ? '' : (eventPlace ? eventPlace.textContent : '');
      const place = prompt('Nhập địa điểm hoặc link Google Maps:', current);
      if (place === null) return;

      const cleaned = place.trim() || 'Đang cập nhật địa điểm';
      const store = loadStore();
      store.place = cleaned;
      saveStore(store);
      updateMeta(store.dateTime || DEFAULT_EVENT, cleaned);
    });
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const name = document.getElementById('rsvpName').value.trim();
      const email = document.getElementById('rsvpEmail').value.trim();
      const msg = document.getElementById('rsvpMessage').value.trim();

      if (!name) {
        alert('Vui lòng nhập tên của bạn.');
        return;
      }

      const store = loadStore();
      store.rsvps = store.rsvps || [];
      store.rsvps.push({
        name: name,
        email: email,
        msg: msg,
        time: new Date().toISOString()
      });
      saveStore(store);
      renderRsvps(store.rsvps);
      rsvpForm.reset();
      alert('Cảm ơn bạn đã gửi lời chúc!');
    });
  }

  init();
})();
