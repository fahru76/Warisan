import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Phase 5 checkout/booking contract with the live backend (migrations 000300–000700, hardened
 * create-payment-intent). The browser must never send a price, and must speak the live status vocabulary.
 */
const calls: { rpc: unknown[][]; invoke: unknown[][]; insert: unknown[] } = { rpc: [], invoke: [], insert: [] };
let rpcResult: { data: unknown; error: unknown } = { data: "11111111-1111-4111-8111-111111111111", error: null };
let invokeResult: { data: unknown; error: unknown } = { data: null, error: null };
let insertError: unknown = null;
let ordersRows: unknown[] = [];

const fakeClient = {
  rpc: (...args: unknown[]) => { calls.rpc.push(args); return Promise.resolve(rpcResult); },
  functions: { invoke: (...args: unknown[]) => { calls.invoke.push(args); return Promise.resolve(invokeResult); } },
  from: (table: string) => ({
    insert: (row: unknown) => { calls.insert.push({ table, row }); return Promise.resolve({ error: insertError }); },
    select: () => ({ order: () => Promise.resolve({ data: ordersRows, error: null }) })
  })
};
let live = true;
vi.mock("../packages/ui/src/data/supabase", () => ({ getSupabase: () => (live ? fakeClient : null), isLive: () => live }));

const { createOrder, createPaymentIntent, PaymentError } = await import("../packages/ui/src/payments");
const api = await import("../packages/ui/src/data/api");
const { ORDER_STATUSES } = await import("../packages/ui/src/data/types");
const { resources } = await import("../packages/ui/src/i18n/resources");

const ORDER_ID = "11111111-1111-4111-8111-111111111111";
const ITEM_ID = "22222222-2222-4222-8222-222222222222";
const KEY = "33333333-3333-4333-8333-333333333333";

beforeEach(() => {
  calls.rpc = []; calls.invoke = []; calls.insert = [];
  rpcResult = { data: ORDER_ID, error: null };
  invokeResult = { data: { data: { mode: "test", paymentIntentId: `test_${ORDER_ID}`, orderId: ORDER_ID, amountMyr: 421.5, status: "requires_confirmation" } }, error: null };
  insertError = null;
  ordersRows = [];
  live = true;
});

describe("createOrder", () => {
  it("calls create_order with item ids and quantities only — no prices", async () => {
    await expect(createOrder({ items: [{ craftItemId: ITEM_ID, quantity: 2 }], idempotencyKey: KEY })).resolves.toBe(ORDER_ID);
    expect(calls.rpc).toEqual([["create_order", { p_items: [{ craft_item_id: ITEM_ID, quantity: 2 }], p_idempotency_key: KEY }]]);
    expect(JSON.stringify(calls.rpc)).not.toMatch(/price|amount|total/i);
  });
  it("rejects invalid quantities before calling the backend", async () => {
    for (const quantity of [0, -1, 1.5, 100]) {
      await expect(createOrder({ items: [{ craftItemId: ITEM_ID, quantity }], idempotencyKey: KEY })).rejects.toBeInstanceOf(PaymentError);
    }
    await expect(createOrder({ items: [], idempotencyKey: KEY })).rejects.toBeInstanceOf(PaymentError);
    expect(calls.rpc).toHaveLength(0);
  });
  it("surfaces database errors as PaymentError", async () => {
    rpcResult = { data: null, error: { code: "22023", message: "one or more items are not available" } };
    await expect(createOrder({ items: [{ craftItemId: ITEM_ID, quantity: 1 }], idempotencyKey: KEY })).rejects.toMatchObject({ code: "ORDER_FAILED", message: "one or more items are not available" });
  });
});

describe("createPaymentIntent", () => {
  it("sends only the order id plus the Idempotency-Key header", async () => {
    const intent = await createPaymentIntent({ orderId: ORDER_ID, idempotencyKey: KEY, demoAmountMyr: 0.01 });
    expect(calls.invoke).toHaveLength(1);
    const [name, options] = calls.invoke[0] as [string, { body: unknown; headers: Record<string, string> }];
    expect(name).toBe("create-payment-intent");
    expect(options.body).toEqual({ orderId: ORDER_ID });
    expect(options.headers).toEqual({ "Idempotency-Key": KEY });
    expect(intent.amountMyr).toBe(421.5);
  });
  it("maps the function's JSON error code from a non-2xx response", async () => {
    invokeResult = { data: null, error: { message: "Edge Function returned a non-2xx status code", context: new Response(JSON.stringify({ error: { code: "ORDER_NOT_PENDING", message: "Only pending orders are payable." } }), { status: 409 }) } };
    await expect(createPaymentIntent({ orderId: ORDER_ID, idempotencyKey: KEY })).rejects.toMatchObject({ code: "ORDER_NOT_PENDING" });
  });
  it("refuses a non-test intent", async () => {
    invokeResult = { data: { data: { mode: "live", paymentIntentId: "x", orderId: ORDER_ID, amountMyr: 1, status: "requires_confirmation" } }, error: null };
    await expect(createPaymentIntent({ orderId: ORDER_ID, idempotencyKey: KEY })).rejects.toMatchObject({ code: "MODE_MISMATCH" });
  });
  it("demo mode never calls a backend", async () => {
    live = false;
    const intent = await createPaymentIntent({ orderId: ORDER_ID, idempotencyKey: KEY, demoAmountMyr: 120 });
    expect(intent.amountMyr).toBe(120);
    expect(calls.invoke).toHaveLength(0);
  });
});

describe("workshop booking", () => {
  it("inserts a consented booking without a client-chosen status", async () => {
    await expect(api.requestBooking({ workshopId: ITEM_ID, customerId: ORDER_ID, quantity: 2, pdpaConsent: true })).resolves.toBe("booked");
    const { table, row } = calls.insert[0] as { table: string; row: Record<string, unknown> };
    expect(table).toBe("bookings");
    expect(row).not.toHaveProperty("status");
    expect(row.pdpa_consent_date).toBeTruthy();
  });
  it("maps capacity, duplicate and RLS errors to outcomes", () => {
    expect(api.bookingOutcomeFromError({ code: "P0001", message: "workshop capacity exceeded" })).toBe("full");
    expect(api.bookingOutcomeFromError({ code: "23505", message: "duplicate key" })).toBe("duplicate");
    expect(api.bookingOutcomeFromError({ code: "42501", message: "new row violates row-level security policy" })).toBe("unavailable");
    expect(api.bookingOutcomeFromError({ code: "XX000", message: "boom" })).toBe("error");
  });
  it("does not book without consent", async () => {
    await expect(api.requestBooking({ workshopId: ITEM_ID, customerId: ORDER_ID, quantity: 1, pdpaConsent: false })).resolves.toBe("error");
    expect(calls.insert).toHaveLength(0);
  });
});

describe("order history", () => {
  it("normalises numeric strings and missing item names", async () => {
    ordersRows = [{ id: ORDER_ID, status: "pending", total_myr: "421.50", created_at: "2026-10-09T05:00:00Z", order_items: [{ craft_item_id: ITEM_ID, quantity: 3, unit_price_myr: "120.50", craft_items: null }] }];
    const { data } = await api.listMyOrders();
    expect(data[0]).toMatchObject({ total_myr: 421.5, lines: [{ unit_price_myr: 120.5, name: null, quantity: 3 }] });
  });
});

describe("status vocabulary", () => {
  it("labels every live order status in English and Bahasa Melayu", () => {
    for (const lang of ["en", "ms"] as const) {
      const labels = resources[lang].translation.net.orderStatus as Record<string, string>;
      expect(Object.keys(labels).sort()).toEqual([...ORDER_STATUSES].sort());
      for (const status of ORDER_STATUSES) expect(labels[status].length).toBeGreaterThan(0);
    }
  });
});
