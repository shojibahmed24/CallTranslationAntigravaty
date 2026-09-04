const fs = require('fs');
let code = fs.readFileSync('mobile/src/screens/call/LiveCallScreen.jsx', 'utf8');

const regex = /\/\/ Background Magical Translation Engine \(SpeechRecognition\)[\s\S]*?\}, \[user, activeCall, isMuted, speakInCall\]\);/;

const replacement = `// Background Magical Translation Engine (MediaRecorder for STT)
  useEffect(() => {
    let mediaRecorder = null;
    let stream = null;
    let interval = null;

    if (activeCall && activeCall.isTranslated && !isMuted) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
        stream = s;
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        
        mediaRecorder.ondataavailable = async (e) => {
          if (e.data.size > 0 && speakInCall) {
            const arrayBuffer = await e.data.arrayBuffer();
            speakInCall(null, arrayBuffer);
          }
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
        if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        if (stream) stream.getTracks().forEach(t => t.stop());
      };
    }
  }, [activeCall, isMuted, speakInCall]);`;

code = code.replace(regex, replacement);
fs.writeFileSync('mobile/src/screens/call/LiveCallScreen.jsx', code);
