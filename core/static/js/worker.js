const edate = document.getElementById('date');
const etime = document.getElementById('time');
const cdatemap = ['Jan', 'Feb', 'March', 'April', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
const BASE_DIR = window.location.origin;
const highPressureAlarm = document.getElementById('highPressureAlarm');
const AlarmCodes = { 'P_HIGH': highPressureAlarm, 'P_LOW': null, 'H_FIO2': null, 'H_RR': null };
const AUDIO_FLAG_KEY = 'medisys_audio_allowed';
const AUDIO_FLAG_PERSIST = 'medisys_audio_allowed_persist';
const ALARM_AUDIO_SRC = '/mnt/data/high_pressure_alarm_v2.wav';
let audioUnlocked = false;
let activeAlarms = [];
let ad = new Audio(HIGH_PRESSURE_ALARM_URL);
ad.preload = 'auto';
ad.loop = true;
const cdate = () => {
    const cdatenow = new Date();

    const year = cdatenow.getFullYear();
    const monthN = cdatenow.getMonth();
    const month = cdatemap[monthN]
    const day = cdatenow.getDate();
    const hours = cdatenow.getHours().toString().padStart(2, '0');
    const minutes = cdatenow.getMinutes().toString().padStart(2, '0');
    const seconds = cdatenow.getSeconds().toString().padStart(2, '0');
    const dateString = `${month} ${day} , ${year}`;
    const timeString = `${hours}:${minutes}:${seconds}`;

    edate.textContent = dateString;
    etime.textContent = timeString;
}

cdate()
setInterval(cdate, 1000);


const getletestAlarm = () => {

    let p = fetch(`${BASE_DIR}/api/alrms-up/`, { method: 'POST' });
    p.then((r) => {
        return r.json()
    }).then((data) => {
        console.error(data?.severity, data?.alarm_code, data?.timestamp);
        if (data?.severity == "critical" || data?.priority == 1) {
            let alarmcode = data?.alarm_code;
            if (alarmcode in activeAlarms) {
                console.info(`The Alarm : ${alarmcode} is set to Active`);

                return false
            }
            activeAlarms.push(alarmcode);

            e = AlarmCodes[alarmcode];
            const e2 = e.children[1];
            const e3 = e.children[2];
            e.classList.replace('alarm--normal', 'alarm--active');
            if (!audioUnlocked) {
                console.error("Please click OK to enable sound first.");
            }
            else {
                ad.play().catch(err => console.error("play blocked:", err));
            }
            if (e2) {
                e2.textContent = data?.alarm_q;

            }
            if (e3) {
                e3.textContent = data?.timestamp;
            }
        }

    }).catch((err) => {
        console.error(err);
    })

}


window.audioUnlocked = false;

const overlay = document.createElement('div');
overlay.id = 'audio-unlock-overlay';
overlay.style.cssText = `
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.5);
    z-index: 99999;
`;


overlay.innerHTML = `
  <div role="dialog" aria-modal="true" style="background:#fff;padding:20px;border-radius:10px;max-width:420px;text-align:center;font-family:system-ui;">
    <h3 style="margin:0 0 8px">Enable alarm sound</h3>
    <p style="margin:0 0 12px">This page needs permission to play alarm audio. Click <strong>Enable sound</strong> once to allow alarms to play automatically.</p>
    <button id="enable-sound-btn" style="padding:10px 16px;border-radius:8px;border:none;background:#005266;color:#fff;cursor:pointer;font-weight:600">Enable sound</button>
    <div style="margin-top:10px;font-size:13px;color:#666">If you don't want sound now, press ESC or click outside to continue without audio.</div>
  </div>
`;


overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) {
        overlay.remove();
    }
});

document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
        overlay.remove();
    }
});


if (document.body) {
    document.body.appendChild(overlay);
} else {
    window.addEventListener('DOMContentLoaded', () => document.body.appendChild(overlay));
}

async function attemptAudioUnlock() {
    try {
        const C = window.AudioContext || window.webkitAudioContext;
        if (C) {
            if (!window._medisys_audio_ctx) window._medisys_audio_ctx = new C();
            if (window._medisys_audio_ctx.state === 'suspended') {
                await window._medisys_audio_ctx.resume();
            }
        }
    } catch (e) {
        console.warn('AudioContext resume error:', e);
    }

    try {
        await ad.play();
        ad.pause();
        try { ad.currentTime = 0; } catch (e) { }
        window.audioUnlocked = true;
        console.log('Audio unlocked via button.');
        audioUnlocked = true;
        overlay.remove();
        return true;
    } catch (err) {
        console.warn('ad.play() still blocked:', err);
        return false;
    }
}

// button handler
document.addEventListener('click', (ev) => {
    if (ev.target && ev.target.id === 'enable-sound-btn') {
        ev.preventDefault();
        attemptAudioUnlock().then(ok => {
            if (!ok) {
                if (!document.getElementById('audio-unlock-hint')) {
                    const hint = document.createElement('div');
                    hint.id = 'audio-unlock-hint';
                    hint.style.cssText = 'margin-top:12px;color:#b00;font-weight:600';
                    hint.textContent = 'Audio still blocked click again !';
                    overlay.querySelector('div').appendChild(hint);
                }
            }
        });
    }
});

// helper
function playAlarmSafely() {
    if (!window.audioUnlocked) {
    
        if (!document.body.contains(overlay)) document.body.appendChild(overlay);
        return;
    }
    try { ad.currentTime = 0; } catch (e) { }
    ad.play().catch(err => console.error('Alarm play blocked:', err));
}



setInterval(getletestAlarm, 6500);