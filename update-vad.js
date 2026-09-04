const fs = require('fs');
let code = fs.readFileSync('mobile/src/screens/call/LiveCallScreen.jsx', 'utf8');

const regex = /\/\/ Background Magical Translation Engine \(MediaRecorder for STT\)[\s\S]*?\}, \[activeCall, isMuted, speakInCall\]\);/;

const replacement = `// Background Magical Translation Engine (MediaRecorder for STT with VAD)
  useEffect(() => {
    let mediaRecorder = null;
    let stream = null;
    let interval = null;
    let volumeInterval = null;
    let audioCtx = null;

    if (activeCall && activeCall.isTranslated && !isMuted) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
        stream = s;
        
        // VAD (Voice Activity Detection) Setup
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        const microphone = audioCtx.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let isSpeakingInChunk = false;

        volumeInterval = setInterval(() => {
          if (stream.active) {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const average = sum / bufferLength;
            if (average > 15) { // Volume threshold
              isSpeakingInChunk = true;
            }
          }
        }, 100);

        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        
        mediaRecorder.ondataavailable = async (e) => {
          if (e.data.size > 0 && speakInCall && isSpeakingInChunk) {
            const arrayBuffer = await e.data.arrayBuffer();
            speakInCall(null, arrayBuffer);
          }
          isSpeakingInChunk = false; // reset for next chunk
        };

        mediaRecorder.start();
        interval = setInterval(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            mediaRecorder.start();
          }
        }, 4000); // 4-second chunks
      }).catch(err => console.warn("MediaRecorder setup failed:", err));

      return () => {
        if (interval) clearInterval(interval);
        if (volumeInterval) clearInterval(volumeInterval);
        if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
        if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        if (stream) stream.getTracks().forEach(t => t.stop());
      };
    }
  }, [activeCall, isMuted, speakInCall]);`;

code = code.replace(regex, replacement);
fs.writeFileSync('mobile/src/screens/call/LiveCallScreen.jsx', code);
