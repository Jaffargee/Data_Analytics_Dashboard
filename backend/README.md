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

## Status

Confirmed directly from the real login page and sales-register page HTML:
- **Login** — `POST /index.php/login?continue=<redirect>` with `username`
  and `password` fields. Implemented in `Pos4AfricaSession.login()`.
  Success/failure detection is a heuristic (checks whether the response
  still contains the login form), not a documented signal — flagged in
  the code.
- `POST /index.php/sales/add` — add an item (`item=<name>|FORCE_ITEM_ID|`)
- `POST /index.php/sales/select_customer` — set the customer (`customer=<name>|FORCE_PERSON_ID|`)
- `POST /index.php/sales/set_selected_payment` — set payment type, from a
  fixed list: Cash, Check, Gift Card, Debit Card, Credit Card, Store
  Account, Points, EBT, WIC, EBT Cash
- `POST /index.php/sales/receipt_validate` — the one confirmed JSON
  endpoint, `{success, sale_id}`

**Two things still genuinely unconfirmed**, blocking full trust in a
completed sale (see `app/services/pos4africa_client.py`'s module
docstring for the full detail):
1. `#add_payment_form`'s exact endpoint — inferred as `sales/add_payment`
   by pattern-matching the other endpoints, not confirmed.
2. What a *successful* finish-sale response looks like — needed to pull
   the resulting sale ID back out and be sure the sale actually posted.

To close both: watch your browser's Network tab while completing one real
cash sale on the actual site, and share what the "add payment" request
and the final response after "Finish Sale" look like.

**Stub mode** (nothing configured in `.env`) is unaffected by any of the
above — the API validates sales exactly like it would for real and
returns `is_stub: true` with an explanation instead of attempting the
pos4africa flow. This means the POS frontend is fully buildable and
testable today.

## Running locally

```bash
cd backend
python3 -m venv venv
. venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in pos4africa credentials to try the real flow
uvicorn app.main:app --reload --port 8000
```

`GET http://localhost:8000/health` returns
`{"status": "ok", "pos4africa_configured": false}` until `.env` is filled in.

Interactive API docs: `http://localhost:8000/docs`

## Running tests

```bash
pip install -r requirements-dev.txt
pytest tests/ -v
```

`tests/test_sales_endpoint.py` exercises the API's validation rules
end-to-end in stub mode (no credentials needed). `tests/test_pos4africa_client.py`
tests the scraping session's request-building and login detection logic
against a mocked transport — nothing in the test suite ever makes a real
request to fahadtahir.pos4africa.com.

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
tests/
  test_sales_endpoint.py         API-level validation tests (stub mode)
  test_pos4africa_client.py      Scraping-session tests (mocked transport)
```
