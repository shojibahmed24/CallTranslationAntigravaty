const fs = require('fs');
const file = 'mobile/src/screens/call/IncomingCallModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// handle UTF-16 if needed, but fs.readFileSync('utf8') on UTF-16 will have null bytes.
// Actually git checkout creates it with standard encoding based on git config.
// Let's just read it normally. If it has \0, we strip them.
if (content.includes('\0')) {
  content = content.replace(/\0/g, '');
}

const target1 = `        return (
        <motion.div`;
const target2 = `        return (\r\n        <motion.div`;
const target3 = `        return (\n        <motion.div`;
const target4 = `    return (\n    <motion.div`;
const target5 = `    return (\r\n    <motion.div`;

const replacement = `    return () => stopTone();
  }, [incomingCall]);

  if (!incomingCall) return null;

  const caller = incomingCall.caller;
  const avatarUrl = caller?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 150) {
      setAnswered(true);
      acceptIncomingCall();
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <motion.div`;

let replaced = false;
[target1, target2, target3, target4, target5].forEach(t => {
  if (content.includes(t) && !replaced) {
    content = content.replace(t, replacement);
    replaced = true;
  }
});

if (replaced) {
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed IncomingCallModal missing logic');
} else {
  console.log('Target not found');
}
