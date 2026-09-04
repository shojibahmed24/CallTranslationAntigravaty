const fs = require('fs');
const parser = require('@babel/parser');

const file = 'mobile/src/screens/main/ContactsScreen.jsx';
const content = fs.readFileSync(file, 'utf8');

try {
  parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('Parsed successfully');
} catch (err) {
  console.error(err.message);
  console.error('Line:', err.loc.line, 'Col:', err.loc.column);
}
