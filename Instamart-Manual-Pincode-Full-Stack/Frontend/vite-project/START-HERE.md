# Quick-Commerce Stock Watcher - Frontend

## Start

1. Copy `.env.example` to `.env`.
2. Keep `VITE_API_URL=http://localhost:5000/api` for local backend development.
3. Run:

   ```bash
   npm install
   npm run dev
   ```

4. Start the backend separately.
5. Log in, enter an Instamart product URL and PIN code, then select **Fetch Product Details**.

## Location

- Use **Use my current location to find pincode** for the most accurate location. The frontend now sends coordinates and the reverse-geocoded address to the backend.
- If you enter a PIN code manually, the backend estimates coordinates from the postal area and reverse-geocodes an address. This is approximate and may not match the nearest Instamart delivery store.

The existing dashboard, authentication flow, product management, price history, monitoring logs, and alerts are retained.
