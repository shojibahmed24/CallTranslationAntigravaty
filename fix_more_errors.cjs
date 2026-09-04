const fs = require('fs');
const file = 'native-app/app/call/[id].tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const \[false, setIsTranslatingLocal\]/g, 'const [isTranslatingLocal, setIsTranslatingLocal]');

// Also fix line 163 error: `Expression expected`
// Let's print out lines 155-165 to see what is wrong there.
const lines = content.split('\n');
console.log('Lines 155-165:');
for(let i=155; i<=165; i++){
  console.log(`${i+1}: ${lines[i]}`);
}

fs.writeFileSync(file, content);
console.log('Fixed array destructuring');
