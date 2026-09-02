"""
Request/response shapes for POST /api/sales.

Field names deliberately mirror the existing Supabase schema this dashboard
already reads from (pos_item_id, pos_customer_id, account/amount for
payments) so the eventual pos4africa payload mapping is a near-identity
transform, not a redesign.
"""
from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class SaleLineItem(BaseModel):
    pos_item_id: int
    item_name: str
    quantity: float = Field(gt=0, description="Supports fractional quantities (e.g. yards of fabric).")
    unit_price: float = Field(ge=0)
    discount_pct: float = Field(default=0, ge=0, le=100)

    @property
    def line_total(self) -> float:
        gross = self.quantity * self.unit_price
        return round(gross * (1 - self.discount_pct / 100), 2)


class SalePayment(BaseModel):
    account: str = Field(description="Payment method / account name, e.g. 'Cash', 'Bank Transfer'.")
    amount: float = Field(gt=0)


class CreateSaleRequest(BaseModel):
    pos_customer_id: int | None = None
    customer_name: str | None = None
    customer_phone: str | None = None
    is_anonymous_customer: bool = False
    salesperson: str | None = None
    items: list[SaleLineItem] = Field(min_length=1)
    payments: list[SalePayment] = Field(min_length=1)
    comment: str | None = None

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v: list[SaleLineItem]) -> list[SaleLineItem]:
        if not v:
            raise ValueError("A sale needs at least one line item.")
        return v

    @property
    def invoice_total(self) -> float:
        return round(sum(item.line_total for item in self.items), 2)

    @property
    def amount_tendered(self) -> float:
        return round(sum(p.amount for p in self.payments), 2)


class SaleResponse(BaseModel):
    pos_sale_id: str
    invoice_total: float
    amount_tendered: float
    change_due: float
    status: str
    is_stub: bool = Field(
        description="True when this sale was NOT sent to a real pos4africa account "
        "— see app/services/pos4africa_client.py. Never show this as a completed "
        "sale to a cashier without checking this flag."
    )
    pos4africa_reference: str | None = None
    message: str | None = None
