# StockWatch — Quick Commerce Stock Watcher

Modern light SaaS frontend built with React, Vite, Tailwind CSS v4, Recharts, and Lucide icons.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Existing routes

- `/dashboard` — overview, product CRUD, monitoring summaries, and charts
- `/products` — existing Products route (continues to render the existing product-management view)
- `/price-history` — selected-product price chart and recorded price table
- `/monitoring-logs` — monitoring records and status summary

## Backend

The existing API base URL and CRUD/check endpoints are preserved in the page components. The backend is not included in this frontend package.

## Chart data

Dashboard charts use monitoring records returned by the existing monitoring-logs API. Price points are shown only when a record contains a `price` and `checkedAt`; no demo values are fabricated. The dedicated Price History page continues to request `/api/products/:id/history`.
