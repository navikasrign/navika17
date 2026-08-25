# EcoCycle AI 🌱

A responsive hackathon MVP that helps users turn recyclable waste into measurable value.

## Features
- Waste image upload and preview
- Demo material classification for plastic, paper, glass, metal and e-waste
- Indicative recyclable price estimation
- Recycling guidance
- Green Points rewards
- CO₂ savings estimate
- Recycling history dashboard
- Nearby recycler discovery via Google Maps
- Responsive mobile/desktop UI

## Run locally
```bash
npm install
npm run dev
```

## Important
The current classifier is an MVP/demo classifier based on the uploaded file name and is intentionally labelled as such in the interface. For production, connect the analyze action to a secure server-side vision model/API. Price and CO₂ figures are indicative demo estimates, not live market values.
