"""
Drives pos4africa.com by replaying the same form POSTs its own browser JS
makes — this is a legacy server-rendered PHP app (the "PHP Point of Sale"
codebase, white-labelled as pos4africa), not a REST/JSON API. There's no
API key; auth is a PHP session cookie from a login form, and most actions
respond with an HTML fragment (meant to replace #register_container in the
browser) rather than JSON.

═══════════════════════════════════════════════════════════════════════════
 CONFIRMED against the real sales-register page HTML (fahadtahir.pos4africa.com,
 "TAHIR GENERAL MERCHANT", running PHP Point of Sale v19.4):

   POST {base}/index.php/sales/add
       field: item = "<item name or ID>|FORCE_ITEM_ID|"
       (the literal |FORCE_ITEM_ID| suffix is what the page's own
       autocomplete appends to force an exact match instead of a fuzzy
       search — same trick used here)
       -> HTML fragment (replaces #register_container)

   POST {base}/index.php/sales/select_customer
       field: customer = "<customer name or ID>|FORCE_PERSON_ID|"
       -> HTML fragment

   POST {base}/index.php/sales/set_selected_payment
       field: payment = one of a FIXED set of strings (hardcoded in the
       page's JS, not arbitrary): "Cash", "Check", "Gift Card",
       "Debit Card", "Credit Card", "Store Account", "Points", "EBT",
       "WIC", "EBT Cash"
       -> no visible response captured; assumed HTML fragment like the above

   POST {base}/index.php/sales/receipt_validate
       field: sale_id
       -> the ONE confirmed JSON endpoint on this page:
          {"success": true, "sale_id": ...} or {"success": false, "message": ...}

   POST {base}/index.php/sales/set_comment
       fields: comment, ref_sale_desc
       -> fire-and-forget, HTML fragment

 STILL UNKNOWN — not visible in the one page captured so far:

   1. LOGIN. This HTML is from an already-authenticated session. Nothing
      here works without a valid PHPSESSID cookie, and I don't have the
      login page/form field names. `login()` below is a stub until you
      share that page (or just the form's action URL + input names).

   2. #add_payment_form's action. The register page's JS submits this
      form to record a tendered amount, but its <form action="..."> tag
      wasn't visible in what was captured — only the JS that triggers it.
      `add_payment()` below guesses `sales/add_payment` (it fits the
      naming pattern of every confirmed endpoint above: sales/add,
      sales/select_customer, sales/set_selected_payment), but this is an
      inference, not a confirmed fact — flagged as such below.

   3. What a *successful* finish-sale response looks like. The button's
      handler submits #finish_sale_form, whose only visible action is
      `sales/start_cc_processing?provider=valor` — a credit-card-sounding
      endpoint name that (in this codebase) plausibly still handles ALL
      payment types server-side, but I have no captured example of its
      response to confirm that, or to know how to pull the resulting
      sale_id/receipt number back out of it.

 Given (1), nothing here can run yet regardless of (2)/(3) — there's no way
 to establish a session. Fill in login() first.
═══════════════════════════════════════════════════════════════════════════
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field

import httpx

from app.config import get_settings
from app.models.sale import CreateSaleRequest

logger = logging.getLogger("pos4africa_client")

# The fixed vocabulary set_selected_payment accepts — confirmed from the
# page's checkPaymentTypes() JS. Note this is NOT the same list as whatever
# `payments.account` values exist in the Supabase side of this project
# (e.g. "Bank Transfer" isn't in this list) — that mapping still needs to
# be decided: closest fit is probably "Debit Card" or "Store Account" for
# a bank transfer, but that's a business call, not a technical one.
KNOWN_PAYMENT_TYPES = {
    "Cash", "Check", "Gift Card", "Debit Card", "Credit Card",
    "Store Account", "Points", "EBT", "WIC", "EBT Cash",
}


class Pos4AfricaError(Exception):
    """Raised when a step in the scripted sale flow fails or can't be trusted."""


@dataclass
class Pos4AfricaResult:
    is_stub: bool
    pos4africa_reference: str | None
    message: str | None


class Pos4AfricaSession:
    """One login session against a pos4africa tenant. Not thread-safe — create
    one per request rather than sharing across concurrent sales."""

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self._client = httpx.AsyncClient(base_url=self.base_url, follow_redirects=True, timeout=20.0)
        self._logged_in = False

    async def login(self, username: str, password: str) -> None:
        # TODO: unknown — need the login page's form action + field names.
        # Once known this should be a single POST that populates self._client's
        # cookie jar with a PHPSESSID, e.g.:
        #   await self._client.post("/index.php/login/validate_credentials",
        #                            data={"username": username, "password": password})
        raise Pos4AfricaError(
            "pos4africa login isn't implemented yet — the login page's form "
            "fields haven't been captured. Nothing else in this session can "
            "run until that's filled in."
        )

    async def add_item(self, item_name_or_id: str) -> str:
        response = await self._client.post(
            "/index.php/sales/add", data={"item": f"{item_name_or_id}|FORCE_ITEM_ID|"}
        )
        response.raise_for_status()
        return response.text

    async def select_customer(self, customer_name_or_id: str) -> str:
        response = await self._client.post(
            "/index.php/sales/select_customer", data={"customer": f"{customer_name_or_id}|FORCE_PERSON_ID|"}
        )
        response.raise_for_status()
        return response.text

    async def set_payment_type(self, payment_type: str) -> str:
        if payment_type not in KNOWN_PAYMENT_TYPES:
            raise Pos4AfricaError(
                f"{payment_type!r} isn't one of pos4africa's payment types: "
                f"{sorted(KNOWN_PAYMENT_TYPES)}. Map your account name to one "
                f"of these before calling set_payment_type."
            )
        response = await self._client.post(
            "/index.php/sales/set_selected_payment", data={"payment": payment_type}
        )
        response.raise_for_status()
        return response.text

    async def add_payment(self, amount: float) -> str:
        # NOT CONFIRMED — see module docstring point 2. Best-guess endpoint
        # name and field, following the naming pattern of everything above.
        response = await self._client.post(
            "/index.php/sales/add_payment", data={"amount_tendered": f"{amount:.2f}"}
        )
        response.raise_for_status()
        return response.text

    async def finish_sale(self, comment: str | None = None) -> str:
        if comment:
            await self._client.post("/index.php/sales/set_comment", data={"comment": comment})
        # NOT FULLY CONFIRMED — see module docstring point 3.
        response = await self._client.post(
            "/index.php/sales/start_cc_processing", params={"provider": "valor"}
        )
        response.raise_for_status()
        return response.text

    async def close(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> "Pos4AfricaSession":
        return self

    async def __aexit__(self, *exc_info: object) -> None:
        await self.close()


async def create_sale(sale: CreateSaleRequest) -> Pos4AfricaResult:
    """
    Replay a sale through pos4africa's sales-register flow. Falls back to a
    clearly-labelled stub response when pos4africa credentials aren't
    configured, or when the flow hits an unimplemented/unconfirmed step
    (currently: always, since login() isn't implemented — see above).
    """
    settings = get_settings()

    if not settings.pos4africa_configured:
        logger.warning(
            "pos4africa not configured (POS4AFRICA_BASE_URL / _USERNAME / "
            "_PASSWORD unset) — returning a stub response instead of a real sale."
        )
        return Pos4AfricaResult(
            is_stub=True,
            pos4africa_reference=None,
            message=(
                "Not sent to pos4africa — no credentials configured on this "
                "server. Set POS4AFRICA_BASE_URL, POS4AFRICA_USERNAME, and "
                "POS4AFRICA_PASSWORD in .env once you have them."
            ),
        )

    async with Pos4AfricaSession(settings.pos4africa_base_url) as session:
        try:
            await session.login(settings.pos4africa_username, settings.pos4africa_password)

            for item in sale.items:
                await session.add_item(str(item.pos_item_id))

            if sale.pos_customer_id is not None:
                await session.select_customer(str(sale.pos_customer_id))
            elif sale.customer_name:
                await session.select_customer(sale.customer_name)

            for payment in sale.payments:
                await session.set_payment_type(payment.account)
                await session.add_payment(payment.amount)

            result_html = await session.finish_sale(comment=sale.comment)

            # Can't reliably pull a sale ID out of result_html yet — see
            # module docstring point 3. Flagging that honestly rather than
            # guessing a parse that might silently return the wrong thing.
            logger.info("pos4africa finish_sale responded (%d chars); sale_id extraction not implemented", len(result_html))

            return Pos4AfricaResult(
                is_stub=False,
                pos4africa_reference=None,
                message=(
                    "Sale was submitted to pos4africa, but this server can't yet "
                    "confirm the resulting sale ID from the response — verify "
                    "manually in pos4africa until that parsing is added."
                ),
            )
        except Pos4AfricaError as exc:
            logger.error("pos4africa flow stopped: %s", exc)
            raise
        except httpx.HTTPError as exc:
            logger.error("pos4africa request failed: %s", exc)
            raise
