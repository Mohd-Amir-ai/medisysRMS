class Waveform {
    constructor(canvas, trace, opts = {}) {
        const rect = canvas.getBoundingClientRect();

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.trace = trace;
        this.ctxtrace = trace.getContext('2d');

        this.w = canvas.width;
        this.h = canvas.height;

        this.wt = trace.width;
        this.ht = trace.height;

        this.baseline = undefined;
        this.baselineProgressX = null;
        this.graphend = null;

        this.padding = 40; // x-axis wali padding

        
        this.bg = opts.bg ?? "#ffffff";
        this.gridColor = opts.gridColor ?? "rgba(0,0,0,0.2)";
        this.traceColor = opts.traceColor ?? "#ff3b3b";
        this.traceWidth = opts.traceWidth ?? 2;

    
        this.samplesPerPixel = opts.samplesPerPixel ?? 1;
        this.maxSamples = this.w * 3;   
        this.buffer = new Float32Array(this.maxSamples);
        this.writeIndex = 0;
        this.count = 0;

        this.scaleMin = opts.scaleMin ?? 0;
        this.scaleMax = opts.scaleMax ?? 50;
        this.sampleRate = opts.sampleRate ?? 100; 

        this.drawLoop();
    }

    pushSamples(arr) {
        arr.forEach(v => {
            this.buffer[this.writeIndex] = v;
            this.writeIndex = (this.writeIndex + 1) % this.maxSamples;
            this.count = Math.min(this.count + 1, this.maxSamples);
        });
    } // circuilar buffer in action here so previues data is override when new one comes maybe its size is a problem

    drawGrid() {
        const ctx = this.ctx;

        ctx.fillStyle = this.bg;

        ctx.fillRect(0, 0, this.w, this.h);

        ctx.lineWidth = 1;
        ctx.strokeStyle = this.gridColor;
        ctx.fillStyle = "#000";
        ctx.font = "14px Inter, Arial";

        const graphW = this.w - this.padding;

        const graphH = this.h - this.padding;
        const x0 = this.padding; 

        ctx.save();
        ctx.translate(x0, 5);

        const yTicks = 10;
        const stepY = graphH / yTicks;
        const range = this.scaleMax - this.scaleMin;
        const vg = [80, 70, 60, 50, 40, 30, 20, 10, 0, '', -20]
        for (let i = 0; i <= yTicks; i++) {
            const y = i * stepY;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(graphW, y);
            ctx.stroke();

            if (vg[i] == 10) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#11111190";

            }
            else {

                ctx.strokeStyle = "#00000071";
                ctx.lineWidth = 1;

            }


            ctx.fillText(vg[i], -40, y + 4);

        }

        const xticks = 8;
        const stepX = graphW / xticks;
        for (let j = 0; j <= xticks; j++) {
            const x = j * stepX;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, graphH);
            ctx.stroke();
        };

        ctx.beginPath();
        ctx.moveTo(1, 0);
        ctx.lineTo(1, graphH);
        ctx.stroke();
        ctx.fillText("Time (s)", 10 + graphW - 80, graphH + 15); 

        ctx.restore();
    }


    drawTrace() {
        const ctx = this.ctxtrace;
        const canvas = this.trace
        const graphW = this.w - this.padding;
        const graphH = this.h - this.padding;
        const graphLeft = 40;
        const graphTop = 5;
        let stopBlank = false;


        function Cmh20ToPixel(value, scaleMin, scaleMax, graphTop, graphH) {
            const range = scaleMax - scaleMin;
            let normalized = (value - scaleMin) / range;
            normalized = Math.max(0, Math.min(1, normalized));
            const y = graphTop + graphH - (normalized * graphH);
            return y;
        }



        this.baseline = Cmh20ToPixel(0, -20, 80, graphTop, graphH);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'blue';

        setTimeout(() => {
            console.log('after 3 sec');
            stopBlank = !stopBlank;
            this.playSamples(time, pressure, 1.0);
        }, 2000);

        if (this.baselineProgressX == null) this.baselineProgressX = 40; 
        if (this.lastTime == null) this.lastTime = performance.now();

        const blankLine = () => {
            const startX = 60;
            const endX = startX + graphW;

            const now = performance.now();
            const dt = (now - this.lastTime) / 1000;
            this.lastTime = now;

            const speed = 40;

            if (stopBlank) {
                showData(this.baselineProgressX, this.baseline, endX);
                return 'Exit code 0x5';
            }
            this.baselineProgressX += speed * dt;

            if (this.baselineProgressX > endX) {
                this.baselineProgressX = endX;
            }

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#00aaff";
            ctx.moveTo(startX, this.baseline);
            ctx.lineTo(this.baselineProgressX, this.baseline);
            ctx.stroke();

            if (this.baselineProgressX < endX) {
                requestAnimationFrame(blankLine);
            }
        };

        blankLine();


        //ima making this for simulation only NOT real brother
        let currentPr = 0;
        let targetPr = 40;
        let speed = 30;


        // --- config ---
        const timeWindow = 8.0;
        const samples = [];
        let running = false;

        function timeToPixel(t, tMin, tMax, graphLeft, graphW) {
            const range = tMax - tMin;
            if (!(range > 0)) return graphLeft; // fallback
            let normalized = (t - tMin) / range;
            normalized = Math.max(0, Math.min(1, normalized));
            return graphLeft + normalized * graphW;
        }

        const time = [0.0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14, 0.16, 0.18, 0.2, 0.22, 0.24, 0.26, 0.28, 0.3, 0.32, 0.34, 0.36, 0.38, 0.4, 0.42, 0.44, 0.46, 0.48, 0.5, 0.52, 0.54, 0.56, 0.58, 0.6, 0.62, 0.64, 0.66, 0.68, 0.7, 0.72, 0.74, 0.76, 0.78, 0.8, 0.82, 0.84, 0.86, 0.88, 0.9, 0.92, 0.94, 0.96, 0.98, 1.0, 1.02, 1.04, 1.06, 1.08, 1.1, 1.12, 1.14, 1.16, 1.18, 1.2, 1.22, 1.24, 1.26, 1.28, 1.3, 1.32, 1.34, 1.36, 1.38, 1.4, 1.42, 1.44, 1.46, 1.48, 1.5, 1.52, 1.54, 1.56, 1.58, 1.6, 1.62, 1.64, 1.66, 1.68, 1.7, 1.72, 1.74, 1.76, 1.78, 1.8, 1.82, 1.84, 1.86, 1.88, 1.9, 1.92, 1.94, 1.96, 1.98, 2.0, 2.02, 2.04, 2.06, 2.08, 2.1, 2.12, 2.14, 2.16, 2.18, 2.2, 2.22, 2.24, 2.26, 2.28, 2.3, 2.32, 2.34, 2.36, 2.38, 2.4, 2.42, 2.44, 2.46, 2.48, 2.5, 2.52, 2.54, 2.56, 2.58, 2.6, 2.62, 2.64, 2.66, 2.68, 2.7, 2.72, 2.74, 2.76, 2.78, 2.8, 2.82, 2.84, 2.86, 2.88, 2.9, 2.92, 2.94, 2.96, 2.98, 3.0, 3.02, 3.04, 3.06, 3.08, 3.1, 3.12, 3.14, 3.16, 3.18, 3.2, 3.22, 3.24, 3.26, 3.28, 3.3, 3.32, 3.34, 3.36, 3.38, 3.4, 3.42, 3.44, 3.46, 3.48, 3.5, 3.52, 3.54, 3.56, 3.58, 3.6, 3.62, 3.64, 3.66, 3.68, 3.7, 3.72, 3.74, 3.76, 3.78, 3.8, 3.82, 3.84, 3.86, 3.88, 3.9, 3.92, 3.94, 3.96, 3.98, 4.0, 4.02, 4.04, 4.06, 4.08, 4.1, 4.12, 4.14, 4.16, 4.18, 4.2, 4.22, 4.24, 4.26, 4.28, 4.3, 4.32, 4.34, 4.36, 4.38, 4.4, 4.42, 4.44, 4.46, 4.48, 4.5, 4.52, 4.54, 4.56, 4.58, 4.6, 4.62, 4.64, 4.66, 4.68, 4.7, 4.72, 4.74, 4.76, 4.78, 4.8, 4.82, 4.84, 4.86, 4.88, 4.9, 4.92, 4.94, 4.96, 4.98, 5.0, 5.02, 5.04, 5.06, 5.08, 5.1, 5.12, 5.14, 5.16, 5.18, 5.2, 5.22, 5.24, 5.26, 5.28, 5.3, 5.32, 5.34, 5.36, 5.38, 5.4, 5.42, 5.44, 5.46, 5.48, 5.5, 5.52, 5.54, 5.56, 5.58, 5.6, 5.62, 5.64, 5.66, 5.68, 5.7, 5.72, 5.74, 5.76, 5.78, 5.8, 5.82, 5.84, 5.86, 5.88, 5.9, 5.92, 5.94, 5.96, 5.98, 6.0, 6.02, 6.04, 6.06, 6.08, 6.1, 6.12, 6.14, 6.16, 6.18, 6.2, 6.22, 6.24, 6.26, 6.28, 6.3, 6.32, 6.34, 6.36, 6.38, 6.4, 6.42, 6.44, 6.46, 6.48, 6.5, 6.52, 6.54, 6.56, 6.58, 6.6, 6.62, 6.64, 6.66, 6.68, 6.7, 6.72, 6.74, 6.76, 6.78, 6.8, 6.82, 6.84, 6.86, 6.88, 6.9, 6.92, 6.94, 6.96, 6.98, 7.0, 7.02, 7.04, 7.06, 7.08, 7.1, 7.12, 7.14, 7.16, 7.18, 7.2, 7.22, 7.24, 7.26, 7.28, 7.3, 7.32, 7.34, 7.36, 7.38, 7.4, 7.42, 7.44, 7.46, 7.48, 7.5, 7.52, 7.54, 7.56, 7.58, 7.6, 7.62, 7.64, 7.66, 7.68, 7.7, 7.72, 7.74, 7.76, 7.78, 7.8, 7.82, 7.84, 7.86, 7.88, 7.9, 7.92, 7.94, 7.96, 7.98, 8.0, 8.02, 8.04, 8.06, 8.08, 8.1, 8.12, 8.14, 8.16, 8.18, 8.2, 8.22, 8.24, 8.26, 8.28, 8.3, 8.32, 8.34, 8.36, 8.38, 8.4, 8.42, 8.44, 8.46, 8.48, 8.5, 8.52, 8.54, 8.56, 8.58, 8.6, 8.62, 8.64, 8.66, 8.68, 8.7, 8.72, 8.74];

        const pressure = [0, 6.2, 7.4, 9.1, 11.0, 13.0, 15.0, 17.0, 19.0, 20.5, 22.0, 23.0, 23.8, 24.5, 25.0, 25.0, 25.0, 24.8, 24.5, 23.0, 21.2, 19.0, 17.0, 15.2, 13.8, 12.5, 11.2, 10.0, 9.0, 8.2, 7.5, 6.8, 6.2, 5.8, 5.5, 5.2, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5, 6.3, 7.6, 9.4, 11.4, 13.5, 15.7, 17.8, 19.8, 21.5, 23.0, 24.0, 24.8, 25.0, 25.0, 25.0, 24.9, 23.8, 22.0, 20.0, 18.0, 16.5, 15.0, 13.8, 12.4, 11.0, 10.0, 9.1, 8.3, 7.6, 6.9, 6.3, 5.8, 5.4, 5.1, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5, 6.1, 7.3, 9.2, 11.2, 13.4, 15.5, 17.6, 19.6, 21.3, 22.6, 23.5, 24.5, 25.0, 25.0, 25.0, 24.8, 23.2, 21.5, 19.5, 17.8, 16.0, 14.5, 13.2, 12.0, 11.0, 10.0, 9.0, 8.2, 7.4, 6.8, 6.2, 5.8, 5.4, 5.1, 5.0, 5.0, 5.0];

        this.ps = (tSec, pressure) => {
            if (pressure === undefined) {
                pressure = tSec;
                tSec = performance.now() / 1000;
            }
            samples.push({ t: tSec, y: pressure });
        };

        let sweepActive = false;
        let sweepDuration = 1.0; 


        this.playSamples = (timeArr, pressureArr, speedFactor = 1.0) => {
            if (!timeArr || timeArr.length === 0) return;

            const base = timeArr[0];
            sweepDuration = Math.max(0.001, (timeArr[timeArr.length - 1] - base) / speedFactor);

            const wallBase = performance.now() / 1000 + 0.02;
            let idx = 0;
            console.log('playSamples sweepDuration=', sweepDuration.toFixed(3), 'wallBase=', wallBase.toFixed(3));

            const step = () => {
                const now = performance.now() / 1000;

                while (idx < timeArr.length) {
                    const virtual = (timeArr[idx] - base) / speedFactor;
                    const scheduledWall = wallBase + virtual;
                    if (scheduledWall <= now) {
                        if (!sweepActive) {
                            sweepActive = true;
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            ctx.beginPath();
                            ctx.lineWidth = 1;
                            ctx.strokeStyle = "#00aaff";
                            ctx.moveTo(graphLeft, this.baseline);
                            ctx.lineTo(graphLeft + graphW, this.baseline);
                            ctx.stroke();
                        }

                        const rel = (timeArr[idx] - base) / speedFactor;
                        samples.push({ rel: rel, y: pressureArr[idx] });
                        idx++;
                    } else break;
                }

                if (idx < timeArr.length) requestAnimationFrame(step);
                else console.log('playSamples: scheduling finished, samples queued=', samples.length);
            };

            requestAnimationFrame(step);
        };



        // for (let i = 0; i < time.length; i++) {
        //     this.ps(time[i], pressure[i]);
        // }

        const showData = (BlankX, BlankY, endX, tArg, pressureArg) => {
            if (tArg != null && pressureArg != null) {
                samples.push({ rel: tArg, y: pressureArg });
                if (!sweepActive) {
                    sweepActive = true;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.beginPath();
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "#00aaff";
                    ctx.moveTo(graphLeft, BlankY);
                    ctx.lineTo(graphLeft + graphW, BlankY);
                    ctx.stroke();
                }
            }


            if (samples.length === 0 && !sweepActive) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#00aaff";
                ctx.moveTo(graphLeft, BlankY);
                ctx.lineTo(graphLeft + graphW, BlankY);
                ctx.stroke();

                requestAnimationFrame(() => showData.call(this, BlankX, BlankY, endX));
                return;
            }

            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#00aaff";
            ctx.moveTo(graphLeft, BlankY);
            ctx.lineTo(graphLeft + graphW, BlankY);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#FF4040";
            let started = false;
            let prevRel = null;
            for (let i = 0; i < samples.length; ++i) {
                const s = samples[i];
                const rel = Math.max(0, Math.min(sweepDuration, s.rel));
                const x = graphLeft + (rel / sweepDuration) * graphW;
                const y = Cmh20ToPixel(s.y, -20, 80, graphTop, graphH);

                if (!started || prevRel === null || (rel - prevRel) > 0.25) {
                    ctx.moveTo(x, y);
                    started = true;
                } else {
                    ctx.lineTo(x, y);
                }
                prevRel = rel;
            }
            ctx.stroke();

            if (sweepActive && samples.length > 0) {
                const lastRel = samples[samples.length - 1].rel;
                if (lastRel >= sweepDuration - 1e-6) {
                    sweepActive = false;
                    console.log('complete graph');
                }
            }
            requestAnimationFrame(() => showData.call(this, BlankX, BlankY, endX));
        };

    }



    drawLoop = () => {
        this.drawGrid();
        this.drawTrace();
    };
}


const canvas = document.getElementById('waveform');
const waves = document.getElementById('waves');

function resizeCanvas() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    canvas.width = displayWidth;
    canvas.height = displayHeight;
}
function resizewaves() {
    const displayWidth = waves.clientWidth;
    const displayHeight = waves.clientHeight;
    waves.width = displayWidth;
    waves.height = displayHeight;
}

resizeCanvas();
resizewaves();

window.addEventListener('resize', resizeCanvas);
window.addEventListener('resize', resizewaves);

const wf = new Waveform(canvas, waves, {
    samplesPerPixel: 1,   
    scaleMin: 0,          
    scaleMax: 50,        
    traceColor: '#ef4444',
    bg: '#ffffff'         
});

