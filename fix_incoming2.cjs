const fs = require('fs');
const file = 'mobile/src/screens/call/IncomingCallModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// strip \0 if any
content = content.replace(/\0/g, '');

const regex = /return\s*\(\s*<motion\.div/;

const replacement = `return () => stopTone();
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

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed using regex');
} else {
  console.log('Regex not matched');
}
