const fs = require('fs');
let code = fs.readFileSync('mobile/src/context/CallContext.jsx', 'utf8');
code = code.replace("import React, { createContext, useContext, useState, useEffect, useRef } from 'react';", "import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';");
fs.writeFileSync('mobile/src/context/CallContext.jsx', code);
