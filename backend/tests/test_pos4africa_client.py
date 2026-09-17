import httpx
import pytest

from app.services.pos4africa_client import KNOWN_PAYMENT_TYPES, Pos4AfricaError, Pos4AfricaSession

LOGIN_PAGE_FRAGMENT = '<form id="loginform" action="/index.php/login">...</form>'
SALES_PAGE_FRAGMENT = '<div id="sales_page_holder">...</div>'


def make_session(handler) -> Pos4AfricaSession:
    session = Pos4AfricaSession("https://fahadtahir.pos4africa.com")
    session._client = httpx.AsyncClient(base_url=session.base_url, transport=httpx.MockTransport(handler))
    return session


@pytest.mark.asyncio
async def test_login_success_when_login_form_is_gone():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/index.php/login"
        assert request.url.params["continue"] == "sales/index"
        return httpx.Response(200, text=SALES_PAGE_FRAGMENT)

    session = make_session(handler)
    await session.login("someuser", "somepassword")
    assert session._logged_in is True


@pytest.mark.asyncio
async def test_login_failure_when_login_form_is_still_present():
    session = make_session(lambda request: httpx.Response(200, text=LOGIN_PAGE_FRAGMENT))
    with pytest.raises(Pos4AfricaError, match="did not succeed"):
        await session.login("someuser", "wrongpassword")


@pytest.mark.asyncio
async def test_add_item_sends_force_item_id_suffix():
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["body"] = request.read().decode()
        return httpx.Response(200, text="<div>ok</div>")

    session = make_session(handler)
    await session.add_item("42")
    assert captured["body"] == "item=42%7CFORCE_ITEM_ID%7C"


@pytest.mark.asyncio
async def test_select_customer_sends_force_person_id_suffix():
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["body"] = request.read().decode()
        return httpx.Response(200, text="<div>ok</div>")

    session = make_session(handler)
    await session.select_customer("17")
    assert captured["body"] == "customer=17%7CFORCE_PERSON_ID%7C"


@pytest.mark.asyncio
async def test_set_payment_type_rejects_unknown_type():
    session = make_session(lambda request: httpx.Response(200, text="ok"))
    with pytest.raises(Pos4AfricaError, match="isn't one of pos4africa's payment types"):
        await session.set_payment_type("Bank Transfer")


@pytest.mark.asyncio
async def test_set_payment_type_accepts_known_types():
    for payment_type in KNOWN_PAYMENT_TYPES:
        session = make_session(lambda request: httpx.Response(200, text="ok"))
        await session.set_payment_type(payment_type)
