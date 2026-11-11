# Quick Commerce Stock Watcher - Frontend Guide

This frontend keeps the existing dashboard, product monitoring, price history and monitoring logs. The authentication flow now uses Redux so all components read the same administrator information.

## 1. Start the frontend

1. Open a terminal in `Frontend/vite-project`.
2. Run `npm install` (only needed the first time).
3. Run `npm run dev`.
4. Keep the backend running on `http://localhost:5000`.

## 2. Important folders

- `src/main.jsx` - starts React, enables routing and makes Redux available.
- `src/App.jsx` - checks the saved login cookie and defines page routes.
- `src/Utils/UserSlice.js` - contains the administrator data stored in Redux.
- `src/Utils/Store.js` - creates the Redux store.
- `src/Routes/ProtectedRoute.jsx` - sends logged-out users to the login page.
- `src/Pages/Login.jsx` - login form and login API request.
- `src/Layout/MainLayout.jsx` - common page layout used by the protected pages.
- `src/Components/Navbar.jsx` - top bar, current admin email and logout.
- `src/Components/Sidebar.jsx` - page navigation.
- `src/Components/Footer.jsx` - common footer.
- `src/Pages/Dashboard.jsx` - products, product actions and dashboard summary.
- `src/Pages/PriceHistory.jsx` - price history and chart.
- `src/Pages/MonitoringLogs.jsx` - product checking activity and logs.

## 3. Redux authentication flow

1. `Login.jsx` sends email and password to `POST /api/auth/login`.
2. The backend verifies the details and places a JWT in an HTTP-only cookie.
3. The backend also returns the administrator's email and role.
4. `Login.jsx` dispatches `addCase(...)` to save that user information in Redux.
5. `Navbar.jsx` reads the email with `useSelector` and dispatches an empty user after logout.
6. `App.jsx` calls `GET /api/auth/me` when the app starts. This restores the user after a browser refresh by checking the HTTP-only cookie.
7. `ProtectedRoute.jsx` shows protected pages only when Redux contains a user.

## 4. What is stored in Redux?

The Redux state is available at `state.user`:

```js
{
  user: { email: "admin@example.com", role: "admin" },
  loading: false
}
```

When no valid login exists, `user` is `null`. `loading` stays true only while the first `/me` request is being checked.

The JWT itself is **not** stored in Redux or localStorage. It stays in the browser's HTTP-only cookie.

## 5. Why some components still use useState

Redux is for shared data used by different components, such as the logged-in administrator. `useState` is still the simplest choice for temporary values used by one component, such as login form text, an open mobile menu, search text, or a loading spinner for one button.

## 6. Backend URL

The current frontend uses `http://localhost:5000` to match the supplied local backend. If the backend URL changes, update the API URL constants in the frontend files. The backend authentication routes and JWT-cookie logic have not been changed for this Redux update.
