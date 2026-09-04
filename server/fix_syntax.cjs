const fs = require('fs');
const file = 'src/socket/socketHandler.js';
let content = fs.readFileSync(file, 'utf8');

const target = `        } catch (e) {
          console.error('Call Summary Error:', e);
        }
      });
      }
    });

    // Disconnect handler`;

const replacement = `        } catch (e) {
          console.error('Call Summary Error:', e);
        }
    });

    // Disconnect handler`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log('Fixed syntax error');
} else {
  console.log('Target not found');
}
