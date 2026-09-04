const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

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
          if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk('src', function(err, results) {
  if (err) throw err;
  let hasErrors = false;
  results.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    try {
      parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx']
      });
    } catch (err) {
      console.log(`Syntax Error in ${file}:`, err.message);
      hasErrors = true;
    }
  });
  if (!hasErrors) console.log('All JSX/JS files compiled successfully!');
});
