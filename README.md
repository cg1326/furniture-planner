# Furniture Planner

Moving furniture is a gamble. You drag everything across the room and realize the couch blocks the window. You spent your Saturday on a layout that's worse than what you started with.

This is a web app for planning furniture arrangements before any of that happens. Upload a floor plan, calibrate it to your room's actual dimensions, and place furniture from the built-in library to see what works. There's also an AI assistant (Claude) for when you're staring at an awkward corner and don't know what to do with it.

## Why I built it

Most room planning tools either skip real dimensions entirely or need an hour to set up. I wanted something calibrated to actual measurements, with an AI in the loop for suggestions, that you could start using in under 5 minutes. So I built it.

## What's inside

**Floorplan canvas.** Upload a floor plan image and calibrate it to real-world measurements.

**Furniture library.** Pre-built pieces scaled to standard dimensions. Drag and drop onto the canvas.

**Saved collection.** Add custom pieces and reuse them across layouts.

**Properties panel.** Adjust rotation, size, and exact position of any piece.

**AI assistant.** Powered by Claude. Ask it what to do with a tricky layout or get a second opinion before you commit.

## Tech

React, TypeScript, Vite, Konva / react-konva, Zustand, Tailwind CSS, Anthropic SDK.

## Run it

```bash
npm install
npm run dev
```

[http://localhost:5173](http://localhost:5173)
