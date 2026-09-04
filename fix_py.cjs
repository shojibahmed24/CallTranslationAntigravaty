const fs = require('fs');
const file = 'mobile/src/screens/auth/PhoneLoginScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("py-4.5", "py-4");

// Let's add the shimmer keyframe to index.css or index.html if it doesn't exist, but Tailwind arbitrary values like `group-hover:animate-[shimmer_1.5s_infinite]` won't work unless `shimmer` is defined in tailwind.config.js.
// A safer approach without touching tailwind config is to use Framer Motion for the shine, or just stick to standard classes and CSS. But let's check `mobile/tailwind.config.js`.
fs.writeFileSync(file, content);
console.log('Fixed py-4.5');
