import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture()
def valid_sale_payload() -> dict:
    return {
        "customer_name": "Walk-in",
        "is_anonymous_customer": True,
        "salesperson": "Amina",
        "items": [
            {"pos_item_id": 101, "item_name": "Ankara Print (yard)", "quantity": 6, "unit_price": 2500, "discount_pct": 0},
            {"pos_item_id": 205, "item_name": "Lace Fabric", "quantity": 2, "unit_price": 15000, "discount_pct": 10},
        ],
        "payments": [
            {"account": "Cash", "amount": 30000},
            {"account": "Bank Transfer", "amount": 12000},
        ],
    }
