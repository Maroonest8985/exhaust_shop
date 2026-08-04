import assert from "node:assert/strict";
import test from "node:test";
import {
  FITMENT,
  STOCK,
  availableInventory,
  canTransitionOrder,
  formatPrice,
  installationFeeLabel,
  purchaseCta,
} from "../lib/commerce.mjs";

test("chooses CTA from fitment and stock state", () => {
  assert.equal(purchaseCta(FITMENT.VERIFIED, STOCK.DOMESTIC), "장바구니 담기");
  assert.equal(purchaseCta(FITMENT.VERIFIED, STOCK.OVERSEAS_ORDER), "해외발주로 주문");
  assert.equal(purchaseCta(FITMENT.VERIFIED, STOCK.PREORDER), "예약 주문하기");
  assert.equal(purchaseCta(FITMENT.VERIFIED, STOCK.OUT_OF_STOCK), "재입고 알림");
  assert.equal(purchaseCta(FITMENT.CONSULTATION_REQUIRED, STOCK.DOMESTIC), "적합성 상담");
  assert.equal(purchaseCta(FITMENT.NO_DATA, STOCK.DOMESTIC), "차량 적합성 문의");
});

test("calculates available inventory without going negative", () => {
  assert.equal(availableInventory({ physical: 12, reserved: 3, safety: 2 }), 7);
  assert.equal(availableInventory({ physical: 3, reserved: 4, safety: 1 }), 0);
});

test("permits only defined order transitions", () => {
  assert.equal(canTransitionOrder("RECEIVED", "PAID"), true);
  assert.equal(canTransitionOrder("RECEIVED", "COMPLETED"), false);
  assert.equal(canTransitionOrder("SHIPPED", "COMPLETED"), true);
  assert.equal(canTransitionOrder("REFUNDED", "PAID"), false);
});

test("formats prices and unknown installation fees safely", () => {
  assert.equal(formatPrice(3200000), "3,200,000원");
  assert.equal(formatPrice(null), "상담 후 안내");
  assert.equal(installationFeeLabel(null), "상담 후 안내");
});
