fetch("http://localhost:5000/api/auth/request-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phone: "+8801772290702", mode: "register" })
}).then(r => r.text()).then(console.log).catch(console.error);
