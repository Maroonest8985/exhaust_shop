"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Box,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Database,
  FileText,
  Gauge,
  Headphones,
  Heart,
  Info,
  ImagePlus,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Package,
  PackageCheck,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  Truck,
  UserRound,
  Users,
  Volume2,
  Warehouse,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Fitment = "VERIFIED" | "CONDITIONAL" | "CONSULTATION_REQUIRED" | "INCOMPATIBLE" | "NO_DATA";
type Stock = "DOMESTIC" | "OVERSEAS_ORDER" | "PREORDER" | "OUT_OF_STOCK";

type Product = {
  slug: string;
  name: string;
  category: string;
  sku: string;
  material: string;
  price: number;
  fitment: Fitment;
  stock: Stock;
  image: string;
  images?: Array<{ url: string; altText: string }>;
  kicker: string;
  compatibleVehicles: string[];
};

type CartItem = {
  sku: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  fitment: Fitment;
  stock: Stock;
  optionName: string;
  vehicleSnapshot: string | null;
  quantity: number;
};

type VehicleSelection = {
  maker: string;
  model: string;
  generation: string;
  year: string;
  engine: string;
  specification: string;
  condition: string;
};

type VehicleGeneration = {
  years: string[];
  engines: string[];
  specifications: string[];
};

type StoredOrderItem = {
  productSku: string;
  productName: string;
  optionName: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type StoredOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  fulfillmentMethod: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  item: StoredOrderItem | null;
  items?: StoredOrderItem[];
};

type StoredInquiry = {
  id: string;
  inquiryNumber: string;
  type: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subject: string;
  body: string;
  productSku: string | null;
  productName: string | null;
  vehicleSnapshot: string | null;
  sourcePath: string;
  createdAt: string;
  updatedAt: string;
};

type StoredProduct = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  material: string;
  price: number;
  status: string;
  stockType: string;
  fitmentStatus: string;
  summary: string;
  description: string;
  specifications: Array<{ label: string; value: string }>;
  createdAt: string;
  updatedAt: string;
  images: Array<{ id: string; url: string; altText: string; fileName: string; byteSize: number }>;
};

type OrderDetail = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  fulfillmentMethod: string;
  totalAmount: number;
  createdAt: string;
  items: StoredOrderItem[];
  history: { toStatus: string; reason: string | null; createdAt: string }[];
};

const orderStatusLabels: Record<string, string> = {
  RECEIVED: "주문 접수",
  PAID: "결제 완료",
  PREPARING: "상품 준비",
  SHIPPED: "배송 중",
  COMPLETED: "완료",
  CANCELLATION_REQUESTED: "취소 요청",
  CANCELLED: "취소",
  REFUNDED: "환불",
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: "결제 확인 대기",
  PAID: "결제 완료",
  FAILED: "결제 실패",
  REFUNDED: "환불 완료",
};

const inquiryStatusLabels: Record<string, string> = {
  RECEIVED: "신규 접수",
  IN_REVIEW: "검토 중",
  ANSWERED: "답변 완료",
  CLOSED: "종결",
};

const inquiryTypeLabels: Record<string, string> = {
  FITMENT: "차량 적합성",
  INSTALLATION: "장착 조건",
  ORDER_DELIVERY: "주문·배송",
  WARRANTY_AS: "보증·AS",
  RETURN_EXCHANGE: "반품·교환",
  OTHER: "기타",
};

const heroImage =
  "https://images.unsplash.com/photo-1774759617562-6350530f5b97?auto=format&fit=crop&fm=jpg&q=84&w=2200";
const garageImage =
  "https://images.unsplash.com/photo-1655590547742-c97b53b1046c?auto=format&fit=crop&fm=jpg&q=82&w=1800";
const redBmwImage =
  "https://images.unsplash.com/photo-1627597324431-911a27b10899?auto=format&fit=crop&fm=jpg&q=82&w=1600";

const products: Product[] = [
  {
    slug: "bmw-g8x-valved-catback",
    name: "BMW G80/G82 Valved Cat-back Exhaust",
    category: "VALVED CAT-BACK",
    sku: "TB-BMW-G8X-VCE-001",
    material: "SUS304 · Carbon Quad Tip",
    price: 3200000,
    fitment: "VERIFIED",
    stock: "DOMESTIC",
    image: heroImage,
    kicker: "정교한 밸브 제어와 선명한 리어 디테일",
    compatibleVehicles: ["BMW|M3|G80", "BMW|M4|G82"],
  },
  {
    slug: "amg-w205-axleback",
    name: "AMG C63 W205 Axle-back Exhaust",
    category: "AXLE-BACK",
    sku: "TB-MB-W205-ABE-002",
    material: "SUS304 · Dual Tip",
    price: 2450000,
    fitment: "VERIFIED",
    stock: "OVERSEAS_ORDER",
    image: garageImage,
    kicker: "순정 라인을 고려한 리어 섹션 구성",
    compatibleVehicles: ["Mercedes-AMG|C63|W205"],
  },
  {
    slug: "audi-rs5-b9-valved",
    name: "Audi RS5 B9 Valved Exhaust",
    category: "VALVED EXHAUST",
    sku: "TB-AU-B9-VCE-003",
    material: "SUS304 · Valve Controller",
    price: 2900000,
    fitment: "CONSULTATION_REQUIRED",
    stock: "PREORDER",
    image: redBmwImage,
    kicker: "차량 세부 사양 확인 후 안내",
    compatibleVehicles: ["Audi|RS5|B9"],
  },
  {
    slug: "porsche-992-titanium-tip",
    name: "Porsche 992 Titanium Exhaust Tip",
    category: "EXHAUST TIP",
    sku: "TB-PO-992-TIP-004",
    material: "Titanium · Dual Tip",
    price: 780000,
    fitment: "VERIFIED",
    stock: "OUT_OF_STOCK",
    image: redBmwImage,
    kicker: "브러시드 티타늄 피니시",
    compatibleVehicles: ["Porsche|911|992"],
  },
];

function storedProductToCatalogProduct(product: StoredProduct): Product {
  const fitment = (["VERIFIED", "CONDITIONAL", "CONSULTATION_REQUIRED", "INCOMPATIBLE", "NO_DATA"] as const).includes(product.fitmentStatus as Fitment)
    ? product.fitmentStatus as Fitment
    : "NO_DATA";
  const stock = (["DOMESTIC", "OVERSEAS_ORDER", "PREORDER", "OUT_OF_STOCK"] as const).includes(product.stockType as Stock)
    ? product.stockType as Stock
    : "OUT_OF_STOCK";
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    sku: product.sku,
    material: product.material,
    price: product.price,
    fitment,
    stock,
    image: product.images[0]?.url ?? garageImage,
    images: product.images.map((image) => ({ url: image.url, altText: image.altText })),
    kicker: product.summary,
    compatibleVehicles: [],
  };
}

const vehicleCatalog: Record<string, Record<string, Record<string, VehicleGeneration>>> = {
  BMW: {
    M3: {
      G80: { years: ["2025", "2024", "2023", "2022", "2021"], engines: ["3.0 가솔린"], specifications: ["후륜 · 세단", "사륜 · 세단"] },
      F80: { years: ["2018", "2017", "2016", "2015", "2014"], engines: ["3.0 가솔린"], specifications: ["후륜 · 세단"] },
      E92: { years: ["2013", "2012", "2011", "2010", "2009", "2008"], engines: ["4.0 가솔린"], specifications: ["후륜 · 쿠페"] },
    },
    M4: {
      G82: { years: ["2025", "2024", "2023", "2022", "2021"], engines: ["3.0 가솔린"], specifications: ["후륜 · 쿠페", "사륜 · 쿠페"] },
      F82: { years: ["2020", "2019", "2018", "2017", "2016", "2015", "2014"], engines: ["3.0 가솔린"], specifications: ["후륜 · 쿠페"] },
    },
    M5: {
      G90: { years: ["2026", "2025"], engines: ["4.4 가솔린 PHEV"], specifications: ["사륜 · 세단"] },
      F90: { years: ["2023", "2022", "2021", "2020", "2019", "2018"], engines: ["4.4 가솔린"], specifications: ["사륜 · 세단"] },
    },
    "5 Series": {
      G60: { years: ["2026", "2025", "2024"], engines: ["2.0 가솔린 MHEV", "2.0 디젤 MHEV"], specifications: ["후륜 · 세단", "사륜 · 세단"] },
      G30: { years: ["2023", "2022", "2021", "2020", "2019", "2018", "2017"], engines: ["2.0 가솔린", "3.0 가솔린", "2.0 디젤"], specifications: ["후륜 · 세단", "사륜 · 세단"] },
    },
  },
  "Mercedes-AMG": {
    C63: {
      W206: { years: ["2026", "2025", "2024"], engines: ["2.0 가솔린 PHEV"], specifications: ["사륜 · 세단"] },
      W205: { years: ["2021", "2020", "2019", "2018", "2017", "2016", "2015"], engines: ["4.0 가솔린"], specifications: ["후륜 · 세단", "후륜 · 쿠페"] },
    },
    "AMG GT": {
      C192: { years: ["2026", "2025", "2024"], engines: ["4.0 가솔린"], specifications: ["사륜 · 쿠페"] },
      C190: { years: ["2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"], engines: ["4.0 가솔린"], specifications: ["후륜 · 쿠페"] },
    },
    E53: { W214: { years: ["2026", "2025", "2024"], engines: ["3.0 가솔린 PHEV"], specifications: ["사륜 · 세단"] } },
    A45: { W177: { years: ["2025", "2024", "2023", "2022", "2021", "2020"], engines: ["2.0 가솔린"], specifications: ["사륜 · 해치백"] } },
  },
  Audi: {
    RS5: {
      B9: { years: ["2024", "2023", "2022", "2021", "2020", "2019", "2018"], engines: ["2.9 가솔린"], specifications: ["사륜 · 쿠페", "사륜 · 스포트백"] },
      "B8.5": { years: ["2016", "2015", "2014", "2013"], engines: ["4.2 가솔린"], specifications: ["사륜 · 쿠페"] },
    },
    RS3: {
      "8Y": { years: ["2025", "2024", "2023", "2022"], engines: ["2.5 가솔린"], specifications: ["사륜 · 세단"] },
      "8V": { years: ["2020", "2019", "2018", "2017"], engines: ["2.5 가솔린"], specifications: ["사륜 · 세단"] },
    },
    S4: { B9: { years: ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017"], engines: ["3.0 가솔린"], specifications: ["사륜 · 세단"] } },
    R8: { "4S": { years: ["2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016"], engines: ["5.2 가솔린"], specifications: ["사륜 · 쿠페"] } },
  },
  Porsche: {
    "911": {
      "992": { years: ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019"], engines: ["3.0 가솔린", "3.8 가솔린"], specifications: ["후륜 · 쿠페", "사륜 · 쿠페"] },
      "991": { years: ["2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012"], engines: ["3.0 가솔린", "3.8 가솔린"], specifications: ["후륜 · 쿠페", "사륜 · 쿠페"] },
    },
    "718": { "982": { years: ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017"], engines: ["2.0 가솔린", "2.5 가솔린", "4.0 가솔린"], specifications: ["후륜 · 쿠페", "후륜 · 로드스터"] } },
    Panamera: { "971": { years: ["2023", "2022", "2021", "2020", "2019", "2018", "2017"], engines: ["2.9 가솔린", "4.0 가솔린"], specifications: ["사륜 · 패스트백"] } },
    Cayenne: { "9Y0": { years: ["2025", "2024", "2023", "2022", "2021", "2020", "2019"], engines: ["3.0 가솔린", "4.0 가솔린"], specifications: ["사륜 · SUV"] } },
  },
};

const vehicleConditions = ["순정 리어 범퍼", "카본 디퓨저 장착"];

function vehicleModels(maker: string) {
  return Object.keys(vehicleCatalog[maker] ?? {});
}

function vehicleGenerations(maker: string, model: string) {
  return Object.keys(vehicleCatalog[maker]?.[model] ?? {});
}

function vehicleGeneration(selection: Pick<VehicleSelection, "maker" | "model" | "generation">) {
  return vehicleCatalog[selection.maker]?.[selection.model]?.[selection.generation];
}

function vehicleUrl(selection: Partial<VehicleSelection>) {
  const params = new URLSearchParams();
  Object.entries(selection).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return `/products?${params.toString()}`;
}

function vehicleKey(selection: Partial<VehicleSelection>) {
  return `${selection.maker ?? ""}|${selection.model ?? ""}|${selection.generation ?? ""}`;
}

const fitmentMap: Record<Fitment, { label: string; icon: LucideIcon; className: string; description: string }> = {
  VERIFIED: {
    label: "장착 확인",
    icon: CheckCircle2,
    className: "success",
    description: "선택하신 차량에 장착이 확인된 제품입니다.",
  },
  CONDITIONAL: {
    label: "조건부 장착",
    icon: Wrench,
    className: "warning",
    description: "일부 사양 또는 추가 부품에 따라 장착 조건이 달라질 수 있습니다.",
  },
  CONSULTATION_REQUIRED: {
    label: "상담 필요",
    icon: MessageCircle,
    className: "info",
    description: "현재 정보만으로 장착 가능 여부를 확정하기 어렵습니다.",
  },
  INCOMPATIBLE: {
    label: "장착 불가",
    icon: XCircle,
    className: "error",
    description: "선택하신 차량에는 적용되지 않는 제품입니다.",
  },
  NO_DATA: {
    label: "적합성 데이터 없음",
    icon: Database,
    className: "neutral",
    description: "등록된 적합성 정보가 없어 확인이 필요합니다.",
  },
};

const stockMap: Record<Stock, { label: string; icon: LucideIcon; className: string; copy: string }> = {
  DOMESTIC: {
    label: "국내 재고",
    icon: PackageCheck,
    className: "success",
    copy: "국내 재고 보유 · 출고일은 주문 확인 후 안내",
  },
  OVERSEAS_ORDER: {
    label: "해외발주",
    icon: Truck,
    className: "info",
    copy: "주문 후 해외 공급사 발주가 진행됩니다.",
  },
  PREORDER: {
    label: "예약판매",
    icon: CalendarDays,
    className: "warning",
    copy: "입고 일정 확인 중 · 확정 후 개별 안내",
  },
  OUT_OF_STOCK: {
    label: "품절",
    icon: XCircle,
    className: "neutral",
    copy: "현재 품절 · 재입고 알림을 신청할 수 있습니다.",
  },
};

const formatPrice = (price: number) => new Intl.NumberFormat("ko-KR").format(price);
const cartStorageKey = "taibosi_cart_v1";

function readStoredCart(): CartItem[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(cartStorageKey) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is CartItem => {
        if (!item || typeof item !== "object") return false;
        const candidate = item as Partial<CartItem>;
        return typeof candidate.sku === "string" && typeof candidate.slug === "string" && typeof candidate.name === "string" && typeof candidate.price === "number" && candidate.price >= 0 && typeof candidate.image === "string" && typeof candidate.optionName === "string" && typeof candidate.quantity === "number" && (["VERIFIED", "CONDITIONAL", "CONSULTATION_REQUIRED", "INCOMPATIBLE", "NO_DATA"] as unknown[]).includes(candidate.fitment) && (["DOMESTIC", "OVERSEAS_ORDER", "PREORDER", "OUT_OF_STOCK"] as unknown[]).includes(candidate.stock);
      })
      .map((item) => ({ ...item, quantity: Math.min(10, Math.max(1, Math.trunc(item.quantity))) }));
  } catch {
    return [];
  }
}

async function saveAction(kind: string, payload: Record<string, unknown>) {
  try {
    const response = await fetch("/api/actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, payload }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function compressProductImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 선택할 수 있습니다.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("이미지를 처리하지 못했습니다.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!blob) throw new Error("이미지를 압축하지 못했습니다.");
  if (blob.size > 2_000_000) throw new Error("압축 후에도 2MB를 초과하는 이미지입니다.");
  const baseName = file.name.replace(/\.[^.]+$/, "").slice(0, 180) || "product";
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}

export function TaibosiApp({ path, vehicleQuery = {} }: { path: string; vehicleQuery?: Partial<VehicleSelection> }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setCartItems(readStoredCart());
      setCartReady(true);
    });
    const syncCart = (event: StorageEvent) => {
      if (event.key === cartStorageKey) setCartItems(readStoredCart());
    };
    window.addEventListener("storage", syncCart);
    return () => {
      active = false;
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems, cartReady]);

  const addProductToCart = (product: Product, quantity: number, optionName: string) => {
    setCartItems((current) => {
      const index = current.findIndex((item) => item.sku === product.sku && item.optionName === optionName);
      if (index >= 0) {
        return current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Math.min(10, item.quantity + quantity) } : item);
      }
      return [...current, {
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        fitment: product.fitment,
        stock: product.stock,
        optionName,
        vehicleSnapshot: product.compatibleVehicles[0]?.replaceAll("|", " · ") ?? null,
        quantity: Math.min(10, Math.max(1, quantity)),
      }];
    });
    setToast("장바구니에 상품을 담았습니다.");
  };
  const updateCartQuantity = (sku: string, optionName: string, quantity: number) => {
    setCartItems((current) => current.map((item) => item.sku === sku && item.optionName === optionName ? { ...item, quantity: Math.min(10, Math.max(1, quantity)) } : item));
  };
  const removeCartItem = (sku: string, optionName: string) => {
    setCartItems((current) => current.filter((item) => item.sku !== sku || item.optionName !== optionName));
    setToast("장바구니에서 상품을 삭제했습니다.");
  };
  const clearCart = () => {
    setCartItems([]);
    window.localStorage.removeItem(cartStorageKey);
  };

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  if (path.startsWith("/admin")) {
    return <AdminApp path={path} showToast={setToast} toast={toast} />;
  }

  const renderPage = () => {
    if (path === "/") return <HomePage />;
    if (path === "/vehicles" || path === "/vehicles/result") return <VehicleFinderPage />;
    if (path === "/products") return <ProductsPage vehicleQuery={vehicleQuery} />;
    if (path.startsWith("/products/")) {
      const slug = path.split("/").pop() ?? products[0].slug;
      return <DatabaseProductDetailPage slug={slug} addToCart={addProductToCart} showToast={setToast} />;
    }
    if (path === "/cart") return <CartPage items={cartItems} ready={cartReady} updateQuantity={updateCartQuantity} removeItem={removeCartItem} />;
    if (path === "/checkout") return <CheckoutPage items={cartItems} ready={cartReady} clearCart={clearCart} showToast={setToast} />;
    if (path === "/checkout/complete") return <CompletePage />;
    if (path === "/installation" || path === "/installers" || path === "/installation/booking") {
      return <InstallationPage booking={path.endsWith("booking")} showToast={setToast} />;
    }
    if (path.startsWith("/support")) return <SupportPage path={path} showToast={setToast} />;
    if (path.startsWith("/mypage")) return <MyPage path={path} />;
    if (path === "/login" || path === "/signup") return <AuthPage signup={path === "/signup"} />;
    if (path === "/brand") return <BrandPage />;
    return <InformationPage path={path} />;
  };

  return (
    <div className="storefront-shell">
      <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>
      <StoreHeader cartCount={cartCount} openMenu={() => setMobileMenu(true)} />
      {mobileMenu && <MobileMenu close={() => setMobileMenu(false)} />}
      <main id="main-content">{renderPage()}</main>
      <StoreFooter />
      {!path.startsWith("/checkout") && !path.startsWith("/products/") && <MobileBottomNav />}
      {toast && <div className="toast" role="status"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  );
}

function BrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <a className={`brand-mark ${dark ? "brand-dark" : ""}`} href="/" aria-label="Taibosi Exhaust Korea 홈">
      <span className="brand-symbol"><i /><i /><i /></span>
      <span><strong>TAIBOSI</strong><small>EXHAUST KOREA</small></span>
    </a>
  );
}

function StoreHeader({ cartCount, openMenu }: { cartCount: number; openMenu: () => void }) {
  return (
    <header className="store-header">
      <div className="header-inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label="주요 메뉴">
          <a href="/vehicles">차량으로 찾기</a>
          <a href="/products">제품</a>
          <a href="/brand">브랜드</a>
          <a href="/installation">장착 안내</a>
          <a href="/installers">장착점</a>
          <a href="/support">고객지원</a>
        </nav>
        <div className="header-actions">
          <a className="icon-link desktop-only" href="/products" aria-label="제품 검색"><Search /></a>
          <a className="icon-link desktop-only" href="/mypage/vehicles" aria-label="내 차량"><CarFront /></a>
          <a className="icon-link cart-link" href="/cart" aria-label={`장바구니 상품 ${cartCount}개`}><ShoppingBag /><b>{cartCount}</b></a>
          <button className="icon-link mobile-menu-trigger" onClick={openMenu} aria-label="메뉴 열기"><Menu /></button>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ close }: { close: () => void }) {
  return (
    <div className="mobile-menu-backdrop" role="presentation" onMouseDown={close}>
      <aside className="mobile-menu" role="dialog" aria-modal="true" aria-label="모바일 메뉴" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mobile-menu-head"><BrandMark /><button className="icon-link" onClick={close} aria-label="메뉴 닫기"><X /></button></div>
        <nav>
          <a href="/vehicles">차량으로 찾기 <ChevronRight /></a>
          <a href="/products">제품 <ChevronRight /></a>
          <a href="/brand">브랜드 <ChevronRight /></a>
          <a href="/installation">장착 안내 <ChevronRight /></a>
          <a href="/installers">장착점 <ChevronRight /></a>
          <a href="/support">고객지원 <ChevronRight /></a>
        </nav>
        <a className="button primary full" href="/login">로그인</a>
      </aside>
    </div>
  );
}

function MobileBottomNav() {
  const items: Array<[string, string, LucideIcon]> = [
    ["/", "홈", Gauge],
    ["/vehicles", "차량찾기", CarFront],
    ["/products", "제품검색", Search],
    ["/support/inquiry", "문의", MessageCircle],
    ["/mypage", "마이", UserRound],
  ];
  return (
    <nav className="mobile-bottom-nav" aria-label="모바일 바로가기">
      {items.map(([href, label, Icon]) => <a key={href} href={href}><Icon /><span>{label}</span></a>)}
    </nav>
  );
}

function HomePage() {
  const [maker, setMaker] = useState("BMW");
  const [model, setModel] = useState("M3");
  const [generation, setGeneration] = useState("G80");
  const models = vehicleModels(maker);
  const generations = vehicleGenerations(maker, model);
  const generationData = vehicleGeneration({ maker, model, generation });
  const changeMaker = (nextMaker: string) => {
    const nextModel = vehicleModels(nextMaker)[0];
    const nextGeneration = vehicleGenerations(nextMaker, nextModel)[0];
    setMaker(nextMaker);
    setModel(nextModel);
    setGeneration(nextGeneration);
  };
  const changeModel = (nextModel: string) => {
    setModel(nextModel);
    setGeneration(vehicleGenerations(maker, nextModel)[0]);
  };
  const searchHref = vehicleUrl({ maker, model, generation, year: generationData?.years[0], engine: generationData?.engines[0], specification: generationData?.specifications[0] });
  const categories = [
    ["01", "Cat-back System", "촉매 이후 배기 라인 전체를 교체하는 시스템"],
    ["02", "Axle-back System", "리어 액슬 이후 구간의 사운드와 디자인 변화"],
    ["03", "Valved Exhaust", "주행 상황에 맞춰 배기 흐름을 제어하는 밸브 시스템"],
    ["04", "Exhaust Tip", "리어 뷰를 완성하는 카본·티타늄 피니시"],
  ];
  return (
    <>
      <section className="hero-section">
        <img className="hero-image" src={heroImage} alt="다크 퍼포먼스 차량의 카본 리어 디퓨저 디테일" />
        <div className="hero-grid grid-container">
          <div className="hero-copy">
            <span className="eyebrow red">TAIBOSI EXHAUST KOREA</span>
            <h1>내 차에 맞는<br />배기 시스템을 정확하게</h1>
            <p>차량 정보로 호환 제품을 찾고, 국내 재고·해외발주·장착 일정을 한 번에 확인하세요.</p>
            <div className="button-row">
              <a className="button primary" href="/vehicles">차량으로 제품 찾기 <ArrowRight /></a>
              <a className="button ghost-light" href="/products">전체 제품 보기</a>
            </div>
            <span className="hero-trust"><ShieldCheck /> 차량 적합성 확인 · 국내 주문 지원 · 장착 상담</span>
          </div>
          <div className="hero-spec">
            <span>PRECISION FITMENT</span>
            <strong>G8X</strong>
            <span>SUS304 · VALVED</span>
          </div>
        </div>
        <div className="vehicle-quick-panel grid-container">
          <div className="finder-title">
            <span className="round-icon"><CarFront /></span>
            <div><strong>차량으로 맞는 제품 찾기</strong><small>내 차량을 선택하면 적합 상품만 보여드려요.</small></div>
          </div>
          <label><span>제조사</span><select value={maker} onChange={(event) => changeMaker(event.target.value)}>{Object.keys(vehicleCatalog).map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>모델</span><select value={model} onChange={(event) => changeModel(event.target.value)}>{models.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>세대 / 섀시</span><select value={generation} onChange={(event) => setGeneration(event.target.value)}>{generations.map((item) => <option key={item}>{item}</option>)}</select></label>
          <a className="button primary finder-button" href={searchHref}>호환 제품 보기 <ArrowRight /></a>
        </div>
      </section>

      <section className="quick-facts">
        <div className="grid-container facts-grid">
          <Fact icon={ClipboardCheck} title="차량별 적합성 확인" copy="세대·연식·엔진 기준" />
          <Fact icon={Warehouse} title="재고 유형 명확히" copy="국내·해외발주 구분" />
          <Fact icon={CalendarDays} title="장착 예약 연계" copy="구매 후 신청까지" />
          <Fact icon={Headphones} title="국내 문의·AS" copy="한글 상담 접수" />
        </div>
      </section>

      <section className="section categories-section">
        <div className="grid-container">
          <SectionHeading eyebrow="SYSTEM RANGE" title="교체 범위로 쉽게 찾으세요" copy="기술 용어보다 내 차량에서 무엇이 달라지는지 먼저 설명합니다." action="전체 카테고리" href="/products" />
          <div className="category-grid">
            {categories.map(([number, title, copy]) => (
              <a href="/products" className="category-card" key={title}>
                <span>{number}</span><div className="pipe-art"><i /><i /><b /></div><h3>{title}</h3><p>{copy}</p><ArrowRight />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section fitment-section">
        <div className="grid-container fitment-layout">
          <div className="fitment-copy">
            <span className="eyebrow red">VERIFIED FITMENT</span>
            <h2>가능 여부보다<br />판단 근거까지 명확하게</h2>
            <p>적합성 데이터가 부족한 경우 바로 결제시키지 않고 차량 정보를 확인한 뒤 안내합니다.</p>
            <a className="text-link" href="/vehicles">차량 적합성 확인하기 <ArrowRight /></a>
          </div>
          <div className="fitment-steps">
            <FitmentStep number="01" icon={CarFront} title="차량 선택" copy="제조사부터 엔진·구동 방식까지 필요한 정보만 선택" />
            <FitmentStep number="02" icon={ClipboardCheck} title="적합성 확인" copy="장착 확인, 조건부, 상담 필요 상태와 근거를 함께 확인" />
            <FitmentStep number="03" icon={Wrench} title="구매 또는 상담" copy="재고 유형과 장착 조건에 맞는 다음 행동으로 연결" />
          </div>
        </div>
      </section>

      <section className="section products-section">
        <div className="grid-container">
          <SectionHeading eyebrow="FEATURED SYSTEMS" title="차량별 추천 시스템" copy="BMW M3 G80 기준으로 확인된 대표 상품입니다." action="추천 상품 전체보기" href="/products" />
          <DatabaseFeaturedProducts />
        </div>
      </section>

      <section className="sound-section">
        <div className="sound-image"><img src={garageImage} alt="어두운 공간에서 보이는 퍼포먼스 차량 리어 뷰" /><span>01:24</span></div>
        <div className="sound-content">
          <span className="eyebrow red">SOUND EXPERIENCE</span>
          <h2>듣기 전에,<br />조건부터 확인하세요</h2>
          <p>녹음 환경과 재생 기기에 따라 실제 배기음은 다르게 들릴 수 있습니다. 차량과 시스템 조건을 함께 확인해 주세요.</p>
          <SoundPlayer />
          <a className="text-link light" href="/products/bmw-g8x-valved-catback">제품 상세에서 더 듣기 <ArrowRight /></a>
        </div>
      </section>

      <section className="section operations-section">
        <div className="grid-container">
          <SectionHeading eyebrow="DOMESTIC OPERATION" title="주문부터 장착까지, 국내에서 이어집니다" copy="재고 유형과 일정 상태를 투명하게 나누고 필요한 상담을 연결합니다." />
          <div className="operations-grid">
            <OperationCard icon={Warehouse} index="01" title="국내 재고 확인" copy="실제 재고 상태를 주문 전 다시 확인합니다." />
            <OperationCard icon={Truck} index="02" title="해외발주 추적" copy="발주·생산·선적·통관 상태를 단계별로 안내합니다." />
            <OperationCard icon={Wrench} index="03" title="장착점 연결" copy="구매 상품과 차량 정보가 예약 신청에 이어집니다." />
            <OperationCard icon={Headphones} index="04" title="국내 문의·AS" copy="고객 답변과 처리 상태를 한곳에서 확인합니다." />
          </div>
        </div>
      </section>

      <section className="installer-section">
        <div className="grid-container installer-layout">
          <div>
            <span className="eyebrow red">INSTALLATION NETWORK</span>
            <h2>가까운 장착점을<br />확인해 보세요</h2>
            <p>장착 일정은 신청 후 장착점 확인을 거쳐 확정됩니다.</p>
            <div className="installer-pills"><span><MapPin />서울</span><span><MapPin />분당</span><span><MapPin />부산</span></div>
            <a className="button dark" href="/installers">장착점 찾아보기 <ArrowRight /></a>
          </div>
          <div className="map-panel" aria-label="샘플 장착점 지도"><i className="road r1"/><i className="road r2"/><i className="road r3"/><span className="map-pin p1"><MapPin /></span><span className="map-pin p2"><MapPin /></span><span className="map-pin p3"><MapPin /></span><div><strong>3</strong><small>Sample installers</small></div></div>
        </div>
      </section>

      <SupportCTA />
    </>
  );
}

function Fact({ icon: Icon, title, copy }: { icon: LucideIcon; title: string; copy: string }) {
  return <div className="fact"><Icon /><div><strong>{title}</strong><span>{copy}</span></div></div>;
}

function SectionHeading({ eyebrow, title, copy, action, href = "#" }: { eyebrow: string; title: string; copy?: string; action?: string; href?: string }) {
  return (
    <div className="section-heading">
      <div><span className="eyebrow red">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>
      {action && <a className="text-link" href={href}>{action} <ArrowRight /></a>}
    </div>
  );
}

function FitmentStep({ number, icon: Icon, title, copy }: { number: string; icon: LucideIcon; title: string; copy: string }) {
  return <div className="fitment-step"><span>{number}</span><div className="step-icon"><Icon /></div><div><h3>{title}</h3><p>{copy}</p></div><ChevronRight /></div>;
}

function OperationCard({ icon: Icon, index, title, copy }: { icon: LucideIcon; index: string; title: string; copy: string }) {
  return <article className="operation-card"><span>{index}</span><Icon /><h3>{title}</h3><p>{copy}</p></article>;
}

function SoundPlayer() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="sound-player">
      <button onClick={() => setPlaying(!playing)} aria-label={playing ? "배기음 일시정지" : "배기음 재생"}>{playing ? <Pause /> : <Play />}</button>
      <div className={`wave ${playing ? "playing" : ""}`}>{Array.from({ length: 34 }).map((_, index) => <i key={index} style={{ height: `${8 + ((index * 17) % 30)}px` }} />)}</div>
      <span>{playing ? "00:14" : "00:00"} / 00:28</span><Volume2 />
    </div>
  );
}

function FitmentBadge({ status }: { status: Fitment }) {
  const item = fitmentMap[status];
  const Icon = item.icon;
  return <span className={`status-badge ${item.className}`}><Icon />{item.label}</span>;
}

function StockBadge({ stock }: { stock: Stock }) {
  const item = stockMap[stock];
  const Icon = item.icon;
  return <span className={`status-badge ${item.className}`}><Icon />{item.label}</span>;
}

function DatabaseFeaturedProducts() {
  const [featured, setFeatured] = useState<StoredProduct[] | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/products?scope=public", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { products?: StoredProduct[] };
        if (!response.ok) throw new Error("상품을 불러오지 못했습니다.");
        if (active) setFeatured((data.products ?? []).slice(0, 3));
      })
      .catch(() => { if (active) setFeatured([]); });
    return () => { active = false; };
  }, []);
  if (featured === null) return <div className="home-product-loading" role="status"><RotateCcw/>추천 상품을 불러오는 중입니다…</div>;
  if (featured.length === 0) return <div className="home-product-loading"><Package/>공개된 상품이 없습니다.</div>;
  return <div className="product-grid home-product-grid">{featured.map((product) => <ProductCard key={product.slug} product={storedProductToCatalogProduct(product)} />)}</div>;
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <a className="product-image" href={`/products/${product.slug}`}><img src={product.image} alt={`${product.name} 제품 이미지`} /><span>{product.category}</span><button aria-label="관심 상품 추가"><Heart /></button></a>
      <div className="product-card-body">
        <div className="badge-row"><FitmentBadge status={product.fitment} /><StockBadge stock={product.stock} /></div>
        <a href={`/products/${product.slug}`}><h3>{product.name}</h3></a>
        <p>{product.material}</p>
        <div className="product-price"><strong>{formatPrice(product.price)}</strong><span>원</span></div>
      </div>
    </article>
  );
}

function VehicleFinderPage() {
  const steps = ["제조사", "모델", "세대 / 섀시", "연식", "엔진", "세부 사양", "추가 조건", "결과 확인"];
  const defaults = ["BMW", "M3", "G80", "2022", "3.0 가솔린", "후륜 · 세단", "순정 리어 범퍼"];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string[]>(defaults);
  const [optionSearch, setOptionSearch] = useState("");
  const complete = current === 7;
  const generationData = vehicleGeneration({ maker: selected[0], model: selected[1], generation: selected[2] });
  const options = [
    Object.keys(vehicleCatalog),
    vehicleModels(selected[0]),
    vehicleGenerations(selected[0], selected[1]),
    generationData?.years ?? [],
    generationData?.engines ?? [],
    generationData?.specifications ?? [],
    vehicleConditions,
  ];
  const currentOptions = (options[current] ?? []).filter((option) => option.toLocaleLowerCase("ko-KR").includes(optionSearch.trim().toLocaleLowerCase("ko-KR")));
  const finderSelection: VehicleSelection = {
    maker: selected[0],
    model: selected[1],
    generation: selected[2],
    year: selected[3],
    engine: selected[4],
    specification: selected[5],
    condition: selected[6],
  };

  const selectOption = (option: string) => {
    setSelected((values) => values.map((value, index) => (index === current ? option : index > current ? "" : value)));
    setOptionSearch("");
  };

  return (
    <div className="vehicle-page page-light">
      <div className="page-hero compact dark-hero"><div className="grid-container"><span className="eyebrow red">VEHICLE FINDER</span><h1>차량 정보를 선택해 주세요</h1><p>정확한 적합성 확인을 위해 세대와 엔진 정보가 필요할 수 있습니다.</p></div></div>
      <div className="grid-container vehicle-workspace">
        <div className="stepper" aria-label="차량 선택 진행 단계">{steps.map((step, index) => <button key={step} onClick={() => { if (index <= current) { setCurrent(index); setOptionSearch(""); } }} className={index === current ? "active" : index < current ? "done" : ""}><span>{index < current ? <Check /> : index + 1}</span><b>{step}</b></button>)}</div>
        <div className="vehicle-columns">
          <section className="vehicle-options-card">
            <span className="step-label">STEP {String(current + 1).padStart(2, "0")} / 08</span>
            <h2>{complete ? "선택한 차량을 확인해 주세요" : `${steps[current]}을 선택해 주세요`}</h2>
            {!complete ? <>
              {current < 2 && <label className="option-search"><Search /><input value={optionSearch} onChange={(event) => setOptionSearch(event.target.value)} aria-label={`${steps[current]} 검색`} placeholder={`${steps[current]} 검색`} /></label>}
              <div className="option-list">{currentOptions.map((option) => <button key={option} className={selected[current] === option ? "selected" : ""} onClick={() => selectOption(option)}><span>{option.slice(0, 2)}</span><strong>{option}</strong>{selected[current] === option && <CheckCircle2 />}</button>)}</div>
              {currentOptions.length === 0 && <div className="vehicle-option-empty"><Search/><span>검색 조건에 맞는 항목이 없습니다.</span></div>}
            </> : <div className="complete-check"><CheckCircle2 /><strong>차량 선택이 완료되었습니다</strong><p>선택한 차량의 호환 제품을 확인할까요?</p></div>}
            <div className="vehicle-actions"><button className="button secondary" disabled={current === 0} onClick={() => { setOptionSearch(""); setCurrent((value) => Math.max(0, value - 1)); }}><ArrowLeft /> 이전</button>{complete ? <a className="button primary" href={vehicleUrl(finderSelection)}>호환 제품 보기 <ArrowRight /></a> : <button className="button primary" disabled={!selected[current]} onClick={() => { setOptionSearch(""); setCurrent((value) => Math.min(7, value + 1)); }}>다음 <ArrowRight /></button>}</div>
          </section>
          <aside className="vehicle-summary-panel">
            <div className="vehicle-silhouette"><CarFront /><span>{selected[2] || "-"}</span></div>
            <span className="eyebrow">SELECTED VEHICLE</span><h2>{selected[0] || "제조사"} {selected[1] || "모델"}</h2><p>{[selected[2], selected[3], selected[4]].filter(Boolean).join(" · ") || "차량 정보를 선택해 주세요"}</p>
            <dl>{steps.slice(0, 7).map((label, index) => <div key={label}><dt>{label}</dt><dd>{selected[index] || "선택 필요"}</dd></div>)}</dl>
            <div className="summary-note"><Info /><span>상위 항목을 변경하면 이후 선택값이 초기화됩니다.</span></div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ProductsPage({ vehicleQuery }: { vehicleQuery: Partial<VehicleSelection> }) {
  const [stockFilter, setStockFilter] = useState<Stock | "ALL">("ALL");
  const [fitFilter, setFitFilter] = useState<Fitment | "ALL">("ALL");
  const [mobileFilter, setMobileFilter] = useState(false);
  const [databaseProducts, setDatabaseProducts] = useState<StoredProduct[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const reloadProducts = () => {
    setDatabaseProducts(null);
    setLoadError("");
    setReloadKey((value) => value + 1);
  };
  useEffect(() => {
    let active = true;
    fetch("/api/products?scope=public", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { products?: StoredProduct[]; error?: string };
        if (!response.ok) throw new Error("Public products unavailable");
        if (active) setDatabaseProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch(() => {
        if (!active) return;
        setLoadError("등록 상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setDatabaseProducts([]);
      });
    return () => { active = false; };
  }, [reloadKey]);
  const hasVehicle = Boolean(vehicleQuery.maker && vehicleQuery.model && vehicleQuery.generation && vehicleGeneration({ maker: vehicleQuery.maker, model: vehicleQuery.model, generation: vehicleQuery.generation }));
  const selectedVehicleLabel = hasVehicle ? `${vehicleQuery.maker} ${vehicleQuery.model} ${vehicleQuery.generation}` : "차량 미선택";
  const selectedVehicleDetail = [vehicleQuery.year, vehicleQuery.engine, vehicleQuery.specification].filter(Boolean).join(" · ");
  const loading = databaseProducts === null;
  const catalogProducts = (databaseProducts ?? []).map(storedProductToCatalogProduct);
  const vehicleProducts = hasVehicle ? catalogProducts.filter((product) => product.compatibleVehicles.length === 0 || product.compatibleVehicles.includes(vehicleKey(vehicleQuery))) : catalogProducts;
  const visible = vehicleProducts.filter((product) => (stockFilter === "ALL" || product.stock === stockFilter) && (fitFilter === "ALL" || product.fitment === fitFilter));
  return (
    <div className="products-page page-light">
      <div className="grid-container page-top-space">
        <nav className="breadcrumb"><a href="/">홈</a><ChevronRight /><span>제품</span></nav>
        <div className="products-title-row"><div><span className="eyebrow red">EXHAUST SYSTEMS</span><h1>배기 시스템</h1><p>관리자가 등록하고 공개한 상품을 확인하세요.</p></div><span><strong>{loading ? "–" : visible.length}</strong> PRODUCTS</span></div>
        <div className={`selected-vehicle-bar ${hasVehicle ? "" : "unselected"}`}><div className="round-icon"><CarFront /></div><div><span>선택 차량</span><strong>{selectedVehicleLabel}{selectedVehicleDetail && ` · ${selectedVehicleDetail}`}</strong><small>{hasVehicle ? <><CheckCircle2 /> 선택 차량 기준으로 상품별 적합성 상태를 확인하세요</> : <><Info /> 차량을 선택하면 상품별 적합성 상태를 함께 확인할 수 있습니다</>}</small></div><a className="button secondary" href="/vehicles">{hasVehicle ? "차량 변경" : "차량 선택"}</a></div>
        <div className="product-toolbar"><label className="search-field"><Search /><input placeholder="제품명, SKU 검색" aria-label="제품 검색" /></label><button className="button secondary mobile-filter-button" onClick={() => setMobileFilter(true)}><SlidersHorizontal />필터</button><label className="sort-select"><span>정렬</span><select><option>추천순</option><option>가격 낮은순</option><option>가격 높은순</option></select></label></div>
        <div className="product-catalog-layout">
          <aside className={`filter-sidebar ${mobileFilter ? "mobile-open" : ""}`}>
            <div className="filter-mobile-head"><strong>필터</strong><button className="icon-link" onClick={() => setMobileFilter(false)}><X /></button></div>
            <FilterGroup title="적합성"><FilterRadio label="전체" checked={fitFilter === "ALL"} onClick={() => setFitFilter("ALL")} /><FilterRadio label="장착 확인" checked={fitFilter === "VERIFIED"} onClick={() => setFitFilter("VERIFIED")} /><FilterRadio label="상담 필요" checked={fitFilter === "CONSULTATION_REQUIRED"} onClick={() => setFitFilter("CONSULTATION_REQUIRED")} /></FilterGroup>
            <FilterGroup title="재고·판매 유형"><FilterRadio label="전체" checked={stockFilter === "ALL"} onClick={() => setStockFilter("ALL")} /><FilterRadio label="국내 재고" checked={stockFilter === "DOMESTIC"} onClick={() => setStockFilter("DOMESTIC")} /><FilterRadio label="해외발주" checked={stockFilter === "OVERSEAS_ORDER"} onClick={() => setStockFilter("OVERSEAS_ORDER")} /><FilterRadio label="예약판매" checked={stockFilter === "PREORDER"} onClick={() => setStockFilter("PREORDER")} /><FilterRadio label="품절" checked={stockFilter === "OUT_OF_STOCK"} onClick={() => setStockFilter("OUT_OF_STOCK")} /></FilterGroup>
            <FilterGroup title="시스템 유형"><FilterRadio label="Cat-back System" /><FilterRadio label="Axle-back System" /><FilterRadio label="Valved Exhaust" /><FilterRadio label="Exhaust Tip" /></FilterGroup>
            <button className="button primary full filter-apply" onClick={() => setMobileFilter(false)}>상품 {visible.length}개 보기</button>
          </aside>
          <section><div className="active-filters">{hasVehicle && <span>{selectedVehicleLabel}<button aria-label="차량 필터 삭제" onClick={() => { window.location.href = "/products"; }}><X /></button></span>}{stockFilter !== "ALL" && <span>{stockMap[stockFilter].label}<button onClick={() => setStockFilter("ALL")}><X /></button></span>}<button onClick={() => { setStockFilter("ALL"); setFitFilter("ALL"); }}><RotateCcw /> 초기화</button></div>{loading ? <ProductCatalogLoading /> : loadError ? <EmptyState icon={RotateCcw} title="상품을 불러오지 못했습니다" copy={loadError} action="다시 시도" onAction={reloadProducts} /> : visible.length ? <div className="product-grid catalog-grid">{visible.map((product) => <ProductCard key={product.slug} product={product} />)}</div> : <EmptyState icon={Package} title="공개된 상품이 없습니다" copy="관리자에서 상품을 등록하고 공개하면 이곳에 표시됩니다." action="상품 다시 불러오기" onAction={reloadProducts} />}</section>
        </div>
      </div>
    </div>
  );
}

function ProductCatalogLoading() {
  return <div className="catalog-loading" role="status" aria-live="polite"><div className="catalog-progress" aria-hidden="true"><span/></div><div className="catalog-loading-label"><RotateCcw/><span>등록 상품을 불러오는 중입니다…</span></div><div className="catalog-skeleton-grid" aria-hidden="true">{[0, 1, 2].map((item) => <div className="catalog-skeleton-card" key={item}><i/><span/><b/><small/></div>)}</div></div>;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="filter-group"><button className="filter-title"><strong>{title}</strong><ChevronDown /></button><div>{children}</div></div>;
}

function FilterRadio({ label, checked = false, onClick }: { label: string; checked?: boolean; onClick?: () => void }) {
  return <button className={`filter-radio ${checked ? "checked" : ""}`} onClick={onClick}><span>{checked && <Check />}</span>{label}</button>;
}

function DatabaseProductDetailPage({ slug, addToCart, showToast }: { slug: string; addToCart: (product: Product, quantity: number, optionName: string) => void; showToast: (message: string) => void }) {
  const [storedProduct, setStoredProduct] = useState<StoredProduct | null | undefined>(undefined);
  useEffect(() => {
    let active = true;
    fetch("/api/products?scope=public", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { products?: StoredProduct[] };
        if (!response.ok) throw new Error("Public products unavailable");
        if (active) setStoredProduct((data.products ?? []).find((product) => product.slug === slug) ?? null);
      })
      .catch(() => { if (active) setStoredProduct(null); });
    return () => { active = false; };
  }, [slug]);
  if (storedProduct === undefined) {
    return <div className="page-light"><div className="grid-container page-top-space"><div className="detail-loading" role="status" aria-live="polite"><div className="catalog-progress" aria-hidden="true"><span/></div><Package/><h3>상품 상세 정보를 불러오는 중입니다…</h3><div><i/><span/></div></div></div></div>;
  }
  if (!storedProduct) {
    return <div className="page-light"><div className="grid-container page-top-space"><EmptyState icon={Package} title="상품을 찾을 수 없습니다" copy="비공개되었거나 삭제된 상품입니다." action="제품 목록으로" onAction={() => { window.location.href = "/products"; }}/></div></div>;
  }
  return <ProductDetailPage product={storedProductToCatalogProduct(storedProduct)} addToCart={addToCart} showToast={showToast} />;
}

function ProductDetailPage({ product, addToCart, showToast }: { product: Product; addToCart: (product: Product, quantity: number, optionName: string) => void; showToast: (message: string) => void }) {
  const [tip, setTip] = useState("Carbon Quad");
  const [quantity, setQuantity] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryImages = product.images?.length ? product.images : [{ url: product.image, altText: `${product.name} 제품 이미지` }];
  const previousImage = () => setGalleryIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length);
  const nextImage = () => setGalleryIndex((index) => (index + 1) % galleryImages.length);
  const fitment = fitmentMap[product.fitment];
  const stock = stockMap[product.stock];
  const FitIcon = fitment.icon;
  const StockIcon = stock.icon;
  const cta = product.stock === "OUT_OF_STOCK" ? "재입고 알림" : product.fitment === "CONSULTATION_REQUIRED" ? "적합성 상담" : product.stock === "OVERSEAS_ORDER" ? "해외발주로 주문" : product.stock === "PREORDER" ? "예약 주문하기" : "장바구니 담기";
  const handleCta = async () => {
    if (product.stock === "OUT_OF_STOCK") {
      await saveAction("restock", { product: product.sku }); showToast("재입고 알림 신청을 접수했습니다.");
    } else if (product.fitment === "CONSULTATION_REQUIRED") {
      await saveAction("inquiry", { product: product.sku, vehicle: "BMW M3 G80" }); window.location.href = "/support/inquiry";
    } else addToCart(product, quantity, `${tip} · Valve Controller`);
  };
  return (
    <div className="product-detail page-light">
      <div className="grid-container detail-top-space"><nav className="breadcrumb"><a href="/">홈</a><ChevronRight /><a href="/products">제품</a><ChevronRight /><span>{product.name}</span></nav>
        <div className="product-detail-grid">
          <section className="product-gallery"><div className="gallery-main"><img key={galleryImages[galleryIndex].url} src={galleryImages[galleryIndex].url} alt={galleryImages[galleryIndex].altText || `${product.name} 제품 이미지 ${galleryIndex + 1}`} /><span className="image-index">{String(galleryIndex + 1).padStart(2, "0")} / {String(galleryImages.length).padStart(2, "0")}</span><button className="gallery-arrow left" aria-label="이전 이미지" onClick={previousImage} disabled={galleryImages.length < 2}><ArrowLeft /></button><button className="gallery-arrow right" aria-label="다음 이미지" onClick={nextImage} disabled={galleryImages.length < 2}><ArrowRight /></button></div><div className="gallery-thumbs">{galleryImages.map((image, index) => <button className={index === galleryIndex ? "active" : ""} key={`${image.url}-${index}`} onClick={() => setGalleryIndex(index)} aria-label={`${index + 1}번 이미지 보기`} aria-pressed={index === galleryIndex}><img src={image.url} alt={image.altText || `${product.name} 썸네일 ${index + 1}`} /></button>)}</div></section>
          <aside className="purchase-panel"><span className="eyebrow red">{product.category}</span><h1>{product.name}</h1><p className="product-sku">SKU {product.sku}</p><div className="panel-badges"><FitmentBadge status={product.fitment} /><StockBadge stock={product.stock} /></div><div className="detail-price"><strong>{formatPrice(product.price)}</strong><span>원</span><small>장착비 별도 · 상담 후 안내</small></div>
            <div className={`fitment-panel ${fitment.className}`}><div><FitIcon /><strong>{fitment.label}</strong></div><p>{fitment.description}</p><span>{product.compatibleVehicles[0]?.replaceAll("|", " ") ?? "차량별 적합성 확인 필요"}</span><button>판단 근거 보기 <ChevronRight /></button></div>
            <div className={`stock-panel ${stock.className}`}><StockIcon /><div><strong>{stock.label}</strong><p>{stock.copy}</p></div></div>
            <div className="option-block"><div><strong>팁 옵션</strong><span>필수</span></div><div className="option-chips">{["Carbon Quad", "Black Chrome"].map((item) => <button key={item} className={tip === item ? "selected" : ""} onClick={() => setTip(item)}>{item}{tip === item && <Check />}</button>)}</div></div>
            <div className="quantity-row"><strong>수량</strong><div><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)}><Plus /></button></div></div>
            <button className="button primary full large" onClick={handleCta}>{cta} <ArrowRight /></button><button className="button secondary full"><MessageCircle /> 장착 조건 상담</button><p className="purchase-note"><ShieldCheck /> 결제 직전 가격·재고·적합성을 다시 확인합니다.</p>
          </aside>
        </div>
      </div>
      <nav className="detail-tabs"><div className="grid-container"><a href="#overview">제품 소개</a><a href="#sound">배기음</a><a href="#specs">기술 사양</a><a href="#fitment">장착 조건</a><a href="#policy">보증·반품</a></div></nav>
      <section id="overview" className="section detail-story"><div className="grid-container story-grid"><div><span className="eyebrow red">ENGINEERED DETAIL</span><h2>정확한 라인,<br />절제된 존재감</h2><p>{product.kicker}. 차량 하부 구조와 순정 장착 포인트를 고려한 제품 구성을 확인하세요.</p></div><div className="story-image"><img src={galleryImages[1]?.url ?? galleryImages[0].url} alt={galleryImages[1]?.altText || galleryImages[0].altText} /><span>{product.material.split(" · ")[0]}</span></div></div></section>
      <section id="sound" className="section detail-dark-block"><div className="grid-container"><SectionHeading eyebrow="SOUND SAMPLE" title={`${product.name} · Sound Sample`} copy="녹음 환경과 재생 기기에 따라 실제 소리는 다르게 들릴 수 있습니다." /><SoundPlayer /></div></section>
      <section id="specs" className="section"><div className="grid-container spec-layout"><div><span className="eyebrow red">SPECIFICATIONS</span><h2>기술 사양</h2></div><dl className="spec-table"><div><dt>재질</dt><dd>{product.material.split(" · ")[0]}</dd></div><div><dt>시스템 구성</dt><dd>{product.category}</dd></div><div><dt>밸브</dt><dd>{product.category.includes("VALVED") ? "전자식 밸브 포함" : "해당 없음"}</dd></div><div><dt>팁 구성</dt><dd>{tip}</dd></div><div><dt>장착 시간</dt><dd>상담 후 안내</dd></div><div><dt>인증·구조변경</dt><dd>차량 사양과 지역 기준에 따라 별도 확인 필요</dd></div></dl></div></section>
      <section id="fitment" className="section detail-fitment-info"><div className="grid-container"><div className="notice-card"><CircleHelp /><div><h3>장착과 관련 규정은 차량별 확인이 필요합니다</h3><p>화면의 적합성은 등록된 제품·차량 데이터를 기준으로 하며 법적 적합성이나 성능 향상을 보장하지 않습니다.</p></div><a href="/support/inquiry">적합성 문의 <ArrowRight /></a></div></div></section>
      <div className="product-mobile-action"><div><span>{formatPrice(product.price)}원</span><small>{fitment.label}</small></div><button className="button primary" onClick={handleCta}>{cta}</button></div>
    </div>
  );
}

function CartPage({ items, ready, updateQuantity, removeItem }: { items: CartItem[]; ready: boolean; updateQuantity: (sku: string, optionName: string, quantity: number) => void; removeItem: (sku: string, optionName: string) => void }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="cart-page page-light"><div className="grid-container narrow-page"><nav className="breadcrumb"><a href="/">홈</a><ChevronRight /><span>장바구니</span></nav><div className="page-title-simple"><h1>장바구니</h1><span>{ready ? `${quantity}개 상품` : "불러오는 중"}</span></div>{!ready ? <div className="cart-loading" role="status"><RotateCcw/>저장된 장바구니를 불러오는 중입니다…</div> : <div className="checkout-layout"><section>{items.length > 0 ? <><div className="revalidation-note"><RotateCcw /><div><strong>저장된 장바구니를 불러왔습니다</strong><span>상품 가격과 판매 상태는 주문 접수 시 서버에서 다시 확인합니다.</span></div></div><div className="cart-group"><div className="cart-group-head"><div><PackageCheck /><strong>장바구니 상품</strong></div><span>이 브라우저에 자동 저장됨</span></div>{items.map((item) => <article className="cart-item" key={`${item.sku}-${item.optionName}`}><input type="checkbox" checked readOnly aria-label={`${item.name} 선택`} /><img src={item.image} alt={item.name} /><div className="cart-item-info"><div className="badge-row"><FitmentBadge status={item.fitment} /></div><h3>{item.name}</h3><p>{item.optionName}</p><span>{item.vehicleSnapshot ?? `SKU ${item.sku}`}</span><div className="cart-item-bottom"><div className="quantity-control"><button onClick={() => updateQuantity(item.sku, item.optionName, item.quantity - 1)} aria-label={`${item.name} 수량 줄이기`}><Minus /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.sku, item.optionName, item.quantity + 1)} aria-label={`${item.name} 수량 늘리기`}><Plus /></button></div><strong>{formatPrice(item.price * item.quantity)}원</strong></div></div><button className="cart-delete" aria-label={`${item.name} 삭제`} onClick={() => removeItem(item.sku, item.optionName)}><X /></button></article>)}</div></> : <div className="cart-empty"><ShoppingBag/><h2>장바구니가 비어 있습니다</h2><p>어드민에서 공개한 상품을 둘러보고 필요한 제품을 담아보세요.</p><a className="button primary" href="/products">상품 보러 가기 <ArrowRight/></a></div>}<a className="text-link" href="/products"><ArrowLeft /> 쇼핑 계속하기</a></section><OrderSummary total={total} actionHref="/checkout" action="주문하기" disabled={items.length === 0} /></div>}</div></div>
  );
}

function OrderSummary({ total, actionHref, action, disabled = false }: { total: number; actionHref: string; action: string; disabled?: boolean }) {
  return <aside className="order-summary"><h2>주문 요약</h2><dl><div><dt>상품 금액</dt><dd>{formatPrice(total)}원</dd></div><div><dt>배송비</dt><dd>무료</dd></div><div><dt>장착비</dt><dd>상담 후 안내</dd></div></dl><div className="summary-total"><span>결제 예정 금액</span><strong>{formatPrice(total)}<small>원</small></strong></div>{disabled ? <button className="button primary full large" disabled>주문할 상품이 없습니다</button> : <a className="button primary full large" href={actionHref}>{action} <ArrowRight /></a>}<p><LockKeyhole /> 상품 가격은 주문 시 다시 검증됩니다.</p></aside>;
}

function CheckoutPage({ items, ready, clearCart, showToast }: { items: CartItem[]; ready: boolean; clearCart: () => void; showToast: (message: string) => void }) {
  const [agree, setAgree] = useState(false);
  const [processing, setProcessing] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    recipientName: "",
    recipientPhone: "",
    postalCode: "",
    addressLine1: "",
    addressLine2: "",
    fulfillmentMethod: "INSTALLER_DELIVERY",
    paymentMethod: "BANK_TRANSFER",
  });
  const idempotencyKey = useRef<string | null>(null);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    if (processing) return;
    if (!ready || items.length === 0) { showToast("장바구니에 주문할 상품이 없습니다."); return; }
    if (!agree) { showToast("필수 동의 항목을 확인해 주세요."); return; }
    if (!form.customerName || !form.customerPhone || !form.customerEmail || !form.recipientName || !form.recipientPhone || !form.postalCode || !form.addressLine1) {
      showToast("주문자와 배송지의 필수 정보를 입력해 주세요.");
      return;
    }
    setProcessing(true);
    idempotencyKey.current ??= window.crypto.randomUUID();
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          idempotencyKey: idempotencyKey.current,
          items: items.map((item) => ({
            productSku: item.sku,
            quantity: item.quantity,
            optionName: item.optionName,
            vehicleSnapshot: item.vehicleSnapshot,
          })),
        }),
      });
      const data = (await response.json()) as { order?: StoredOrder; error?: string };
      if (!response.ok || !data.order) {
        showToast(data.error ?? "주문을 접수하지 못했습니다.");
        setProcessing(false);
        return;
      }
      clearCart();
      window.location.href = `/checkout/complete?order=${encodeURIComponent(data.order.orderNumber)}`;
    } catch {
      showToast("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
      setProcessing(false);
    }
  };
  if (!ready) {
    return <div className="checkout-page page-light"><div className="checkout-header"><div className="grid-container"><BrandMark dark /><ol><li className="done"><Check />장바구니</li><li className="active"><span>2</span>주문 접수</li><li><span>3</span>완료</li></ol><a href="/cart"><X /></a></div></div><div className="grid-container narrow-page"><div className="cart-loading" role="status"><RotateCcw/>저장된 주문 상품을 불러오는 중입니다…</div></div></div>;
  }
  if (items.length === 0) {
    return <div className="checkout-page page-light"><div className="checkout-header"><div className="grid-container"><BrandMark dark /><ol><li className="done"><Check />장바구니</li><li className="active"><span>2</span>주문 접수</li><li><span>3</span>완료</li></ol><a href="/cart"><X /></a></div></div><div className="grid-container narrow-page"><div className="cart-empty"><ShoppingBag/><h2>주문할 상품이 없습니다</h2><p>장바구니에 상품을 담은 뒤 주문을 진행해 주세요.</p><a className="button primary" href="/products">상품 보러 가기 <ArrowRight/></a></div></div></div>;
  }
  return (
    <div className="checkout-page page-light"><div className="checkout-header"><div className="grid-container"><BrandMark dark /><ol><li className="done"><Check />장바구니</li><li className="active"><span>2</span>주문 접수</li><li><span>3</span>완료</li></ol><a href="/cart"><X /></a></div></div><div className="grid-container narrow-page checkout-body"><h1>주문 정보</h1><div className="checkout-layout"><div className="checkout-sections"><CheckoutSection number="01" title="주문자 정보"><div className="form-grid"><Field label="이름" placeholder="홍길동" value={form.customerName} onValueChange={(value) => update("customerName", value)} /><Field label="연락처" placeholder="010-0000-0000" type="tel" value={form.customerPhone} onValueChange={(value) => update("customerPhone", value)} /><Field label="이메일" placeholder="name@example.com" type="email" value={form.customerEmail} onValueChange={(value) => update("customerEmail", value)} wide /></div></CheckoutSection><CheckoutSection number="02" title="배송지"><div className="form-grid"><Field label="받는 분" placeholder="홍길동" value={form.recipientName} onValueChange={(value) => update("recipientName", value)} /><Field label="연락처" placeholder="010-0000-0000" type="tel" value={form.recipientPhone} onValueChange={(value) => update("recipientPhone", value)} /><Field label="우편번호" placeholder="우편번호 입력" value={form.postalCode} onValueChange={(value) => update("postalCode", value)} /><Field label="주소" placeholder="기본 주소 입력" value={form.addressLine1} onValueChange={(value) => update("addressLine1", value)} /><Field label="상세 주소" placeholder="상세 주소 입력" value={form.addressLine2} onValueChange={(value) => update("addressLine2", value)} wide /></div></CheckoutSection><CheckoutSection number="03" title="수령 방식"><div className="choice-grid"><label className={`choice-card ${form.fulfillmentMethod === "INSTALLER_DELIVERY" ? "selected" : ""}`}><input type="radio" name="install" checked={form.fulfillmentMethod === "INSTALLER_DELIVERY"} onChange={() => update("fulfillmentMethod", "INSTALLER_DELIVERY")} /><Store /><strong>장착점으로 배송</strong><span>구매 후 장착 예약 신청</span>{form.fulfillmentMethod === "INSTALLER_DELIVERY" && <CheckCircle2 />}</label><label className={`choice-card ${form.fulfillmentMethod === "STANDARD_DELIVERY" ? "selected" : ""}`}><input type="radio" name="install" checked={form.fulfillmentMethod === "STANDARD_DELIVERY"} onChange={() => update("fulfillmentMethod", "STANDARD_DELIVERY")} /><Truck /><strong>일반 배송</strong><span>입력한 주소로 배송</span>{form.fulfillmentMethod === "STANDARD_DELIVERY" && <CheckCircle2 />}</label></div></CheckoutSection><CheckoutSection number="04" title="결제 방법"><div className="payment-options"><button className={form.paymentMethod === "CARD" ? "selected" : ""} onClick={() => update("paymentMethod", "CARD")}>신용·체크카드 {form.paymentMethod === "CARD" && <Check />}</button><button className={form.paymentMethod === "EASY_PAY" ? "selected" : ""} onClick={() => update("paymentMethod", "EASY_PAY")}>간편결제 {form.paymentMethod === "EASY_PAY" && <Check />}</button><button className={form.paymentMethod === "BANK_TRANSFER" ? "selected" : ""} onClick={() => update("paymentMethod", "BANK_TRANSFER")}>무통장입금 {form.paymentMethod === "BANK_TRANSFER" && <Check />}</button></div><p className="payment-disclaimer"><Info /> 현재 PG가 연결되지 않아 주문 접수 후 결제 확인 대기 상태로 저장됩니다.</p></CheckoutSection><CheckoutSection number="05" title="약관 동의"><label className="consent-all"><input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} /><span><Check /></span><strong>필수 약관에 모두 동의합니다</strong></label><label className="consent-row"><input type="checkbox" checked={agree} readOnly /><span>[필수] 구매조건 및 주문 진행 동의</span><a href="#">보기</a></label><label className="consent-row"><input type="checkbox" checked={agree} readOnly /><span>[필수] 개인정보 수집·이용 동의</span><a href="#">보기</a></label><label className="consent-row"><input type="checkbox" /><span>[선택] 장착 정보 및 혜택 알림 동의</span><a href="#">보기</a></label></CheckoutSection></div><aside className="order-summary checkout-summary"><h2>주문 상품</h2><div className="summary-product-list">{items.map((item) => <div className="summary-product" key={`${item.sku}-${item.optionName}`}><img src={item.image} alt={item.name} /><div><strong>{item.name}</strong><span>{item.optionName} · {item.quantity}개</span></div></div>)}</div><dl><div><dt>상품 금액</dt><dd>{formatPrice(total)}원</dd></div><div><dt>배송비</dt><dd>무료</dd></div><div><dt>장착비</dt><dd>상담 후 안내</dd></div></dl><div className="summary-total"><span>주문 금액</span><strong>{formatPrice(total)}<small>원</small></strong></div><button className="button primary full large" disabled={processing} onClick={submit}>{processing ? "DB에 주문 저장 중…" : `${formatPrice(total)}원 주문 접수`}</button><p><LockKeyhole /> 상품 가격과 판매 상태는 서버에서 다시 검증됩니다.</p></aside></div></div><div className="checkout-mobile-action"><div><span>주문 금액</span><strong>{formatPrice(total)}원</strong></div><button className="button primary" onClick={submit} disabled={processing}>{processing ? "저장 중…" : "주문 접수"}</button></div></div>
  );
}

function Field({ label, placeholder, wide = false, type = "text", value, onValueChange }: { label: string; placeholder: string; wide?: boolean; type?: string; value?: string; onValueChange?: (value: string) => void }) {
  return <label className={wide ? "wide" : ""}><span>{label}</span><input type={type} placeholder={placeholder} {...(value !== undefined ? { value, onChange: (event: React.ChangeEvent<HTMLInputElement>) => onValueChange?.(event.target.value) } : {})} /></label>;
}

function CheckoutSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="checkout-section"><div className="checkout-section-title"><span>{number}</span><h2>{title}</h2></div>{children}</section>;
}

function CompletePage() {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const orderNumber = new URLSearchParams(window.location.search).get("order");
    if (!orderNumber) { queueMicrotask(() => setError("주문번호가 없습니다.")); return; }
    fetch(`/api/orders/${encodeURIComponent(orderNumber)}`)
      .then(async (response) => {
        const data = (await response.json()) as { order?: OrderDetail; error?: string };
        if (!response.ok || !data.order) throw new Error(data.error ?? "주문을 불러오지 못했습니다.");
        setOrder(data.order);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "주문을 불러오지 못했습니다."));
  }, []);
  const orderedAt = order ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" }).format(new Date(order.createdAt)) : "확인 중";
  return (
    <div className="complete-page page-light"><div className="grid-container complete-container"><div className="complete-icon"><Check /></div><span className="eyebrow red">ORDER RECEIVED</span><h1>{error ? "주문 확인이 필요합니다" : "주문이 접수되었습니다"}</h1><p>{error ? error : <>주문번호 <strong>{order?.orderNumber ?? "확인 중…"}</strong> · {paymentStatusLabels[order?.paymentStatus ?? "PENDING"]}</>}</p><div className="next-step-card"><div className="next-step-head"><PackageCheck /><div><strong>{order?.items[0]?.productName ?? "주문 상품 확인 중"}</strong><span>주문 확인 후 결제 및 출고 절차를 안내합니다</span></div></div><ol><li className="done"><span><Check /></span><div><strong>주문 접수</strong><small>{orderedAt}</small></div></li><li className="active"><span>2</span><div><strong>결제 확인</strong><small>결제 연동 또는 운영자 확인이 필요합니다</small></div></li><li><span>3</span><div><strong>상품 준비 및 배송</strong><small>확정 후 알림으로 안내합니다</small></div></li></ol></div><div className="complete-actions"><a className="button primary" href="/installation/booking">장착 예약 신청 <ArrowRight /></a><a className="button secondary" href={order ? `/mypage/orders/${order.orderNumber}` : "/mypage/orders"}>주문 내역 보기</a></div><p className="muted-note">장착 일정과 결제 완료 여부는 확인된 데이터만 표시합니다.</p></div></div>
  );
}

function InstallationPage({ booking, showToast }: { booking: boolean; showToast: (message: string) => void }) {
  const [selectedCenter, setSelectedCenter] = useState("서울");
  const [selectedDate, setSelectedDate] = useState("8월 12일");
  const submit = async () => { await saveAction("booking", { center: selectedCenter, preferredDate: selectedDate, status: "REQUESTED" }); showToast("장착 예약 신청을 접수했습니다."); };
  if (booking) return (
    <div className="booking-page page-light"><div className="page-hero compact dark-hero"><div className="grid-container"><span className="eyebrow red">INSTALLATION REQUEST</span><h1>장착 예약 신청</h1><p>희망 일정을 남겨주시면 장착점 확인 후 확정해 드립니다.</p></div></div><div className="grid-container booking-layout"><section className="booking-form"><div className="booking-summary"><img src={products[0].image} alt={products[0].name} /><div><FitmentBadge status="VERIFIED" /><h3>{products[0].name}</h3><p>BMW M3 G80 · 2022</p></div></div><CheckoutSection number="01" title="장착점 선택"><div className="installer-list">{["서울", "분당", "부산"].map((center) => <button key={center} className={selectedCenter === center ? "selected" : ""} onClick={() => setSelectedCenter(center)}><MapPin /><div><strong>Taibosi {center === "서울" ? "Seoul Performance Center" : `${center} Partner`}</strong><span>{center} 지역 · 샘플 장착점</span></div>{selectedCenter === center && <CheckCircle2 />}</button>)}</div></CheckoutSection><CheckoutSection number="02" title="희망 날짜"><div className="date-chips">{["8월 12일", "8월 13일", "8월 14일", "8월 18일"].map((date) => <button className={selectedDate === date ? "selected" : ""} onClick={() => setSelectedDate(date)} key={date}>{date}<small>희망일</small></button>)}</div></CheckoutSection><CheckoutSection number="03" title="희망 시간"><div className="option-chips"><button className="selected">오전 <Check /></button><button>오후</button><button>시간 협의</button></div><label className="textarea-label"><span>요청사항</span><textarea placeholder="차량 상태나 장착 관련 요청사항을 남겨주세요." /></label></CheckoutSection><button className="button primary large full" onClick={submit}>예약 신청하기 <ArrowRight /></button></section><aside className="booking-note"><Clock3 /><h3>‘확정’이 아닌 ‘신청’입니다</h3><p>실시간 장착 가능 데이터가 제공되지 않아 선택한 날짜는 희망 일정으로 접수됩니다. 장착점 검토 후 연락드립니다.</p><dl><div><dt>선택 장착점</dt><dd>{selectedCenter}</dd></div><div><dt>희망 날짜</dt><dd>{selectedDate}</dd></div><div><dt>상태</dt><dd><span className="status-badge warning"><Clock3 />확인 대기</span></dd></div></dl></aside></div></div>
  );
  return (
    <div className="installation-page page-light"><div className="installation-hero"><img src={garageImage} alt="퍼포먼스 차량 장착 공간" /><div className="hero-overlay"/><div className="grid-container"><span className="eyebrow red">INSTALLATION SUPPORT</span><h1>제품과 차량을 아는<br />장착점으로 연결합니다</h1><p>구매한 상품과 차량 정보를 그대로 이어 받아 장착 상담과 예약 신청을 진행합니다.</p><a className="button primary" href="/installation/booking">장착 예약 신청 <ArrowRight /></a></div></div><section className="section"><div className="grid-container"><SectionHeading eyebrow="HOW IT WORKS" title="장착 신청 과정" /><div className="operations-grid"><OperationCard index="01" icon={ShoppingBag} title="상품 구매" copy="차량 적합성과 재고 유형을 확인합니다."/><OperationCard index="02" icon={CalendarDays} title="희망 일정 신청" copy="장착점과 희망 날짜·시간을 남깁니다."/><OperationCard index="03" icon={MessageCircle} title="장착점 확인" copy="담당자가 조건과 일정을 검토합니다."/><OperationCard index="04" icon={CheckCircle2} title="일정 확정" copy="확정된 일정과 준비사항을 안내합니다."/></div></div></section><section className="section installers-list-section"><div className="grid-container"><SectionHeading eyebrow="SAMPLE INSTALLERS" title="장착점 안내" copy="아래 정보는 개발 환경용 샘플입니다."/><div className="installer-card-grid">{["Seoul Performance Center", "Bundang Partner", "Busan Partner"].map((name, index) => <article key={name}><div className="installer-photo"><Store /><span>0{index + 1}</span></div><h3>Taibosi {name}</h3><p><MapPin /> {index === 0 ? "서울" : index === 1 ? "경기 성남" : "부산"} · 샘플 주소</p><a className="text-link" href="/installation/booking">예약 신청 <ArrowRight /></a></article>)}</div></div></section><SupportCTA /></div>
  );
}

function SupportPage({ path, showToast }: { path: string; showToast: (message: string) => void }) {
  const isForm = path.includes("inquiry") || path.includes("return") || path.includes("warranty");
  const [openFaq, setOpenFaq] = useState(0);
  const defaultType = path.includes("return") ? "RETURN_EXCHANGE" : path.includes("warranty") ? "WARRANTY_AS" : "FITMENT";
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const [form, setForm] = useState({
    type: defaultType,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    subject: "",
    body: "",
  });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    if (processing) return;
    setError("");
    if (form.customerName.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(form.customerEmail.trim()) || form.customerPhone.trim().length < 8 || form.subject.trim().length < 2 || form.body.trim().length < 5) {
      setError("이름, 이메일, 연락처, 제목과 문의 내용을 모두 정확히 입력해 주세요.");
      return;
    }
    setProcessing(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, sourcePath: path }),
      });
      const data = (await response.json()) as { inquiry?: StoredInquiry; error?: string };
      if (!response.ok || !data.inquiry) {
        setError(data.error ?? "문의를 접수하지 못했습니다.");
        return;
      }
      setReceipt(data.inquiry.inquiryNumber);
      setForm((current) => ({ ...current, customerName: "", customerEmail: "", customerPhone: "", subject: "", body: "" }));
      showToast("문의가 정상적으로 접수되었습니다.");
    } catch {
      setError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setProcessing(false);
    }
  };
  return (
    <div className="support-page page-light"><div className="page-hero compact dark-hero"><div className="grid-container"><span className="eyebrow red">CUSTOMER SUPPORT</span><h1>{isForm ? "문의 접수" : "무엇을 도와드릴까요?"}</h1><p>제품, 적합성, 주문, 장착, AS 문의를 국내 운영팀에 남겨주세요.</p></div></div><div className="grid-container support-content">{isForm ? <div className="support-form-layout"><section className="support-form">{receipt && <div className="support-receipt" role="status"><CheckCircle2/><div><strong>문의가 정상적으로 접수되었습니다</strong><span>접수번호 {receipt}</span></div></div>}{error && <div className="support-form-error" role="alert"><AlertTriangle/>{error}</div>}<div className="form-grid"><label><span>문의 유형</span><select value={form.type} onChange={(event) => update("type", event.target.value)}><option value="FITMENT">차량 적합성 문의</option><option value="INSTALLATION">장착 조건 문의</option><option value="ORDER_DELIVERY">주문·배송 문의</option><option value="WARRANTY_AS">보증·AS 문의</option><option value="RETURN_EXCHANGE">반품·교환 문의</option><option value="OTHER">기타 문의</option></select></label><Field label="이름" placeholder="이름을 입력해 주세요" value={form.customerName} onValueChange={(value) => update("customerName", value)}/><Field label="이메일" placeholder="name@example.com" type="email" value={form.customerEmail} onValueChange={(value) => update("customerEmail", value)}/><Field label="연락처" placeholder="010-0000-0000" type="tel" value={form.customerPhone} onValueChange={(value) => update("customerPhone", value)}/><Field label="제목" placeholder="문의 제목을 입력해 주세요" value={form.subject} onValueChange={(value) => update("subject", value)} wide/><label className="wide"><span>문의 내용</span><textarea value={form.body} onChange={(event) => update("body", event.target.value)} maxLength={5000} placeholder="차량 세부 사양과 궁금한 점을 남겨주세요."/><small className="field-counter">{form.body.length}/5,000</small></label><div className="wide support-attachment-note"><Info/><span>파일 첨부는 준비 중입니다. 필요한 사진은 접수 후 담당자가 별도로 안내합니다.</span></div></div><button className="button primary large" disabled={processing} onClick={submit}>{processing ? "문의 저장 중…" : "문의 접수하기"} {!processing && <ArrowRight />}</button></section><aside className="support-side"><Headphones/><h3>접수 전 확인해 주세요</h3><p>접수된 내용은 PostgreSQL에 저장되며 운영자가 문의·AS 화면에서 확인합니다. 차대번호는 담당자가 필요한 경우 별도로 요청합니다.</p><a href="/support/faq">자주 묻는 질문 <ArrowRight/></a></aside></div> : <><div className="support-quick-grid"><a href="/support/faq"><CircleHelp/><strong>자주 묻는 질문</strong><span>제품·주문·장착 안내</span><ChevronRight/></a><a href="/support/inquiry"><MessageCircle/><strong>1:1 문의</strong><span>차량 정보와 함께 접수</span><ChevronRight/></a><a href="/support/return"><RotateCcw/><strong>반품·교환</strong><span>정책과 신청 절차</span><ChevronRight/></a><a href="/support/warranty"><ShieldCheck/><strong>보증·AS</strong><span>보증 범위와 접수</span><ChevronRight/></a></div><section className="faq-section"><div><span className="eyebrow red">FAQ</span><h2>자주 묻는 질문</h2></div><div className="faq-list">{["내 차량에 장착 가능한지 어떻게 확인하나요?", "해외발주 상품의 일정은 언제 알 수 있나요?", "장착비는 상품 가격에 포함되나요?", "구조변경이나 소음 기준을 보장하나요?"].map((question, index) => <article key={question} className={openFaq === index ? "open" : ""}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)}><span>0{index + 1}</span><strong>{question}</strong><Plus/></button>{openFaq === index && <p>{index === 0 ? "차량을 선택하면 등록된 적합성 상태와 판단 근거를 함께 보여드립니다. 데이터가 부족한 경우 상담으로 연결합니다." : "확정된 데이터가 있는 범위만 안내하며, 임의의 기간이나 법적 보장을 표시하지 않습니다."}</p>}</article>)}</div></section></>}</div></div>
  );
}

function MyPage({ path }: { path: string }) {
  const section = path.split("/")[2] || "overview";
  const labels: Record<string, string> = { overview: "마이페이지", vehicles: "내 차량", orders: "주문 내역", bookings: "장착 예약", inquiries: "문의·AS" };
  return (
    <div className="mypage page-light"><div className="grid-container mypage-layout"><aside className="mypage-sidebar"><div className="user-card"><span>HK</span><div><strong>홍길동 님</strong><small>taibosi.demo@example.com</small></div></div><nav><a className={section === "overview" ? "active" : ""} href="/mypage"><LayoutDashboard/>대시보드</a><a className={section === "vehicles" ? "active" : ""} href="/mypage/vehicles"><CarFront/>내 차량</a><a className={section === "orders" ? "active" : ""} href="/mypage/orders"><ShoppingBag/>주문 내역</a><a className={section === "bookings" ? "active" : ""} href="/mypage/bookings"><CalendarDays/>장착 예약</a><a className={section === "inquiries" ? "active" : ""} href="/mypage/inquiries"><MessageCircle/>문의·AS</a></nav></aside><section className="mypage-main"><span className="eyebrow red">MY TAIBOSI</span><h1>{labels[section] ?? "주문 상세"}</h1>{section === "vehicles" ? <><div className="saved-vehicle-card"><div className="vehicle-silhouette small"><CarFront/><span>G80</span></div><div><span className="status-badge success"><CheckCircle2/>기본 차량</span><h2>BMW M3 G80</h2><p>2022 · 3.0 가솔린 · 후륜 · 세단</p><div><a className="button primary" href="/products">호환 제품 보기</a><button className="button secondary">차량 정보 수정</button></div></div></div><button className="add-vehicle"><Plus/>새 차량 등록</button></> : section === "orders" || path.split("/").length > 3 ? <OrderHistoryDetail/> : <div className="mypage-dashboard"><div className="mypage-kpis"><article><ShoppingBag/><span>진행 중 주문</span><strong>1</strong></article><article><CalendarDays/><span>장착 신청</span><strong>1</strong></article><article><MessageCircle/><span>답변 대기</span><strong>0</strong></article></div><h2>최근 주문</h2><OrderRow/></div>}</section></div></div>
  );
}

function OrderRow() { return <a className="order-row" href="/mypage/orders/TB-260804-0142"><div><span>TB-260804-0142</span><strong>BMW G80/G82 Valved Cat-back Exhaust</strong><small>2026.08.04 · 3,200,000원</small></div><span className="status-badge info"><Package/>상품 준비</span><ChevronRight/></a>; }
function OrderHistoryDetail() { return <div className="order-detail-card"><div className="order-detail-head"><div><span>주문번호 TB-260804-0142</span><h2>상품을 준비하고 있습니다</h2><p>재고 최종 확인 후 다음 상태를 안내합니다.</p></div><span className="status-badge info"><Package/>상품 준비</span></div><div className="timeline-row"><span className="done"><Check/></span><i/><span className="active">2</span><i/><span>3</span><i/><span>4</span></div><div className="order-product-mini"><img src={products[0].image} alt={products[0].name}/><div><strong>{products[0].name}</strong><span>Carbon Quad · 1개</span><small>BMW M3 G80 · 적합성 스냅샷: 장착 확인</small></div><b>3,200,000원</b></div><a className="button primary" href="/installation/booking">장착 예약 신청</a></div>; }

function AuthPage({ signup }: { signup: boolean }) {
  return <div className="auth-page"><div className="auth-visual"><img src={heroImage} alt="퍼포먼스 차량 리어 디테일"/><div className="hero-overlay"/><div><span className="eyebrow red">PRECISION FIT</span><h1>내 차량을 저장하고<br/>더 빠르게 확인하세요</h1><p>호환 상품, 주문, 장착 예약을 한곳에서 이어보세요.</p></div></div><div className="auth-panel"><BrandMark dark/><div className="auth-form"><span className="eyebrow red">{signup ? "CREATE ACCOUNT" : "WELCOME BACK"}</span><h1>{signup ? "회원가입" : "로그인"}</h1><p>{signup ? "내 차량 기반의 편리한 구매 경험을 시작하세요." : "저장한 차량과 주문 정보를 확인하세요."}</p>{signup && <Field label="이름" placeholder="이름 입력"/>}<Field label="이메일" placeholder="name@example.com"/><Field label="비밀번호" placeholder="8자 이상 입력"/><label className="remember"><input type="checkbox"/> 로그인 상태 유지<a href="#">비밀번호 찾기</a></label><a className="button primary full large" href="/mypage">{signup ? "가입하기" : "로그인"}</a><div className="auth-divider"><span>또는</span></div><button className="button secondary full">데모 계정으로 계속</button><p className="auth-switch">{signup ? "이미 계정이 있나요?" : "아직 회원이 아니신가요?"} <a href={signup ? "/login" : "/signup"}>{signup ? "로그인" : "회원가입"}</a></p></div></div></div>;
}

function BrandPage() {
  return <div className="brand-page"><section className="brand-hero"><img src={heroImage} alt="배기 시스템이 장착된 퍼포먼스 차량의 후면"/><div className="hero-overlay"/><div className="grid-container"><span className="eyebrow red">OUR STANDARD</span><h1>Precision Fit,<br/>Confident Performance</h1><p>Taibosi Exhaust Korea는 차량 적합성, 재고 유형, 장착 조건을 먼저 확인하는 퍼포먼스 커머스를 지향합니다.</p></div></section><section className="section page-light"><div className="grid-container brand-manifesto"><div><span className="eyebrow red">WHAT WE VALUE</span><h2>감각적인 선택보다<br/>확신 있는 선택을 위해</h2></div><div><article><strong>01</strong><h3>정확성</h3><p>제조사, 모델, 세대, 연식, 엔진 정보를 구매 판단의 기준으로 둡니다.</p></article><article><strong>02</strong><h3>투명한 운영</h3><p>국내 재고와 해외발주, 예약판매를 구분해 다음 단계를 안내합니다.</p></article><article><strong>03</strong><h3>국내 지원</h3><p>주문 이후 장착 상담과 문의·AS까지 하나의 여정으로 연결합니다.</p></article></div></div></section><SupportCTA/></div>;
}

function InformationPage({ path }: { path: string }) {
  return <div className="information-page page-light"><div className="page-hero compact dark-hero"><div className="grid-container"><span className="eyebrow red">TAIBOSI GUIDE</span><h1>{path.includes("privacy") ? "개인정보처리방침" : path.includes("terms") ? "이용약관" : "서비스 안내"}</h1><p>정확한 정보와 명확한 다음 행동을 안내합니다.</p></div></div><div className="grid-container prose-content"><h2>안내 사항</h2><p>이 데모 사이트는 Taibosi Exhaust Korea의 제품 경험과 운영 흐름을 검증하기 위한 샘플입니다. 실제 상품, 장착점, 인증, 배송 일정으로 해석하지 마세요.</p><h3>제품 및 적합성 정보</h3><p>적합성 상태는 등록된 차량 및 제품 정보를 기준으로 표시됩니다. 차량의 세부 사양과 추가 부품에 따라 별도 확인이 필요할 수 있습니다.</p><h3>주문 및 장착</h3><p>확정 데이터가 없는 경우 일정이나 장착비를 임의로 표시하지 않으며, 상담 후 안내 또는 확인 중 상태로 제공합니다.</p></div></div>;
}

function SupportCTA() {
  return <section className="support-cta"><div className="grid-container"><div><span className="eyebrow">NEED A FITMENT CHECK?</span><h2>내 차에 맞는지 확신이 없다면</h2><p>차량과 제품 정보를 함께 남겨주시면 확인 후 안내해 드립니다.</p></div><a className="button light-button" href="/support/inquiry">차량 적합성 문의 <ArrowRight /></a></div></section>;
}

function EmptyState({ icon: Icon, title, copy, action, onAction }: { icon: LucideIcon; title: string; copy: string; action: string; onAction: () => void }) {
  return <div className="empty-state"><Icon/><h3>{title}</h3><p>{copy}</p><button className="button secondary" onClick={onAction}>{action}</button></div>;
}

function StoreFooter() {
  return <footer className="store-footer"><div className="grid-container"><div className="footer-top"><BrandMark/><nav><div><strong>SHOP</strong><a href="/vehicles">차량으로 찾기</a><a href="/products">전체 제품</a><a href="/brand">브랜드</a></div><div><strong>INSTALLATION</strong><a href="/installation">장착 안내</a><a href="/installers">장착점</a><a href="/installation/booking">장착 예약</a></div><div><strong>SUPPORT</strong><a href="/support/faq">자주 묻는 질문</a><a href="/support/inquiry">1:1 문의</a><a href="/support/warranty">보증·AS</a></div></nav></div><div className="footer-info"><p>본 사이트는 개발용 데모이며 표시된 상품·장착점은 샘플 데이터입니다.<br/>인증, 구조변경, 소음 기준 및 일정은 실제 상담 과정에서 별도 확인이 필요합니다.</p><div><a href="/terms">이용약관</a><a href="/privacy">개인정보처리방침</a><a href="/admin">운영자</a></div></div><div className="footer-bottom"><span>© 2026 TAIBOSI EXHAUST KOREA. DEMO.</span><span>Automotive photos: Unsplash contributors</span></div></div></footer>;
}

const adminNav: Array<{ group: string; items: Array<[string, string, LucideIcon]> }> = [
  { group: "OVERVIEW", items: [["/admin", "대시보드", LayoutDashboard], ["/admin/analytics", "분석", BarChart3]] },
  { group: "COMMERCE", items: [["/admin/products", "상품 관리", Package], ["/admin/vehicles", "차량 마스터", CarFront], ["/admin/fitments", "적합성 매핑", ClipboardCheck], ["/admin/pricing", "가격 관리", FileText], ["/admin/inventory", "재고 관리", Warehouse], ["/admin/purchase-orders", "해외발주", Truck]] },
  { group: "OPERATIONS", items: [["/admin/orders", "주문", ShoppingBag], ["/admin/shipments", "배송", Box], ["/admin/bookings", "장착 예약", CalendarDays], ["/admin/customers", "고객", Users], ["/admin/support", "문의·AS", MessageCircle]] },
  { group: "SYSTEM", items: [["/admin/content", "콘텐츠", Sparkles], ["/admin/roles", "권한 관리", ShieldCheck], ["/admin/audit-logs", "감사 로그", Database]] },
];

function AdminApp({ path, showToast, toast }: { path: string; showToast: (message: string) => void; toast: string }) {
  const isLoginPage = path === "/admin/login" || path === "/admin/verify";
  const [authorized, setAuthorized] = useState(isLoginPage);
  useEffect(() => {
    if (isLoginPage) return;
    fetch("/api/admin/session", { cache: "no-store", credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) {
          window.location.replace("/admin/login");
          return;
        }
        setAuthorized(true);
      })
      .catch(() => window.location.replace("/admin/login"));
  }, [isLoginPage]);
  if (isLoginPage) return <AdminLogin />;
  if (!authorized) return <div className="admin-auth-loading"><LockKeyhole/><span>운영자 세션을 확인하는 중입니다…</span></div>;
  return <div className="admin-shell"><AdminSidebar path={path}/><div className="admin-workspace"><AdminTopbar showToast={showToast}/><main className="admin-main">{path === "/admin" ? <AdminDashboard/> : <AdminModule path={path} showToast={showToast}/>}</main></div>{toast && <div className="toast" role="status"><CheckCircle2 size={18}/>{toast}</div>}</div>;
}

function AdminLogin() {
  const [email, setEmail] = useState("admin@taibosi.demo");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const submit = async () => {
    if (processing) return;
    setProcessing(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "로그인하지 못했습니다.");
        setProcessing(false);
        return;
      }
      const sessionCheck = await fetch("/api/admin/session", { cache: "no-store", credentials: "same-origin" });
      if (!sessionCheck.ok) {
        setError("로그인 세션을 저장하지 못했습니다. 관리자 세션 환경 변수 설정을 확인해 주세요.");
        setProcessing(false);
        return;
      }
      window.location.replace("/admin");
    } catch {
      setError("네트워크 연결을 확인해 주세요.");
      setProcessing(false);
    }
  };
  return <div className="admin-login"><div className="admin-login-brand"><BrandMark/><span>OPERATIONS</span></div><div className="admin-login-card"><div className="admin-lock"><LockKeyhole/></div><span className="eyebrow red">SECURE ADMIN</span><h1>운영자 로그인</h1><p>환경 변수에 등록된 운영자 계정으로 로그인하세요.</p><Field label="이메일" placeholder="admin@taibosi.demo" type="email" value={email} onValueChange={setEmail}/><Field label="비밀번호" placeholder="비밀번호 입력" type="password" value={password} onValueChange={setPassword}/>{error && <p className="admin-login-error" role="alert">{error}</p>}<button className="button primary full large" onClick={submit} disabled={processing}>{processing ? "확인 중…" : "로그인"}</button><div className="admin-security-note"><ShieldCheck/><span>성공한 로그인은 HttpOnly 세션 쿠키로 보호됩니다.</span></div><a href="/">고객 쇼핑몰로 돌아가기</a></div></div>;
}

function AdminSidebar({ path }: { path: string }) {
  return <aside className="admin-sidebar"><div className="admin-logo"><BrandMark/><span>OPERATIONS</span></div><nav>{adminNav.map((group) => <div key={group.group}><span>{group.group}</span>{group.items.map(([href, label, Icon]) => <a href={href} className={(href === "/admin" ? path === href : path.startsWith(href)) ? "active" : ""} key={href}><Icon/>{label}</a>)}</div>)}</nav><div className="admin-user"><span>AK</span><div><strong>김아라</strong><small>Super Admin</small></div><ChevronRight/></div></aside>;
}

function AdminTopbar({ showToast }: { showToast: (message: string) => void }) {
  const [loggingOut, setLoggingOut] = useState(false);
  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE", credentials: "same-origin" });
      if (!response.ok) throw new Error("Logout failed");
      window.location.replace("/admin/login");
    } catch {
      setLoggingOut(false);
      showToast("로그아웃을 처리하지 못했습니다. 다시 시도해 주세요.");
    }
  };
  return <header className="admin-topbar"><div><Search/><input placeholder="주문번호, 상품, 고객 검색" aria-label="관리자 통합 검색"/><kbd>⌘ K</kbd></div><span className="admin-sample">PostgreSQL 연결</span><button aria-label="알림"><Bell/><b>3</b></button><button aria-label="설정"><Settings/></button><button className="admin-logout" onClick={logout} disabled={loggingOut}><LogOut/>{loggingOut ? "로그아웃 중…" : "로그아웃"}</button></header>;
}

function AdminDashboard() {
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [orderData, setOrderData] = useState<{ orders: StoredOrder[]; total: number } | null>(null);
  useEffect(() => {
    fetch("/api/actions")
      .then((response) => response.json() as Promise<{ events?: unknown[] }>)
      .then((data) => setEventCount(Array.isArray(data.events) ? data.events.length : 0))
      .catch(() => setEventCount(0));
    fetch("/api/orders?limit=100")
      .then((response) => response.json() as Promise<{ orders?: StoredOrder[]; total?: number }>)
      .then((data) => setOrderData({ orders: Array.isArray(data.orders) ? data.orders : [], total: data.total ?? 0 }))
      .catch(() => setOrderData({ orders: [], total: 0 }));
  }, []);
  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  const todayOrders = orderData?.orders.filter((order) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date(order.createdAt)) === todayKey) ?? [];
  const receivedAmount = orderData?.orders.reduce((sum, order) => sum + order.totalAmount, 0) ?? 0;
  const statusCount = (status: string) => orderData?.orders.filter((order) => order.status === status).length ?? 0;
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(date);
    return {
      key,
      label: new Intl.DateTimeFormat("ko-KR", { weekday: "short", timeZone: "Asia/Seoul" }).format(date),
      count: orderData?.orders.filter((order) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date(order.createdAt)) === key).length ?? 0,
    };
  });
  const maxDaily = Math.max(1, ...days.map((day) => day.count));
  return <><AdminPageHeader eyebrow="OVERVIEW" title="운영 대시보드" copy="PostgreSQL 주문 데이터 기준" actions={<><button className="admin-button secondary"><CalendarDays/>오늘</button><a className="admin-button primary" href="/admin/orders"><ShoppingBag/>주문 확인</a></>}/><div className="admin-kpi-grid"><KPICard label="오늘 주문" value={orderData ? String(todayOrders.length) : "-"} change={`전체 ${orderData?.total ?? 0}건`} icon={ShoppingBag}/><KPICard label="접수 금액" value={orderData ? `${(receivedAmount / 1_000_000).toFixed(1)}M` : "-"} change="최근 100건 합계" icon={BarChart3}/><KPICard label="결제 확인 대기" value={String(orderData?.orders.filter((order) => order.paymentStatus === "PENDING").length ?? 0)} change="PG 연동 전 수동 확인" icon={ClipboardCheck} warning/><KPICard label="저장 이벤트" value={eventCount === null ? "-" : String(eventCount)} change="주문·문의·운영 이벤트" icon={MessageCircle}/></div><div className="admin-dashboard-grid"><section className="admin-card order-status-card"><div className="admin-card-head"><div><h2>주문 현황</h2><p>최근 7일 DB 접수 건</p></div><a href="/admin/orders">전체 주문 <ChevronRight/></a></div><div className="mini-chart"><div className="chart-bars">{days.map((day)=><span key={day.key}><i style={{height:`${day.count ? Math.max(12, (day.count / maxDaily) * 100) : 4}%`}}/><b>{day.label}</b></span>)}</div><div className="chart-summary"><strong>{days.reduce((sum, day) => sum + day.count, 0)}</strong><span>최근 7일 주문</span><small>실제 DB 기준</small></div></div><div className="status-summary-row"><span><i className="blue"/>접수 <b>{statusCount("RECEIVED")}</b></span><span><i className="amber"/>준비 <b>{statusCount("PREPARING")}</b></span><span><i className="green"/>배송 <b>{statusCount("SHIPPED")}</b></span><span><i className="gray"/>완료 <b>{statusCount("COMPLETED")}</b></span></div></section><section className="admin-card attention-card"><div className="admin-card-head"><div><h2>확인 필요</h2><p>DB 주문 기준 우선 처리 항목</p></div></div><AttentionRow icon={ClipboardCheck} color="warning" title="결제 확인 대기" count={String(orderData?.orders.filter((order) => order.paymentStatus === "PENDING").length ?? 0)} copy="PG 미연동 주문" href="/admin/orders"/><AttentionRow icon={Package} color="info" title="신규 접수" count={String(statusCount("RECEIVED"))} copy="상품 준비 전 주문" href="/admin/orders"/><AttentionRow icon={Truck} color="success" title="배송 중" count={String(statusCount("SHIPPED"))} copy="완료 처리 전 주문" href="/admin/orders"/></section></div><div className="admin-dashboard-grid lower"><section className="admin-card recent-orders"><div className="admin-card-head"><div><h2>최근 주문</h2><p>PostgreSQL 실시간 접수 순</p></div><a href="/admin/orders">전체 보기 <ChevronRight/></a></div><AdminTable compact/></section><section className="admin-card timeline-card"><div className="admin-card-head"><div><h2>운영 안내</h2><p>주문 데이터 처리 기준</p></div></div><div className="admin-db-note"><Database/><div><strong>실제 주문 DB 연결됨</strong><small>결제 완료 처리는 PG 연동 후 자동화할 수 있습니다.</small></div></div></section></div></>;
}

function AdminPageHeader({ eyebrow, title, copy, actions }: { eyebrow: string; title: string; copy: string; actions?: React.ReactNode }) { return <div className="admin-page-header"><div><span>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div><div>{actions}</div></div>; }
function KPICard({ label, value, change, icon: Icon, warning=false }: { label:string; value:string; change:string; icon:LucideIcon; warning?:boolean }) { return <article className={`kpi-card ${warning?"warning":""}`}><div><span>{label}</span><strong>{value}</strong><small>{change}</small></div><span className="kpi-icon"><Icon/></span></article>; }
function AttentionRow({icon:Icon,color,title,count,copy,href}:{icon:LucideIcon;color:string;title:string;count:string;copy:string;href:string}) { return <a className="attention-row" href={href}><span className={color}><Icon/></span><div><strong>{title}</strong><small>{copy}</small></div><b>{count}</b><ChevronRight/></a>; }

const moduleMeta: Record<string, { title: string; eyebrow: string; copy: string; action: string }> = {
  products: { title: "상품 관리", eyebrow: "CATALOG", copy: "상품, SKU, 미디어, 사양과 공개 상태를 관리합니다.", action: "상품 등록" },
  vehicles: { title: "차량 마스터", eyebrow: "VEHICLE DATA", copy: "제조사부터 트림까지 차량 계층을 관리합니다.", action: "차량 추가" },
  fitments: { title: "적합성 매핑", eyebrow: "FITMENT", copy: "차량 조건, 상태, 판단 근거와 충돌을 검수합니다.", action: "매핑 추가" },
  pricing: { title: "가격 관리", eyebrow: "PRICING", copy: "판매가와 변경 이력을 권한에 따라 관리합니다.", action: "가격 변경" },
  inventory: { title: "재고 관리", eyebrow: "INVENTORY", copy: "가용·예약·실재고·안전 재고를 구분해 관리합니다.", action: "재고 조정" },
  "purchase-orders": { title: "해외발주", eyebrow: "PURCHASE ORDERS", copy: "발주부터 입고까지 실제·예상 상태를 추적합니다.", action: "발주 등록" },
  orders: { title: "주문 관리", eyebrow: "ORDERS", copy: "주문, 결제, 배송, 차량 적합성 스냅샷을 확인합니다.", action: "주문 내보내기" },
  shipments: { title: "배송 관리", eyebrow: "SHIPMENTS", copy: "출고와 배송 상태를 확인하고 예외를 처리합니다.", action: "배송 등록" },
  bookings: { title: "장착 예약", eyebrow: "INSTALLATION", copy: "장착점별 희망 일정과 충돌을 검토합니다.", action: "예약 등록" },
  customers: { title: "고객 관리", eyebrow: "CUSTOMERS", copy: "고객, 차량, 주문과 문의 이력을 권한에 따라 조회합니다.", action: "고객 등록" },
  support: { title: "문의·AS", eyebrow: "SUPPORT", copy: "고객 답변과 내부 메모를 분리해 처리합니다.", action: "문의 등록" },
  content: { title: "콘텐츠 관리", eyebrow: "CONTENT", copy: "홈, 브랜드, FAQ 콘텐츠와 공개 상태를 관리합니다.", action: "콘텐츠 추가" },
  roles: { title: "권한 관리", eyebrow: "RBAC", copy: "역할별 조회·수정·Export·개인정보 권한을 설정합니다.", action: "역할 추가" },
  "audit-logs": { title: "감사 로그", eyebrow: "AUDIT", copy: "민감 작업의 주체, 변경 내용과 사유를 추적합니다.", action: "로그 내보내기" },
  analytics: { title: "분석", eyebrow: "ANALYTICS", copy: "상품 탐색과 구매 여정의 주요 지표를 확인합니다.", action: "리포트 설정" },
};

function ProductCreateModule({ showToast }: { showToast: (message: string) => void }) {
  const [form, setForm] = useState({
    sku: "",
    slug: "",
    name: "",
    category: "VALVED CAT-BACK",
    material: "SUS304",
    price: "",
    status: "DRAFT",
    stockType: "DOMESTIC",
    fitmentStatus: "NO_DATA",
    summary: "",
    description: "",
    imageAltText: "",
  });
  const [specifications, setSpecifications] = useState([{ label: "재질", value: "SUS304" }, { label: "시스템 구성", value: "" }]);
  const [selectedImages, setSelectedImages] = useState<Array<{ file: File; url: string }>>([]);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const slugEdited = useRef(false);
  const update = (key: keyof typeof form, value: string) => {
    if (key === "slug") slugEdited.current = true;
    setForm((current) => ({ ...current, [key]: value }));
  };
  const updateSku = (value: string) => {
    const sku = value.toUpperCase().replace(/[^A-Z0-9._-]/g, "");
    setForm((current) => ({ ...current, sku, slug: slugEdited.current ? current.slug : sku.toLowerCase().replace(/[._]+/g, "-") }));
  };
  const chooseImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (incoming.length === 0) return;
    if (selectedImages.length + incoming.length > 4) { setError("상품 이미지는 최대 4장까지 등록할 수 있습니다."); return; }
    setError("");
    setImageProcessing(true);
    try {
      const compressed = await Promise.all(incoming.map(compressProductImage));
      const next = compressed.map((file) => ({ file, url: URL.createObjectURL(file) }));
      if ([...selectedImages, ...next].reduce((sum, item) => sum + item.file.size, 0) > 4_000_000) {
        next.forEach((item) => URL.revokeObjectURL(item.url));
        throw new Error("전체 이미지 용량은 4MB 이하여야 합니다.");
      }
      setSelectedImages((current) => [...current, ...next]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "이미지를 처리하지 못했습니다.");
    } finally {
      setImageProcessing(false);
    }
  };
  const removeImage = (index: number) => setSelectedImages((current) => current.filter((item, itemIndex) => {
    if (itemIndex === index) URL.revokeObjectURL(item.url);
    return itemIndex !== index;
  }));
  const save = async () => {
    if (processing) return;
    if (imageProcessing) {
      setError("이미지를 처리하는 중입니다. 미리보기가 표시된 뒤 다시 저장해 주세요.");
      return;
    }
    setError("");
    const completeSpecs = specifications.filter((item) => item.label.trim() && item.value.trim());
    const missing: string[] = [];
    if (form.sku.length < 3) missing.push("SKU(3자 이상)");
    if (!/^[a-z0-9][a-z0-9-]+$/.test(form.slug)) missing.push("URL 슬러그(영문 소문자·숫자·하이픈)");
    if (form.name.trim().length < 3) missing.push("상품명(3자 이상)");
    if (!form.category.trim()) missing.push("카테고리");
    if (!form.material.trim()) missing.push("재질");
    const price = Number(form.price);
    if (!form.price || !Number.isSafeInteger(price) || price < 0 || price > 2_000_000_000) missing.push("판매가");
    if (!form.summary.trim()) missing.push("한 줄 요약");
    if (!form.description.trim()) missing.push("상세 설명");
    if (completeSpecs.length === 0) missing.push("제품 사양");
    if (selectedImages.length === 0) missing.push("상품 이미지");
    if (missing.length > 0) {
      setError(`다음 항목을 확인해 주세요: ${missing.join(", ")}`);
      return;
    }
    setProcessing(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append("specifications", JSON.stringify(completeSpecs));
      selectedImages.forEach(({ file }) => body.append("images", file));
      const response = await fetch("/api/products", { method: "POST", body });
      const data = (await response.json()) as { product?: StoredProduct; error?: string };
      if (response.status === 401) { window.location.href = "/admin/login"; return; }
      if (!response.ok || !data.product) {
        setError(data.error ?? "상품을 저장하지 못했습니다.");
        setProcessing(false);
        return;
      }
      showToast(`${data.product.name} 상품을 등록했습니다.`);
      window.location.href = `/admin/products?created=${encodeURIComponent(data.product.id)}`;
    } catch {
      setError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
      setProcessing(false);
    }
  };
  return <><AdminPageHeader eyebrow="NEW PRODUCT" title="상품 등록" copy="기본 정보부터 이미지, 상세 설명과 제품 사양까지 한 번에 등록합니다." actions={<><a className="admin-button secondary" href="/admin/products"><X/>취소</a><button className="admin-button primary" disabled={processing} onClick={save}><Check/>{processing ? "저장 중…" : form.status === "PUBLISHED" ? "등록하고 공개" : "임시저장"}</button></>}/>{error && <div className="product-editor-error" role="alert"><AlertTriangle/>{error}</div>}<div className="product-editor-layout"><div className="product-editor-main"><section className="admin-card product-editor-card"><div className="product-editor-section-title"><span>01</span><div><h2>기본 정보</h2><p>고객과 운영자가 상품을 식별하는 핵심 정보입니다.</p></div></div><div className="product-form-grid"><label><span>SKU <b>필수</b></span><input value={form.sku} onChange={(event) => updateSku(event.target.value)} placeholder="TB-BMW-G8X-VCE-001"/></label><label><span>URL 슬러그 <b>필수</b></span><input value={form.slug} onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="bmw-g8x-valved-catback"/></label><label className="wide"><span>상품명 <b>필수</b></span><input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="BMW G80/G82 Valved Cat-back Exhaust"/></label><label><span>카테고리</span><select value={form.category} onChange={(event) => update("category", event.target.value)}><option>VALVED CAT-BACK</option><option>AXLE-BACK</option><option>VALVED EXHAUST</option><option>EXHAUST TIP</option><option>ACCESSORY</option></select></label><label><span>재질</span><input value={form.material} onChange={(event) => update("material", event.target.value)} placeholder="SUS304 · Carbon Quad Tip"/></label><label><span>판매가 <b>필수</b></span><div className="price-input"><input type="number" min="0" step="1000" value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="3200000"/><small>원</small></div></label><label><span>재고 유형</span><select value={form.stockType} onChange={(event) => update("stockType", event.target.value)}><option value="DOMESTIC">국내 재고</option><option value="OVERSEAS_ORDER">해외발주</option><option value="PREORDER">예약판매</option><option value="OUT_OF_STOCK">품절</option></select></label><label><span>적합성 상태</span><select value={form.fitmentStatus} onChange={(event) => update("fitmentStatus", event.target.value)}><option value="NO_DATA">데이터 없음</option><option value="VERIFIED">장착 확인</option><option value="CONDITIONAL">조건부 장착</option><option value="CONSULTATION_REQUIRED">상담 필요</option><option value="INCOMPATIBLE">장착 불가</option></select></label></div></section><section className="admin-card product-editor-card"><div className="product-editor-section-title"><span>02</span><div><h2>상품 설명</h2><p>목록 요약과 상세 페이지에 표시할 내용을 작성합니다.</p></div></div><label className="product-textarea"><span>한 줄 요약 <b>필수</b></span><textarea value={form.summary} onChange={(event) => update("summary", event.target.value)} maxLength={500} placeholder="차량 하부 구조와 순정 장착 포인트를 고려한 밸브 배기 시스템"/><small>{form.summary.length}/500</small></label><label className="product-textarea detail"><span>상세 설명 <b>필수</b></span><textarea value={form.description} onChange={(event) => update("description", event.target.value)} maxLength={10000} placeholder="제품 특징, 구성품, 장착 조건, 고객이 확인해야 할 내용을 구체적으로 입력하세요."/><small>{form.description.length}/10,000</small></label></section><section className="admin-card product-editor-card"><div className="product-editor-section-title"><span>03</span><div><h2>제품 사양</h2><p>상세 페이지의 기술 사양 표에 표시됩니다.</p></div></div><div className="spec-editor">{specifications.map((item, index)=><div className="spec-editor-row" key={index}><input value={item.label} onChange={(event) => setSpecifications((current) => current.map((spec, specIndex) => specIndex === index ? { ...spec, label: event.target.value } : spec))} placeholder="항목 (예: 파이프 직경)"/><input value={item.value} onChange={(event) => setSpecifications((current) => current.map((spec, specIndex) => specIndex === index ? { ...spec, value: event.target.value } : spec))} placeholder="값 (예: 76mm)"/><button aria-label={`사양 ${index + 1} 삭제`} onClick={() => setSpecifications((current) => current.filter((_, specIndex) => specIndex !== index))}><X/></button></div>)}<button className="add-spec" onClick={() => setSpecifications((current) => [...current, { label: "", value: "" }])}><Plus/>사양 항목 추가</button></div></section></div><aside className="product-editor-side"><section className="admin-card product-editor-card image-editor"><div className="product-editor-section-title"><span>04</span><div><h2>상품 이미지</h2><p>첫 번째 이미지가 대표 이미지입니다.</p></div></div><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={chooseImages}/><button className="image-drop-button" onClick={() => fileInput.current?.click()}><ImagePlus/><strong>이미지 선택</strong><span>JPG, PNG, WebP · 최대 4장<br/>자동 리사이즈 후 저장</span></button>{selectedImages.length > 0 && <div className="image-preview-grid">{selectedImages.map((image, index)=><article key={image.url}><img src={image.url} alt={`상품 이미지 미리보기 ${index + 1}`}/>{index === 0 && <b>대표</b>}<button aria-label={`이미지 ${index + 1} 삭제`} onClick={() => removeImage(index)}><X/></button><small>{Math.ceil(image.file.size / 1024)}KB</small></article>)}</div>}<label className="image-alt-field"><span>이미지 대체 텍스트</span><input value={form.imageAltText} onChange={(event) => update("imageAltText", event.target.value)} placeholder={form.name || "상품 이미지 설명"}/></label></section><section className="admin-card product-editor-card publish-editor"><div className="product-editor-section-title"><span>05</span><div><h2>공개 설정</h2><p>저장 직후의 노출 상태입니다.</p></div></div><label className={form.status === "DRAFT" ? "selected" : ""}><input type="radio" checked={form.status === "DRAFT"} onChange={() => update("status", "DRAFT")}/><FileText/><div><strong>임시저장</strong><span>어드민에서만 확인</span></div>{form.status === "DRAFT" && <CheckCircle2/>}</label><label className={form.status === "PUBLISHED" ? "selected" : ""}><input type="radio" checked={form.status === "PUBLISHED"} onChange={() => update("status", "PUBLISHED")}/><CheckCircle2/><div><strong>즉시 공개</strong><span>저장 후 고객에게 이미지 공개</span></div>{form.status === "PUBLISHED" && <CheckCircle2/>}</label><div className="publish-note"><ShieldCheck/><span>상품 등록과 공개 상태는 감사 로그에 기록됩니다.</span></div></section></aside></div></>;
}

function AdminModule({ path, showToast }: { path: string; showToast: (message: string) => void }) {
  const key = path.split("/")[2] || "products";
  const meta = moduleMeta[key] || moduleMeta.products;
  const isDetail = path.split("/").length > 3;
  const [drawerOpen, setDrawerOpen] = useState(isDetail);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<StoredOrder | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<StoredInquiry | null>(null);
  const submitChange = async () => { await saveAction(key === "inventory" ? "inventory" : "fitment", { module: key, reason: "샘플 운영 검증", actor: "김아라" }); setDialogOpen(false); showToast("변경 내용과 사유를 저장하고 감사 로그를 생성했습니다."); };
  if (key === "roles") return <PermissionModule meta={meta} showToast={showToast}/>;
  if (key === "fitments") return <FitmentModule meta={meta} showToast={showToast}/>;
  if (key === "products" && path.endsWith("/new")) return <ProductCreateModule showToast={showToast}/>;
  const refreshable = key === "orders" || key === "support";
  return <><AdminPageHeader eyebrow={meta.eyebrow} title={meta.title} copy={meta.copy} actions={<><button className="admin-button secondary"><SlidersHorizontal/>보기 설정</button><button className="admin-button primary" onClick={() => key === "inventory" ? setDialogOpen(true) : refreshable ? window.location.reload() : key === "products" ? window.location.href = "/admin/products/new" : setDrawerOpen(true)}>{refreshable ? <RotateCcw/> : <Plus/>}{key === "orders" ? "주문 새로고침" : key === "support" ? "문의 새로고침" : meta.action}</button></>}/><div className="admin-filter-bar"><label><Search/><input placeholder={`${meta.title} 검색`}/></label><button>상태 <ChevronDown/></button><button>업데이트일 <ChevronDown/></button><span>필터 0개</span><button className="filter-reset"><RotateCcw/>초기화</button></div><section className="admin-table-card"><div className="table-meta"><strong>{key === "orders" ? "PostgreSQL 실시간 주문" : key === "products" ? "PostgreSQL 실시간 상품" : key === "support" ? "PostgreSQL 실시간 문의" : "전체 32개"}</strong><div><button>열 표시 <ChevronDown/></button><button>내보내기</button></div></div><AdminTable module={key} onOpen={(record) => { if (key === "orders") setSelectedOrder((record as StoredOrder | undefined) ?? null); if (key === "support") setSelectedInquiry((record as StoredInquiry | undefined) ?? null); setDrawerOpen(true); }}/></section>{drawerOpen && <DetailDrawer module={key} order={selectedOrder} inquiry={selectedInquiry} close={() => setDrawerOpen(false)} onChange={() => setDialogOpen(true)}/>} {dialogOpen && <ReasonDialog module={key} close={() => setDialogOpen(false)} submit={submitChange}/>}</>;
}

function AdminTable({ module = "orders", compact = false, onOpen }: { module?: string; compact?: boolean; onOpen?: (record?: StoredOrder | StoredInquiry) => void }) {
  const [storedOrders, setStoredOrders] = useState<StoredOrder[] | null>(module === "orders" ? null : []);
  const [storedProducts, setStoredProducts] = useState<StoredProduct[] | null>(module === "products" ? null : []);
  const [storedInquiries, setStoredInquiries] = useState<StoredInquiry[] | null>(module === "support" ? null : []);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    if (module !== "orders" && module !== "products" && module !== "support") return;
    const endpoint = module === "orders" ? `/api/orders?limit=${compact ? 4 : 100}` : module === "products" ? "/api/products" : `/api/inquiries?limit=${compact ? 4 : 100}`;
    fetch(endpoint, { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { orders?: StoredOrder[]; products?: StoredProduct[]; inquiries?: StoredInquiry[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? (module === "orders" ? "주문을 불러오지 못했습니다." : module === "products" ? "상품을 불러오지 못했습니다." : "문의를 불러오지 못했습니다."));
        if (module === "orders") setStoredOrders(Array.isArray(data.orders) ? data.orders : []);
        if (module === "products") setStoredProducts(Array.isArray(data.products) ? data.products : []);
        if (module === "support") setStoredInquiries(Array.isArray(data.inquiries) ? data.inquiries : []);
      })
      .catch((reason: unknown) => {
        setLoadError(reason instanceof Error ? reason.message : "데이터를 불러오지 못했습니다.");
        setStoredOrders([]);
        setStoredProducts([]);
        setStoredInquiries([]);
      });
  }, [compact, module]);
  const staticData = module === "inventory" ? [
    ["TB-BMW-G8X-VCE-001", "BMW G8X Valved Cat-back", "12", "3", "9", "정상"],
    ["TB-MB-W205-ABE-002", "AMG W205 Axle-back", "4", "2", "2", "부족"],
    ["TB-AU-B9-VCE-003", "Audi RS5 B9 Valved", "0", "0", "0", "예약판매"],
  ] : module === "audit-logs" ? [
    ["08.04 11:42", "김아라", "재고 조정", "TB-BMW-G8X", "+2", "운영 입고"],
    ["08.04 10:18", "박도윤", "적합성 변경", "FIT-0082", "조건부 → 확인", "근거 검수"],
    ["08.04 09:31", "김아라", "개인정보 조회", "CUS-1048", "주문 상담", "CS 처리"],
  ] : [];
  const data = module === "orders" ? (storedOrders ?? []).map((order) => [
    order.orderNumber,
    `${order.customerName} · ${order.customerEmail}`,
    order.item?.productName ?? "상품 정보 없음",
    `${formatPrice(order.totalAmount)}원`,
    `${orderStatusLabels[order.status] ?? order.status} · ${paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}`,
    new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" }).format(new Date(order.createdAt)),
  ]) : module === "products" ? (storedProducts ?? []).map((product) => [
    product.sku,
    product.name,
    product.category,
    `${formatPrice(product.price)}원`,
    product.status === "PUBLISHED" ? "공개" : "임시저장",
    new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" }).format(new Date(product.updatedAt)),
  ]) : module === "support" ? (storedInquiries ?? []).map((inquiry) => [
    inquiry.inquiryNumber,
    `${inquiry.customerName} · ${inquiry.customerEmail}`,
    inquiry.subject,
    inquiryTypeLabels[inquiry.type] ?? inquiry.type,
    inquiryStatusLabels[inquiry.status] ?? inquiry.status,
    new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" }).format(new Date(inquiry.createdAt)),
  ]) : staticData;
  const headers = module === "inventory" ? ["SKU", "상품", "실재고", "예약", "가용", "상태"] : module === "products" ? ["SKU", "상품명", "유형", "판매가", "상태", "수정일"] : module === "support" ? ["문의번호", "고객", "제목", "유형", "상태", "접수"] : module === "audit-logs" ? ["일시", "작업자", "행동", "대상", "변경", "사유"] : ["주문번호", "고객", "상품", "결제금액", "상태", "접수"];
  const loading = (module === "orders" && storedOrders === null) || (module === "products" && storedProducts === null) || (module === "support" && storedInquiries === null);
  const emptyCopy = module === "orders" ? "아직 접수된 주문이 없습니다." : module === "products" ? "아직 등록된 상품이 없습니다. 상품 등록 버튼으로 첫 상품을 추가하세요." : module === "support" ? "아직 접수된 문의가 없습니다." : "표시할 데이터가 없습니다.";
  return <div className="admin-table-wrap"><table className={compact ? "compact" : ""}><thead><tr><th><input type="checkbox" aria-label="전체 선택"/></th>{headers.map((header)=><th key={header}>{header}<ChevronDown/></th>)}<th/></tr></thead><tbody>{loading ? <tr><td className="admin-table-state" colSpan={headers.length + 2}>PostgreSQL 데이터를 불러오는 중입니다…</td></tr> : loadError ? <tr><td className="admin-table-state error" colSpan={headers.length + 2}>{loadError}</td></tr> : data.length === 0 ? <tr><td className="admin-table-state" colSpan={headers.length + 2}>{emptyCopy}</td></tr> : data.slice(0,compact?4:data.length).map((row,index)=><tr key={row[0]} onClick={() => module === "products" ? undefined : onOpen?.(module === "orders" ? storedOrders?.[index] : module === "support" ? storedInquiries?.[index] : undefined)}><td><input type="checkbox" aria-label={`${row[0]} 선택`} onClick={(event) => event.stopPropagation()}/></td>{row.map((cell,cellIndex)=><td key={cellIndex}>{cellIndex===0?<strong>{cell}</strong>:cellIndex===4?<span className={`table-status s${index % 4}`}>{cell}</span>:cell}</td>)}<td><button aria-label="행 메뉴">•••</button></td></tr>)}</tbody></table></div>;
}

function DetailDrawer({ module, order, inquiry, close, onChange }: { module:string; order?:StoredOrder | null; inquiry?:StoredInquiry | null; close:()=>void; onChange:()=>void }) {
  const isStoredOrder = module === "orders" && order;
  const isStoredInquiry = module === "support" && inquiry;
  const createdAt = isStoredOrder ? order.createdAt : isStoredInquiry ? inquiry.createdAt : null;
  return <div className="drawer-backdrop" onMouseDown={close}><aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={`${moduleMeta[module]?.title ?? "상세"} 상세`} onMouseDown={(e)=>e.stopPropagation()}><header><div><span>{moduleMeta[module]?.eyebrow}</span><h2>{isStoredOrder ? `주문 ${order.orderNumber}` : isStoredInquiry ? inquiry.inquiryNumber : module === "orders" ? "주문 상세" : module === "support" ? "문의 상세" : "BMW G8X Valved Cat-back"}</h2></div><button onClick={close} aria-label="상세 닫기"><X/></button></header><div className="drawer-tabs"><button className="active">기본 정보</button>{!isStoredInquiry && <><button>변경 이력</button><button>감사 로그</button></>}</div><div className="drawer-content"><div className="drawer-status"><span className="status-badge info">{isStoredInquiry ? <MessageCircle/> : <Package/>}{isStoredOrder ? orderStatusLabels[order.status] ?? order.status : isStoredInquiry ? inquiryStatusLabels[inquiry.status] ?? inquiry.status : "상품 준비"}</span><small>{createdAt ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" }).format(new Date(createdAt)) : "상세 항목을 선택해 주세요"}</small></div><h3>핵심 정보</h3>{isStoredOrder ? <dl><div><dt>고객</dt><dd>{order.customerName} · {order.customerEmail}</dd></div><div><dt>상품</dt><dd>{order.item?.productName ?? "상품 정보 없음"}{(order.items?.length ?? 0) > 1 ? ` 외 ${(order.items?.length ?? 1) - 1}건` : ""}</dd></div><div><dt>SKU</dt><dd>{order.item?.productSku ?? "-"}</dd></div><div><dt>수량 / 금액</dt><dd>{order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? order.item?.quantity ?? 0}개 · {formatPrice(order.totalAmount)}원</dd></div><div><dt>주문 상태</dt><dd>{orderStatusLabels[order.status] ?? order.status}</dd></div><div><dt>결제 상태</dt><dd>{paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}</dd></div><div><dt>수령 방식</dt><dd>{order.fulfillmentMethod === "INSTALLER_DELIVERY" ? "장착점 배송" : "일반 배송"}</dd></div></dl> : isStoredInquiry ? <><dl><div><dt>문의 유형</dt><dd>{inquiryTypeLabels[inquiry.type] ?? inquiry.type}</dd></div><div><dt>고객</dt><dd>{inquiry.customerName}</dd></div><div><dt>이메일</dt><dd>{inquiry.customerEmail}</dd></div><div><dt>연락처</dt><dd>{inquiry.customerPhone}</dd></div><div><dt>제목</dt><dd>{inquiry.subject}</dd></div><div><dt>연결 상품</dt><dd>{inquiry.productName ?? inquiry.productSku ?? "없음"}</dd></div><div><dt>차량 정보</dt><dd>{inquiry.vehicleSnapshot ?? "없음"}</dd></div></dl><h3>문의 내용</h3><p className="inquiry-body">{inquiry.body}</p></> : <dl><div><dt>상품</dt><dd>BMW G80/G82 Valved Cat-back Exhaust</dd></div><div><dt>SKU</dt><dd>TB-BMW-G8X-VCE-001</dd></div><div><dt>차량</dt><dd>BMW M3 G80 · 2022 · 3.0</dd></div></dl>}<div className="drawer-evidence"><ShieldCheck/><div><strong>{isStoredOrder ? "PostgreSQL에 저장된 주문입니다" : isStoredInquiry ? "PostgreSQL에 저장된 고객 문의입니다" : "변경은 감사 로그에 기록됩니다"}</strong><p>{isStoredOrder ? "주문 생성 이벤트와 최초 상태 이력이 함께 기록됐습니다." : isStoredInquiry ? "문의 접수 이벤트와 감사 로그가 함께 기록됐습니다." : "상태 변경에는 사유 입력이 필요합니다."}</p></div></div></div><footer><button className="admin-button secondary" onClick={close}>닫기</button>{!isStoredOrder && !isStoredInquiry && <button className="admin-button primary" onClick={onChange}>상태 변경</button>}</footer></aside></div>;
}

function ReasonDialog({ module, close, submit }: { module:string; close:()=>void; submit:()=>void }) {
  return <div className="dialog-backdrop" onMouseDown={close}><div className="reason-dialog" role="alertdialog" aria-modal="true" aria-labelledby="reason-title" onMouseDown={(e)=>e.stopPropagation()}><span className="dialog-icon"><AlertTriangle/></span><h2 id="reason-title">{module === "inventory" ? "재고를 조정할까요?" : "상태를 변경할까요?"}</h2><p>변경 대상과 결과를 확인하고 사유를 입력해 주세요.</p><div className="change-preview"><span>변경 전 <b>{module === "inventory" ? "가용 9" : "검수 대기"}</b></span><ArrowRight/><span>변경 후 <b>{module === "inventory" ? "가용 11" : "공개"}</b></span></div><label><span>변경 사유 <b>필수</b></span><textarea defaultValue="샘플 운영 검증을 위한 상태 변경"/></label><small><Database/> 작업자와 변경 내용이 감사 로그에 기록됩니다.</small><div><button className="admin-button secondary" onClick={close}>취소</button><button className="admin-button primary" onClick={submit}>변경 저장</button></div></div></div>;
}

function FitmentModule({ meta, showToast }: { meta:typeof moduleMeta[string]; showToast:(message:string)=>void }) {
  const [status,setStatus]=useState<Fitment>("VERIFIED");
  const save=async()=>{await saveAction("fitment",{product:products[0].sku,status,evidence:"TAIBOSI-KR-FIT-2026-08",reviewedAt:"2026-08-04"});showToast("적합성 매핑과 판단 근거를 저장했습니다.");};
  return <><AdminPageHeader eyebrow={meta.eyebrow} title={meta.title} copy={meta.copy} actions={<button className="admin-button primary" onClick={save}><Check/>매핑 저장</button>}/><div className="fitment-builder-layout"><section className="admin-card condition-builder"><div className="builder-head"><div><span>01</span><div><h2>상품·SKU 선택</h2><p>적합성을 연결할 대상을 선택합니다.</p></div></div><span className="status-badge neutral">DRAFT</span></div><label><span>상품</span><select><option>BMW G80/G82 Valved Cat-back Exhaust</option></select></label><label><span>SKU</span><select><option>TB-BMW-G8X-VCE-001</option></select></label><div className="builder-head section-break"><div><span>02</span><div><h2>차량 조건</h2><p>필요한 조건만 조합합니다.</p></div></div><button><Plus/>조건 추가</button></div>{[["제조사","BMW"],["모델","M3"],["세대 / 섀시","G80"],["연식","2021–현재"],["엔진","3.0 가솔린"]].map(([label,value])=><div className="condition-row" key={label}><span>{label}</span><select><option>같음</option></select><input value={value} readOnly/><button><X/></button></div>)}<button className="add-condition"><Plus/>추가 조건</button></section><aside><section className="admin-card"><div className="builder-head"><div><span>03</span><div><h2>적합성 상태</h2><p>고객에게 표시할 상태입니다.</p></div></div></div><div className="fit-status-options">{(["VERIFIED","CONDITIONAL","CONSULTATION_REQUIRED","INCOMPATIBLE"] as Fitment[]).map((item)=>{const m=fitmentMap[item];const Icon=m.icon;return <button key={item} className={`${m.className} ${status===item?"selected":""}`} onClick={()=>setStatus(item)}><Icon/><div><strong>{m.label}</strong><span>{m.description}</span></div>{status===item&&<CheckCircle2/>}</button>})}</div></section><section className="admin-card evidence-card"><div className="builder-head"><div><span>04</span><div><h2>판단 근거</h2><p>출처와 검수일은 필수입니다.</p></div></div></div><label><span>출처·문서 번호</span><input defaultValue="TAIBOSI-KR-FIT-2026-08"/></label><label><span>검수일</span><input type="date" defaultValue="2026-08-04"/></label><label><span>메모</span><textarea defaultValue="샘플 데이터 검수 기록"/></label><div className="conflict-clear"><CheckCircle2/><div><strong>충돌 없음</strong><span>중복 또는 상충되는 매핑이 없습니다.</span></div></div></section></aside></div></>;
}

function PermissionModule({meta,showToast}:{meta:typeof moduleMeta[string];showToast:(message:string)=>void}) {
  const [changed,setChanged]=useState(false);
  const save=async()=>{await saveAction("fitment",{kind:"permission",role:"Catalog Manager",reason:"정기 권한 검토"});setChanged(false);showToast("권한 변경 사유와 감사 로그를 저장했습니다.");};
  const permissions=["조회","생성","수정","삭제","상태 변경","가격 조회","개인정보 조회","Export","권한 관리","감사로그 조회"];
  return <><AdminPageHeader eyebrow={meta.eyebrow} title={meta.title} copy={meta.copy} actions={<button className="admin-button primary" disabled={!changed} onClick={save}><Check/>변경 저장</button>}/><div className="role-layout"><aside className="admin-card role-list"><div><h2>역할</h2><button><Plus/></button></div>{["Super Admin","Catalog Manager","Order Manager","Support Agent","Installer Viewer"].map((role,index)=><button className={index===1?"active":""} key={role}><span>{role.slice(0,2)}</span><div><strong>{role}</strong><small>{[2,4,6,8,12][index]}명</small></div><ChevronRight/></button>)}</aside><section className="admin-card permission-card"><div className="permission-title"><div><span>CM</span><div><h2>Catalog Manager</h2><p>상품·차량·적합성 데이터를 관리합니다.</p></div></div><button className="admin-button secondary">역할 수정</button></div><div className="permission-matrix"><table><thead><tr><th>리소스</th>{permissions.map((p)=><th key={p}>{p}</th>)}</tr></thead><tbody>{["상품","차량","적합성","재고","주문","고객","권한"].map((resource,row)=><tr key={resource}><th>{resource}</th>{permissions.map((p,col)=><td key={p}><button aria-label={`${resource} ${p}`} className={(row<3&&col<5)||(row===3&&col===0)?"checked":""} onClick={(e)=>{e.currentTarget.classList.toggle("checked");setChanged(true);}}>{((row<3&&col<5)||(row===3&&col===0))&&<Check/>}</button></td>)}</tr>)}</tbody></table></div><div className="permission-warning"><AlertTriangle/><div><strong>민감 권한은 별도 검토가 필요합니다</strong><p>개인정보 조회, Export, 권한 관리는 Super Admin만 부여할 수 있습니다.</p></div></div></section></div></>;
}
