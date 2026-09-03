# Sales Bridge (FastAPI)

Receives sale requests from the POS frontend (`/pos` in the main app),
validates them, and replays them through pos4africa.com's sales-register
flow.

## What pos4africa actually is

Not a REST/JSON API — a legacy server-rendered PHP app (the open-source
"PHP Point of Sale" codebase, white-labelled, running at
`fahadtahir.pos4africa.com` for TAHIR GENERAL MERCHANT). Its own browser
JS works by POSTing HTML forms and swapping in the HTML fragment that
comes back. This backend does the same thing server-side instead of
calling a clean API, because there isn't one.

## Status: stub mode by default, and login isn't implemented yet

Confirmed directly from the real sales-register page HTML:
- `POST /index.php/sales/add` — add an item (`item=<name>|FORCE_ITEM_ID|`)
- `POST /index.php/sales/select_customer` — set the customer (`customer=<name>|FORCE_PERSON_ID|`)
- `POST /index.php/sales/set_selected_payment` — set payment type, from a
  fixed list: Cash, Check, Gift Card, Debit Card, Credit Card, Store
  Account, Points, EBT, WIC, EBT Cash
- `POST /index.php/sales/receipt_validate` — the one confirmed JSON
  endpoint, `{success, sale_id}`

Still missing, blocking a real end-to-end run:
1. **The login flow.** Everything above needs an authenticated session
   (PHPSESSID cookie), and the login page/form wasn't captured. `login()`
   in `app/services/pos4africa_client.py` raises until this is filled in.
2. **`#add_payment_form`'s exact endpoint** — inferred as `sales/add_payment`
   by pattern-matching the other endpoints, not confirmed.
3. **What a successful finish-sale response looks like** — needed to pull
   the resulting sale ID back out and confirm the sale actually went
   through.

To unblock all three: capture the login page (view source, same as you
did for the sales page), and if possible watch your browser's Network tab
while completing one real cash sale — the `add_payment` request and the
final response after clicking "Finish Sale" are exactly what's needed.

In stub mode (nothing configured in `.env`), the API still validates
sales exactly like it would for real — rejects underpayment, missing
items, etc. — and returns `is_stub: true` with an explanation instead of
attempting the pos4africa flow. This means the POS frontend is fully
buildable and testable today regardless of where the above stands.

## Running locally

```bash
cd backend
python3 -m venv venv
. venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in pos4africa credentials once login() works
uvicorn app.main:app --reload --port 8000
```

`GET http://localhost:8000/health` returns
`{"status": "ok", "pos4africa_configured": false}` until `.env` is filled in
— and even fully configured, sales will fail at the login step until that's
implemented.

Interactive API docs: `http://localhost:8000/docs`

## Endpoints

- `GET /health` — reports whether pos4africa credentials are configured
- `POST /api/sales` — validate + attempt to forward a sale. See
  `app/models/sale.py` for the exact request/response shape.
  `invoice_total` is always computed server-side from line items — the
  client-sent total is never trusted.

## Structure

```
app/
  main.py                        FastAPI app, CORS
  config.py                      Env-var settings
  models/sale.py                 Request/response Pydantic models
  routers/sales.py               POST /api/sales
  routers/health.py              GET /health
  services/pos4africa_client.py  The scraping session — read this first
```
