# all-matrimony

## Frontend API setup

Create `all/.env` from `all/.env.example` and set:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_API_URL_WEB=http://localhost:8080
EXPO_PUBLIC_API_URL_NATIVE=http://192.168.0.19:8080
```

Use your machine's current LAN IP when testing from a physical phone on the same Wi-Fi, for example:

```env
EXPO_PUBLIC_API_URL_NATIVE=http://<your-lan-ip>:8080
```

Expo tunnel hosts such as `*.exp.direct` are not your backend. The app should point to your Spring Boot server URL, usually your PC's LAN IP like `http://192.168.0.19:8080`.

For web opened on your own PC through Expo tunnel, the app should still use `http://localhost:8080` for the backend.
