import logging
import uuid

import httpx
from fastapi import APIRouter, HTTPException

from app.models.sale import CreateSaleRequest, SaleResponse
from app.services.pos4africa_client import create_sale as send_to_pos4africa

logger = logging.getLogger("sales_router")

router = APIRouter(prefix="/api/sales", tags=["sales"])


@router.post("", response_model=SaleResponse)
async def create_sale(sale: CreateSaleRequest) -> SaleResponse:
    """
    Validate and forward a sale from the POS frontend.

    invoice_total is computed server-side from the line items — never trust
    a total the client sends — and amount_tendered is validated against it
    before anything is forwarded downstream.
    """
    invoice_total = sale.invoice_total
    amount_tendered = sale.amount_tendered

    if amount_tendered < invoice_total:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Amount tendered (₦{amount_tendered:,.2f}) is less than the "
                f"invoice total (₦{invoice_total:,.2f})."
            ),
        )

    try:
        result = await send_to_pos4africa(sale)
    except httpx.HTTPError as exc:
        logger.exception("Failed to forward sale to pos4africa")
        raise HTTPException(
            status_code=502,
            detail=f"pos4africa did not accept the sale: {exc}",
        ) from exc

    return SaleResponse(
        pos_sale_id=result.pos4africa_reference or f"local-{uuid.uuid4().hex[:12]}",
        invoice_total=invoice_total,
        amount_tendered=amount_tendered,
        change_due=round(amount_tendered - invoice_total, 2),
        status="stub" if result.is_stub else "completed",
        is_stub=result.is_stub,
        pos4africa_reference=result.pos4africa_reference,
        message=result.message,
    )
