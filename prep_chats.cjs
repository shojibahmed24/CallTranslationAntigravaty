const fs = require('fs');
const file = 'mobile/src/screens/main/ChatsListScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure necessary imports are present (Archive, Trash2, Pin, Search, MessageSquarePlus, Users, X, FileText, Image, Check, CheckCheck)
const importRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]lucide-react['"];/;
const match = content.match(importRegex);
if (match) {
  let imports = match[1].split(',').map(s => s.trim());
  const needed = ['Archive', 'Trash2', 'Pin', 'Search', 'MessageSquarePlus', 'Users', 'X', 'FileText', 'Image', 'Check', 'CheckCheck'];
  needed.forEach(n => {
    if (!imports.includes(n)) imports.push(n);
  });
  content = content.replace(importRegex, `import { ${imports.join(', ')} } from 'lucide-react';`);
}

// We will replace the entire file content after the imports and utility functions
// Actually, it's safer to just replace ChatRow and ChatsListScreen completely
