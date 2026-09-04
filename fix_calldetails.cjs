const fs = require('fs');
const file = 'mobile/src/components/CallDetailsModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// The original was: if (!isOpen || !callRecord || !contact) return null;
// We removed it in the previous script. Now `callRecord` might be null.
// Let's replace the first lines of the component body to handle it safely.

content = content.replace(
  "  const isMissed = callRecord.status === 'rejected' || callRecord.durationSeconds === 0;",
  "  const isMissed = callRecord?.status === 'rejected' || callRecord?.durationSeconds === 0;"
);
content = content.replace(
  "  const getCallIcon = () => {",
  "  const getCallIcon = () => {\n    if (!callRecord) return null;"
);
content = content.replace(
  "    if (callRecord.isOutgoing) return <PhoneOutgoing className=\"w-5 h-5 text-emerald-500\" />;",
  "    if (callRecord?.isOutgoing) return <PhoneOutgoing className=\"w-5 h-5 text-emerald-500\" />;"
);

// We need to safely access callRecord throughout.
// Actually, it's easier to just wrap the AnimatePresence children with `if (!callRecord || !contact) return null;`
// No, the safest is to make sure we don't crash before the return statement.
fs.writeFileSync(file, content);
console.log('Fixed optional chaining for callRecord');
