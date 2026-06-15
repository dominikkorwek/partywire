# `partywire_frontend`

Frontend jest gotowy do deployu na Vercelu.

## Wymagane zmienne

Ustaw w Vercelu:

```env
VITE_BACKEND_URL=https://<twoj-backend>.onrender.com
```

## Vercel

Repo zawiera `vercel.json`, więc odświeżanie tras React Routera będzie działało poprawnie.

Build settings:

- Framework: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
