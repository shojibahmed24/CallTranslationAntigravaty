const fs = require('fs');
const file = 'mobile/src/screens/call/LiveCallScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `      return (
    <motion.div`;

const replacement = `      return () => {
        if (interval) clearInterval(interval);
        if (volumeInterval) clearInterval(volumeInterval);
        if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
        if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        if (stream) stream.getTracks().forEach(t => t.stop());
      };
    }
  }, [activeCall, isMuted, speakInCall]);

  // Simulated Audio Visualizer Logic
  useEffect(() => {
    let interval;
    if (activeCall && callDuration > 0 && !isMuted) {
      interval = setInterval(() => {
        setVisualizerLevels(Array.from({ length: 5 }, () => Math.random() * 20 + 8));
      }, 150);
    } else {
      setVisualizerLevels(Array(5).fill(4));
    }
    return () => clearInterval(interval);
  }, [activeCall, callDuration, isMuted]);

  if (!activeCall) return null;

  const peer = activeCall.peer;
  const avatarUrl = peer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`;
  };

  return (
    <motion.div`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log('Fixed LiveCallScreen missing logic');
} else {
  console.log('Target not found');
}
