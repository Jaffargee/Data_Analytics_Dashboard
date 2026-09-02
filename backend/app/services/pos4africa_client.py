"""
Adapter that would forward a validated sale to pos4africa.com.

═══════════════════════════════════════════════════════════════════════════
 THIS IS A STUB. Claude has no documentation, credentials, or access to
 pos4africa's actual API — nothing below the "real integration" marker is
 verified against a real endpoint. Do not deploy this to take real payments
 until that section is replaced with the actual pos4africa contract.
═══════════════════════════════════════════════════════════════════════════

What's real and working right now:
  - The HTTP client setup (base URL + auth header from env vars)
  - The stub fallback, so the frontend can be built and tested end-to-end
    today without a pos4africa account
  - The error handling / timeout / retry shape

What's NOT real and needs filling in once you have pos4africa's API docs:
  - The exact request path (guessed as POST {base_url}/sales below — likely
    wrong)
  - The exact request payload shape pos4africa expects (guessed as a
    reasonably-shaped JSON body below — likely needs remapping)
  - Auth scheme (guessed as `Authorization: Bearer <key>` — could be an
    API-key header, HMAC signature, OAuth, etc.)
  - Response parsing (guessed field names below)
"""
from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass

import httpx

from app.config import get_settings
from app.models.sale import CreateSaleRequest

logger = logging.getLogger("pos4africa_client")


@dataclass
class Pos4AfricaResult:
    is_stub: bool
    pos4africa_reference: str | None
    message: str | None


async def create_sale(sale: CreateSaleRequest) -> Pos4AfricaResult:
    """
    Send a sale to pos4africa. Falls back to a clearly-labelled stub response
    when POS4AFRICA_BASE_URL / POS4AFRICA_API_KEY aren't configured.
    """
    settings = get_settings()

    if not settings.pos4africa_configured:
        logger.warning(
            "pos4africa not configured (POS4AFRICA_BASE_URL / POS4AFRICA_API_KEY "
            "unset) — returning a stub response instead of a real sale."
        )
        return Pos4AfricaResult(
            is_stub=True,
            pos4africa_reference=None,
            message=(
                "Not sent to pos4africa — no API credentials configured on this "
                "server. Set POS4AFRICA_BASE_URL and POS4AFRICA_API_KEY in .env "
                "once you have them."
            ),
        )

    # ── Real integration — UNVERIFIED, see module docstring ────────────────
    # TODO(BB): confirm this whole block against pos4africa's actual API docs.
    payload = {
        "customer": {
            "id": sale.pos_customer_id,
            "name": sale.customer_name,
            "phone": sale.customer_phone,
            "is_anonymous": sale.is_anonymous_customer,
        },
        "salesperson": sale.salesperson,
        "items": [
            {
                "item_id": item.pos_item_id,
                "name": item.item_name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "discount_pct": item.discount_pct,
            }
            for item in sale.items
        ],
        "payments": [{"method": p.account, "amount": p.amount} for p in sale.payments],
        "total": sale.invoice_total,
        "comment": sale.comment,
        "idempotency_key": str(uuid.uuid4()),
    }

    try:
        async with httpx.AsyncClient(
            base_url=settings.pos4africa_base_url,
            headers={"Authorization": f"Bearer {settings.pos4africa_api_key}"},
            timeout=15.0,
        ) as client:
            response = await client.post("/sales", json=payload)  # path is a guess
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as exc:
        logger.error("pos4africa request failed: %s", exc)
        raise

    return Pos4AfricaResult(
        is_stub=False,
        pos4africa_reference=data.get("reference") or data.get("id"),  # field name is a guess
        message=None,
    )
