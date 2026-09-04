const fs = require('fs');
let code = fs.readFileSync('server/src/config/index.js', 'utf8');

code = code.replace(/translatedMinutesPerDay: 5,/g, 'translatedMinutesPerDay: 100,');
code = code.replace(/5 Mins\/Day Translated Calls/g, '100 Mins/Day Translated Calls');
code = code.replace(/message: `You have exhausted your Free daily translation limit \(5 minutes\)/g, 'message: `You have exhausted your Free daily translation limit (100 minutes)');

fs.writeFileSync('server/src/config/index.js', code);
