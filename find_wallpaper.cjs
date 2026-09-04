const fs = require('fs');
const file = 'mobile/src/screens/main/ChatRoomScreen.jsx';
const content = fs.readFileSync(file, 'utf8');
const match = content.match(/const wallpaperClass = \(\) => \{[\s\S]*?\};/);
if (match) {
    console.log(match[0]);
} else {
    console.log("wallpaperClass not found");
}
