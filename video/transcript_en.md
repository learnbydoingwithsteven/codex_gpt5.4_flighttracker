## Segment 1: Live Airspace Hook
**Audio:** This project turns the OpenSky aircraft feed into a live 3D flight tracker. Instead of plotting static points on a flat map, the interface places aircraft around a rotatable Earth and keeps the airspace legible as traffic density changes.

## Segment 2: Frontend Stack
**Audio:** The application is built as a Vite and React codebase with Three.js through react three fiber and drei. That stack keeps the rendering pipeline declarative while still exposing direct control over cameras, lighting, geometry, and post processing.

## Segment 3: Data Pipeline
**Audio:** The flight service queries OpenSky state vectors, normalizes the tuple payload, removes stale or grounded aircraft, applies region bounds, and caps the visible set for performance. Polling runs continuously so the visualization stays current without overwhelming the scene.

## Segment 4: Motion Prediction
**Audio:** Aircraft motion is not updated as a simple jump between API responses. The code predicts position between polls from heading, velocity, and vertical rate, then converts latitude, longitude, and altitude into globe coordinates so markers move smoothly and remain altitude accurate.

## Segment 5: Globe Rendering
**Audio:** The Earth scene uses procedural textures, cloud layers, atmosphere glow, star fields, directional lighting, and bloom. The goal is not decorative realism alone. The rendering is tuned so aircraft markers stay readable against the globe while the scene still feels production ready.

## Segment 6: Controls And Telemetry
**Audio:** The dashboard adds practical control over the stream. Region presets, traffic caps, selection state, refresh timing, and aircraft telemetry turn the visualization into an inspectable tool rather than a passive animation, and the layout adapts to both desktop and mobile widths.

## Segment 7: Delivery Standard
**Audio:** The finished codebase builds successfully for production and now includes a reusable media pipeline. Screenshots, highlight sequences, narration, branded assets, and vertical video assembly can be regenerated directly from the project files instead of being edited manually.

