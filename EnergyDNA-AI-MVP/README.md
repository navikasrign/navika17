# EnergyDNA AI — Hackathon MVP

EnergyDNA AI is a software-first predictive-maintenance concept for MSMEs. The MVP demonstrates how smartphone audio, machine images and basic operating context can be converted into a simple machine-health screening result.

## Core idea
Every machine has a characteristic operating signature. EnergyDNA AI builds a baseline from observable machine behaviour and flags deviations that may indicate abnormal operation, maintenance need or potential inefficiency.

## What this MVP currently does
- Register/select a machine
- Upload machine audio or run a built-in demo mode
- Extract browser-side audio features (RMS amplitude and zero-crossing rate)
- Combine audio features with operating context
- Generate an EnergyDNA health score
- Classify the result as normal / possible deviation / abnormal
- Show a maintenance-priority recommendation
- Upload and preview a machine image as part of the inspection workflow

## Important technical note
This prototype does **not** claim to measure exact electricity consumption or kWh from smartphone audio. It is an anomaly-screening demonstration. Precise energy measurement is a future integration using smart energy meters, IoT sensors or existing industrial meter data.

The current recommendation engine is a transparent heuristic prototype, not a trained industrial diagnostic model. A hackathon pilot would replace or augment it with a trained model using labelled healthy and faulty machine recordings.

## Proposed production architecture
1. React/mobile frontend for machine registration and scans
2. Python/FastAPI AI service
3. Audio feature extraction (MFCC, RMS, spectral features, vibration/audio anomaly indicators)
4. Computer-vision inspection model for supported visible faults
5. Machine-specific baseline/anomaly model
6. Database for scan history and maintenance records
7. Optional smart-meter/IoT integration for exact energy data
8. Dashboard for health, cost, energy and carbon insights

## How to run this version
This version is intentionally static and can run directly in a modern browser.

1. Download/open the `EnergyDNA-AI-MVP` folder.
2. Open `index.html` in Chrome/Edge, or serve it with VS Code Live Server.
3. Upload a short WAV/MP3 machine recording, or click **Run EnergyDNA Analysis** without audio to use demo mode.

## Hackathon demonstration flow
`Machine → Sound/Image → Analyze → Energy DNA → Detect deviation → Recommend action → Track health`

## Future validation metrics
- Fault/anomaly detection accuracy
- False-alert rate
- Time-to-detect abnormal behaviour
- Energy-saving opportunity identified after meter integration
- Monitoring cost per machine
- MSME user acceptance/usability

## Vision
**Detect. Predict. Optimize. Save.**

Make intelligent energy management and predictive maintenance more accessible to MSMEs.
