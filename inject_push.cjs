const fs = require('fs');
const file = 'native-app/src/context/AuthContext.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
content = "import { registerForPushNotificationsAsync } from '../services/pushService';\n" + content;

// Modify initApp
content = content.replace(
  "setUser(userData);", 
  "setUser(userData);\n      registerForPushNotificationsAsync();"
);

// Modify verifyOtp
content = content.replace(
  "setUser(res.user);",
  "setUser(res.user);\n    registerForPushNotificationsAsync();"
);

// Modify loginWithFirebase
content = content.replace(
  "setUser(res.user);",
  "setUser(res.user);\n    registerForPushNotificationsAsync();"
);

fs.writeFileSync(file, content);
console.log('Added push token registration to AuthContext');
