# Sales Bridge (FastAPI)

Receives sale requests from the POS frontend (`/pos` in the main app),
validates them, and forwards them to pos4africa.com.

## Status: stub mode by default

**This has never talked to a real pos4africa endpoint.** I (Claude) don't
have pos4africa's API documentation, so `app/services/pos4africa_client.py`
contains a working HTTP client shell with a *guessed* endpoint path, payload
shape, and auth scheme — clearly marked in that file's docstring — plus a
stub fallback that's active whenever `POS4AFRICA_BASE_URL` /
`POS4AFRICA_API_KEY` aren't set.

In stub mode, the API validates sales exactly like it would for real
(rejects underpayment, missing items, etc.) and returns a response with
`is_stub: true` and an explanatory message, instead of forwarding anywhere.
This means the POS frontend can be built and tested completely today.

**Before this takes real money:** get pos4africa's actual API docs (endpoint
path, request/response shape, auth method) and update
`app/services/pos4africa_client.py` — everything needing a change is under
the "real integration" marker in that file. Nothing else needs to change;
the router and models are already stable.

## Running locally

```bash
cd backend
python3 -m venv venv
. venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in pos4africa credentials once you have them
uvicorn app.main:app --reload --port 8000
```

Then `GET http://localhost:8000/health` should return
`{"status": "ok", "pos4africa_configured": false}` until `.env` is filled in.

Interactive API docs: `http://localhost:8000/docs`

## Endpoints

- `GET /health` — reports whether pos4africa credentials are configured
- `POST /api/sales` — validate + forward a sale. See `app/models/sale.py`
  for the exact request/response shape. `invoice_total` is always computed
  server-side from line items — the client-sent total is never trusted.

## Structure

```
app/
  main.py                        FastAPI app, CORS
  config.py                      Env-var settings
  models/sale.py                 Request/response Pydantic models
  routers/sales.py               POST /api/sales
  routers/health.py              GET /health
  services/pos4africa_client.py  The adapter — see its docstring first
```
