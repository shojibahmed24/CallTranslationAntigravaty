const fs = require('fs');
let code = fs.readFileSync('mobile/src/App.jsx', 'utf8');

const brokenPart = `        if (granted) {
          await subscribeToPushNotifications();
        }
  const [selectedPlanForUsdt, setSelectedPlanForUsdt] = useState(null);`;

const restoredPart = `        if (granted) {
          await subscribeToPushNotifications();
        }
      };
      // Short timeout to let the UI load first
      setTimeout(initPush, 3000);
    }
  }, [user]);

  // Auth flow state
  const [authStep, setAuthStep] = useState('phone'); // 'phone', 'otp', 'profile'
  const [pendingPhone, setPendingPhone] = useState('');
  const [firebaseConfirmation, setFirebaseConfirmation] = useState(null);

  // Navigation state
  const [currentTab, setCurrentTab] = useState('chats'); // 'chats', 'calls', 'contacts', 'settings'
  const [activeChatContact, setActiveChatContact] = useState(null);
  const [subPage, setSubPage] = useState(null); // 'storage_plan', 'usdt_payment', 'support_tickets'
  const [selectedPlanForUsdt, setSelectedPlanForUsdt] = useState(null);`;

code = code.replace(brokenPart, restoredPart);
fs.writeFileSync('mobile/src/App.jsx', code);
