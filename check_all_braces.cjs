const fs = require('fs');
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.jsx')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk('mobile/src', function(err, results) {
  if (err) throw err;
  let hasErrors = false;
  results.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let open = 0, close = 0;
    for(let i=0; i<content.length; i++) {
      if (content[i] === '{') open++;
      if (content[i] === '}') close++;
    }
    if (open !== close) {
      console.log(`Mismatch in ${file}: Open ${open}, Close ${close}`);
      hasErrors = true;
    }
  });
  if (!hasErrors) console.log('All JSX files have matching braces!');
});
