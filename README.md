# NSE V17 TradingView Alert Bridge - Mobile Easy

Upload only these root files to GitHub:
- server.js
- package.json
- render.yaml
- README.md

No public folder upload needed.

Render settings:
- Build Command: npm install
- Start Command: npm start
- Environment Variable: ALERT_SECRET = your private secret

Webhook format after Render deploy:
https://YOUR-APP.onrender.com/webhook?secret=YOUR_SECRET
