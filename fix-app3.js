const fs = require('fs');
let code = fs.readFileSync('mobile/src/App.jsx', 'utf8');

code = code.replace(
  /if \(granted\) \{\s*await subscribeToPushNotifications\(\);\s*\}/,
  `if (granted) {
          await subscribeToPushNotifications();
        }
      };
      setTimeout(initPush, 3000);
    }
  }, [user]);

  const [authStep, setAuthStep] = useState('phone');
  const [pendingPhone, setPendingPhone] = useState('');
  const [firebaseConfirmation, setFirebaseConfirmation] = useState(null);
  
  const [currentTab, setCurrentTab] = useState('chats');
  const [activeChatContact, setActiveChatContact] = useState(null);
  const [subPage, setSubPage] = useState(null);`
);

fs.writeFileSync('mobile/src/App.jsx', code);
