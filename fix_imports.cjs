const fs = require('fs');
const file = 'mobile/src/screens/auth/ProfileSetupScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

// Remove duplicate React imports
content = content.replace("import React,\nimport { motion } from 'framer-motion';\nimport React, { useState, useRef } from 'react';\nimport { motion } from 'framer-motion';", "import React, { useState, useRef } from 'react';\nimport { motion } from 'framer-motion';");

fs.writeFileSync(file, content);
console.log('Fixed imports');
