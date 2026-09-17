def test_health_reports_stub_mode(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "pos4africa_configured": False}


def test_valid_sale_returns_stub_response(client, valid_sale_payload):
    response = client.post("/api/sales", json=valid_sale_payload)
    assert response.status_code == 200
    body = response.json()
    assert body["is_stub"] is True
    assert body["status"] == "stub"
    assert body["pos4africa_reference"] is None
    assert body["invoice_total"] == 42000.0
    assert body["amount_tendered"] == 42000.0
    assert body["change_due"] == 0.0


def test_overpayment_reports_change_due(client, valid_sale_payload):
    valid_sale_payload["payments"] = [{"account": "Cash", "amount": 50000}]
    response = client.post("/api/sales", json=valid_sale_payload)
    assert response.status_code == 200
    assert response.json()["change_due"] == 8000.0


def test_underpayment_is_rejected(client, valid_sale_payload):
    valid_sale_payload["payments"] = [{"account": "Cash", "amount": 1000}]
    response = client.post("/api/sales", json=valid_sale_payload)
    assert response.status_code == 422
    assert "less than the invoice total" in response.json()["detail"]


def test_empty_items_is_rejected(client, valid_sale_payload):
    valid_sale_payload["items"] = []
    assert client.post("/api/sales", json=valid_sale_payload).status_code == 422


def test_empty_payments_is_rejected(client, valid_sale_payload):
    valid_sale_payload["payments"] = []
    assert client.post("/api/sales", json=valid_sale_payload).status_code == 422


def test_negative_quantity_is_rejected(client, valid_sale_payload):
    valid_sale_payload["items"][0]["quantity"] = -1
    assert client.post("/api/sales", json=valid_sale_payload).status_code == 422


def test_discount_over_100_percent_is_rejected(client, valid_sale_payload):
    valid_sale_payload["items"][0]["discount_pct"] = 150
    assert client.post("/api/sales", json=valid_sale_payload).status_code == 422
