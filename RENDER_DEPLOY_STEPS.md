# Render Deploy Steps - NSE V17 TradingView Alert Bridge

## What you need
- A Render account
- A GitHub account
- This project uploaded to a GitHub repository

## Render settings
- Service type: Web Service
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `ALERT_SECRET` = your private secret, e.g. `mysecret123`

## After deploy
Render will give an app URL like:
`https://nse-v17-alert-bridge.onrender.com`

Dashboard:
`https://nse-v17-alert-bridge.onrender.com`

TradingView webhook URL:
`https://nse-v17-alert-bridge.onrender.com/webhook`

Webhook with secret as query:
`https://nse-v17-alert-bridge.onrender.com/webhook?secret=YOUR_ALERT_SECRET`

## TradingView alert JSON example
```json
{
  "secret": "YOUR_ALERT_SECRET",
  "symbol": "RELIANCE",
  "event": "ENTRY",
  "price": "{{close}}",
  "entry": 1435,
  "noChase": 1460,
  "sl": 1405,
  "target": 1485,
  "source": "TradingView"
}
```

## Important
- This bridge only rings alerts and shows signal. It does not place orders.
- Keep the dashboard open on mobile and tap Enable Alarm / Notification.
- Render Free services may sleep after inactivity; keep dashboard open or use a paid plan for faster always-on alerts.
