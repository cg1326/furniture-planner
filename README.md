# Furniture Planner

An AI-powered web app for designing room layouts before you move a single piece of furniture.

## What it is

Furniture Planner is a drag-and-drop room layout tool that lets you map out your space, place furniture to scale, and experiment with different arrangements — all from your browser. Upload a photo of your floorplan, calibrate it to real-world dimensions, and start placing pieces from a built-in furniture library or your own saved collection.

The app uses AI to help you think through layouts and make decisions, so you're not just pushing boxes around a canvas — you have a design assistant in the loop.

## Why it exists

Rearranging furniture is physical, time-consuming, and often disappointing when the new arrangement doesn't work. Most people either sketch rough ideas on paper (inaccurate) or just move things and hope for the best (exhausting). Furniture Planner gives you a fast, visual way to test layouts digitally before committing to anything in the real world.

## Features

- **Floorplan canvas** — Upload a room image and calibrate it to accurate measurements
- **Furniture library** — Browse and place common furniture pieces scaled to real dimensions
- **Saved collection** — Save your own custom pieces for reuse across layouts
- **Properties panel** — Adjust size, rotation, and position of any piece precisely
- **AI assistant** — Get layout suggestions and design feedback powered by Claude

## Tech stack

- React + TypeScript
- Vite
- Konva / react-konva (canvas rendering)
- Zustand (state management)
- Tailwind CSS
- Anthropic SDK (AI features)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
