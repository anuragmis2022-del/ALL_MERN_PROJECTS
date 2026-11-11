# Instamart location resolution update

## What changed

- The frontend now sends latitude, longitude, the reverse-geocoded address, addressId, and annotation to the backend.
- The backend posts the captured Instamart location-selection payload in this exact shape:

  ```js
  {
    data: {
      lat,
      lng,
      address,
      addressId,
      annotation,
      clientId: "INSTAMART-APP"
    }
  }
  ```

- The backend extracts `podDetails.podId` (or the first `podDetailsList` entry) as the Store ID.
- The product API is then called with the extracted Spin ID and resolved Store ID.
- Location address fields are saved with each product so later scheduled checks keep the same location context.
- Backend logs show the location API HTTP status and response body when the location request is being debugged.
- Existing login, product CRUD, price history, monitoring logs, email notifications, scheduled checks, and platform adapters are retained.

## Start backend

1. Copy `.env.example` to `.env`.
2. Fill in `MONGO_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET`.
3. Add email credentials if email alerts are required.
4. If Instamart returns HTTP 401/403, you may test with a valid `INSTAMART_COOKIE` in your local `.env`. Never commit or share this cookie; it expires and is sensitive.
5. Run:

   ```bash
   npm install
   npm run dev
   ```

## Important location notes

- **Use my current location** is more accurate because it sends the browser's coordinates and address.
- Manual PIN-code lookup uses OpenStreetMap's approximate postal-area coordinates. A PIN code can cover a large area, so it may resolve to a different store than a precise doorstep location.
- Instamart's internal endpoints are undocumented and can change or require a valid session. A successful HTTP response is not guaranteed for every location. If `podDetails.podId` is absent, inspect the backend terminal logs; do not treat that as an out-of-stock result.
- This source was syntax-checked locally, but a live request to Instamart and a full Vite build could not be executed in this environment.
