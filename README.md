# Orbital Airspace

Live 3D flight tracking built with React, Vite, `@react-three/fiber`, `drei`, and OpenSky aircraft states.

## Run

```bash
npm install
npm run dev
```

## Notes

- The app uses `/api/opensky` in development, proxied through Vite to `https://opensky-network.org/api`.
- For production hosting, point `VITE_OPENSKY_BASE_URL` at your own server-side proxy if your platform does not allow direct browser access to OpenSky.
- Aircraft positions are altitude-accurate and motion-smoothed by extrapolating velocity, track, and climb rate between polls.
