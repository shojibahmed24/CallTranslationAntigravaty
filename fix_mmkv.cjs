const fs = require('fs');
const file = 'native-app/src/context/ChatContext.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add MMKV import
if (!content.includes('react-native-mmkv')) {
  content = content.replace("import AsyncStorage from '@react-native-async-storage/async-storage';", "import AsyncStorage from '@react-native-async-storage/async-storage';\nimport { MMKV } from 'react-native-mmkv';\nconst storage = new MMKV();");
}

// Remove the FORCE CLEAR CACHE
content = content.replace("await AsyncStorage.removeItem('@active_chats'); // FORCE CLEAR CACHE", "");

// Replace AsyncStorage with storage (MMKV) for chats and messages
// For saving
content = content.replace(/AsyncStorage\.setItem\('@active_chats', JSON\.stringify\((.*?)\)\);/g, "storage.set('@active_chats', JSON.stringify($1));");
content = content.replace(/AsyncStorage\.setItem\('@chat_messages', JSON\.stringify\((.*?)\)\);/g, "storage.set('@chat_messages', JSON.stringify($1));");

// For loading
content = content.replace(/await AsyncStorage\.getItem\('@active_chats'\)/g, "storage.getString('@active_chats')");
content = content.replace(/await AsyncStorage\.getItem\('@chat_messages'\)/g, "storage.getString('@chat_messages')");
content = content.replace(/await AsyncStorage\.getItem\('@quick_replies'\)/g, "storage.getString('@quick_replies')");

// Fix commented out setItem
content = content.replace(/\/\/ AsyncStorage\.setItem\('@chat_messages'/g, "// storage.set('@chat_messages'");
// Actually let's uncomment and use MMKV for the decrypted messages
content = content.replace(/\/\/ storage\.set\('@chat_messages', JSON\.stringify\(\{ \.\.\.prev, \[chatId\]: updated \}\)\);/g, "storage.set('@chat_messages', JSON.stringify({ ...prev, [chatId]: updated }));");


fs.writeFileSync(file, content);
console.log('Migrated ChatContext to MMKV');
