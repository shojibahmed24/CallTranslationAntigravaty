const fs = require('fs');
const file = 'server/src/server.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('@sentry/node')) {
  const sentryInit = `const Sentry = require("@sentry/node");
Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://dummy-dsn@o0.ingest.sentry.io/0",
  tracesSampleRate: 1.0,
});
`;
  content = sentryInit + content;
  fs.writeFileSync(file, content);
  console.log('Sentry added to backend');
}
