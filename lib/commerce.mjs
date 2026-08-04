export const FITMENT = Object.freeze({
  VERIFIED: "VERIFIED",
  CONDITIONAL: "CONDITIONAL",
  CONSULTATION_REQUIRED: "CONSULTATION_REQUIRED",
  INCOMPATIBLE: "INCOMPATIBLE",
  NO_DATA: "NO_DATA",
});

export const STOCK = Object.freeze({
  DOMESTIC: "DOMESTIC",
  OVERSEAS_ORDER: "OVERSEAS_ORDER",
  PREORDER: "PREORDER",
  OUT_OF_STOCK: "OUT_OF_STOCK",
});

export function purchaseCta(fitment, stock) {
  if (stock === STOCK.OUT_OF_STOCK) return "재입고 알림";
  if (fitment === FITMENT.INCOMPATIBLE) return "호환 제품 보기";
  if (fitment === FITMENT.NO_DATA) return "차량 적합성 문의";
  if (fitment === FITMENT.CONSULTATION_REQUIRED) return "적합성 상담";
  if (fitment === FITMENT.CONDITIONAL) return "조건 확인 후 구매";
  if (stock === STOCK.PREORDER) return "예약 주문하기";
  if (stock === STOCK.OVERSEAS_ORDER) return "해외발주로 주문";
  return "장바구니 담기";
}

export function availableInventory({ physical, reserved, safety }) {
  return Math.max(0, physical - reserved - safety);
}

const orderTransitions = Object.freeze({
  RECEIVED: ["PAID", "CANCELLATION_REQUESTED", "CANCELLED"],
  PAID: ["PREPARING", "CANCELLATION_REQUESTED", "REFUNDED"],
  PREPARING: ["SHIPPED", "CANCELLATION_REQUESTED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLATION_REQUESTED: ["CANCELLED", "PREPARING"],
  CANCELLED: ["REFUNDED"],
  REFUNDED: [],
});

export function canTransitionOrder(from, to) {
  return orderTransitions[from]?.includes(to) ?? false;
}

export function formatPrice(value) {
  return value == null ? "상담 후 안내" : `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

export function installationFeeLabel(value) {
  return value == null ? "상담 후 안내" : formatPrice(value);
}
