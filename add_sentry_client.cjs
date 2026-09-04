const fs = require('fs');
const file = 'native-app/app/_layout.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('@sentry/react-native')) {
  const sentryInit = `import * as Sentry from "@sentry/react-native";\n
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || "https://dummy-dsn@o0.ingest.sentry.io/0",
  tracesSampleRate: 1.0,
});\n`;
  
  content = content.replace("import { useEffect }", sentryInit + "import { useEffect }");
  fs.writeFileSync(file, content);
  console.log('Sentry added to frontend');
}
