const colorDisplay = document.getElementById('colorDisplay');
const soundVisualization = document.getElementById('soundVisualization');

// 颜色配置
const startPurple = [255, 0, 255];
const endGreen = [0, 255, 0];
const endBlue = [0, 0, 255];
const endYellow = [255, 255, 0];
const stepsPerStage = 10;

function generateGradient(startColor, endColor, steps) {
    const gradient = [];
    for (let i = 0; i < steps; i++) {
        const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * (i / steps));
        const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * (i / steps));
        const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * (i / steps));
        const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        gradient.push(hexColor);
    }
    return gradient;
}

const colors = [
    ...generateGradient(startPurple, endGreen, stepsPerStage),
    ...generateGradient(endGreen, endBlue, stepsPerStage),
    ...generateGradient(endBlue, endYellow, stepsPerStage)
];

let volumeHistory = [];
let stableVolumeStartTime = null;
let selectedColor = null;
let mediaRecorder;
let stream;

// 音频处理逻辑
navigator.mediaDevices.getUserMedia({ audio: true })
    .then((audioStream) => {
        stream = audioStream;
        mediaRecorder = new MediaRecorder(stream);

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function updateVolume() {
            analyser.getByteFrequencyData(dataArray);
            let sum = dataArray.reduce((acc, val) => acc + val, 0);
            const averageVolume = sum / bufferLength;

            // 更新可视化
            updateVisualization(dataArray);
            
            // 处理音量历史
            processVolumeHistory(averageVolume);

            requestAnimationFrame(updateVolume);
        }

        function updateVisualization(data) {
            const canvas = document.createElement('canvas');
            canvas.width = soundVisualization.offsetWidth;
            canvas.height = soundVisualization.offsetHeight;
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = canvas.width / bufferLength;
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (data[i] / 255) * canvas.height;
                ctx.fillStyle = `hsl(${(i / bufferLength) * 360}, 100%, 50%)`;
                ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
            }

            soundVisualization.innerHTML = '';
            soundVisualization.appendChild(canvas);
        }

        function processVolumeHistory(volume) {
            volumeHistory.push(volume);
            if (!stableVolumeStartTime) stableVolumeStartTime = Date.now();

            if (Date.now() - stableVolumeStartTime >= 3000) {
                const average = volumeHistory.reduce((a, b) => a + b, 0) / volumeHistory.length;
                const colorIndex = Math.floor((average / 255) * (colors.length - 1));
                
                colorDisplay.style.backgroundColor = colors[colorIndex];
                stopRecording();
                resetVolumeTracking();
            }
        }

        function stopRecording() {
            if (mediaRecorder?.state === 'recording') {
                mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop());
            }
        }

        function resetVolumeTracking() {
            volumeHistory = [];
            stableVolumeStartTime = null;
        }

        updateVolume();
    })
    .catch(error => console.error('Microphone access failed:', error));