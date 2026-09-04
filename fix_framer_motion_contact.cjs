const fs = require('fs');
const file = 'mobile/src/components/ContactProfileScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('framer-motion')) {
  content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';");
  fs.writeFileSync(file, content);
  console.log('Added framer-motion');
} else {
  console.log('framer-motion already present');
}

