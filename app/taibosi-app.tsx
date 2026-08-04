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
  LayoutDashboard,
  LockKeyhole,
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
import { useEffect, useState } from "react";

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
  kicker: string;
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
  },
];

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

export function TaibosiApp({ path }: { path: string }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [cartCount, setCartCount] = useState(1);

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
    if (path === "/products") return <ProductsPage />;
    if (path.startsWith("/products/")) {
      const slug = path.split("/").pop() ?? products[0].slug;
      return (
        <ProductDetailPage
          product={products.find((item) => item.slug === slug) ?? products[0]}
          addToCart={() => {
            setCartCount((count) => count + 1);
            setToast("장바구니에 상품을 담았습니다.");
          }}
          showToast={setToast}
        />
      );
    }
    if (path === "/cart") return <CartPage />;
    if (path === "/checkout") return <CheckoutPage showToast={setToast} />;
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
      <SampleBanner />
      <StoreHeader cartCount={cartCount} openMenu={() => setMobileMenu(true)} />
      {mobileMenu && <MobileMenu close={() => setMobileMenu(false)} />}
      <main id="main-content">{renderPage()}</main>
      <StoreFooter />
      {!path.startsWith("/checkout") && !path.startsWith("/products/") && <MobileBottomNav />}
      {toast && <div className="toast" role="status"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  );
}

function SampleBanner() {
  return (
    <div className="sample-banner">
      <span>DEMO ENVIRONMENT</span>
      화면의 상품·장착점·일정은 기능 확인을 위한 샘플 데이터입니다.
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
        <div className="hero-overlay" />
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
          <label><span>제조사</span><select value={maker} onChange={(event) => setMaker(event.target.value)}><option>BMW</option><option>Mercedes-AMG</option><option>Audi</option><option>Porsche</option></select></label>
          <label><span>모델</span><select value={model} onChange={(event) => setModel(event.target.value)}><option>M3</option><option>M4</option><option>5 Series</option></select></label>
          <label><span>세대 / 섀시</span><select value={generation} onChange={(event) => setGeneration(event.target.value)}><option>G80</option><option>F80</option></select></label>
          <a className="button primary finder-button" href="/products">호환 제품 보기 <ArrowRight /></a>
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
          <div className="product-grid home-product-grid">{products.slice(0, 3).map((product) => <ProductCard key={product.slug} product={product} />)}</div>
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
  const options = [
    ["BMW", "Mercedes-AMG", "Audi", "Porsche"],
    ["M3", "M4", "M5", "5 Series"],
    ["G80", "F80", "E92"],
    ["2024", "2023", "2022", "2021"],
    ["3.0 가솔린", "3.0 가솔린 MHEV"],
    ["후륜 · 세단", "사륜 · 세단"],
    ["순정 리어 범퍼", "카본 디퓨저 장착"],
  ];
  const defaults = ["BMW", "M3", "G80", "2022", "3.0 가솔린", "후륜 · 세단", "순정 리어 범퍼"];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string[]>(defaults);
  const complete = current === 7;

  const selectOption = (option: string) => {
    setSelected((values) => values.map((value, index) => (index === current ? option : index > current ? "" : value)));
  };

  return (
    <div className="vehicle-page page-light">
      <div className="page-hero compact dark-hero"><div className="grid-container"><span className="eyebrow red">VEHICLE FINDER</span><h1>차량 정보를 선택해 주세요</h1><p>정확한 적합성 확인을 위해 세대와 엔진 정보가 필요할 수 있습니다.</p></div></div>
      <div className="grid-container vehicle-workspace">
        <div className="stepper" aria-label="차량 선택 진행 단계">{steps.map((step, index) => <button key={step} onClick={() => index <= current && setCurrent(index)} className={index === current ? "active" : index < current ? "done" : ""}><span>{index < current ? <Check /> : index + 1}</span><b>{step}</b></button>)}</div>
        <div className="vehicle-columns">
          <section className="vehicle-options-card">
            <span className="step-label">STEP {String(current + 1).padStart(2, "0")} / 08</span>
            <h2>{complete ? "선택한 차량을 확인해 주세요" : `${steps[current]}을 선택해 주세요`}</h2>
            {!complete ? <>
              {current < 2 && <label className="option-search"><Search /><input aria-label={`${steps[current]} 검색`} placeholder={`${steps[current]} 검색`} /></label>}
              <div className="option-list">{options[current].map((option) => <button key={option} className={selected[current] === option ? "selected" : ""} onClick={() => selectOption(option)}><span>{option.slice(0, 2)}</span><strong>{option}</strong>{selected[current] === option && <CheckCircle2 />}</button>)}</div>
            </> : <div className="complete-check"><CheckCircle2 /><strong>차량 선택이 완료되었습니다</strong><p>선택한 차량의 호환 제품을 확인할까요?</p></div>}
            <div className="vehicle-actions"><button className="button secondary" disabled={current === 0} onClick={() => setCurrent((value) => Math.max(0, value - 1))}><ArrowLeft /> 이전</button>{complete ? <a className="button primary" href="/products?vehicle=bmw-m3-g80">호환 제품 보기 <ArrowRight /></a> : <button className="button primary" disabled={!selected[current]} onClick={() => setCurrent((value) => Math.min(7, value + 1))}>다음 <ArrowRight /></button>}</div>
          </section>
          <aside className="vehicle-summary-panel">
            <div className="vehicle-silhouette"><CarFront /><span>G80</span></div>
            <span className="eyebrow">SELECTED VEHICLE</span><h2>BMW M3</h2><p>G80 · 2022 · 3.0 가솔린</p>
            <dl>{steps.slice(0, 7).map((label, index) => <div key={label}><dt>{label}</dt><dd>{selected[index] || "선택 필요"}</dd></div>)}</dl>
            <div className="summary-note"><Info /><span>상위 항목을 변경하면 이후 선택값이 초기화됩니다.</span></div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ProductsPage() {
  const [stockFilter, setStockFilter] = useState<Stock | "ALL">("ALL");
  const [fitFilter, setFitFilter] = useState<Fitment | "ALL">("ALL");
  const [mobileFilter, setMobileFilter] = useState(false);
  const visible = products.filter((product) => (stockFilter === "ALL" || product.stock === stockFilter) && (fitFilter === "ALL" || product.fitment === fitFilter));
  return (
    <div className="products-page page-light">
      <div className="grid-container page-top-space">
        <nav className="breadcrumb"><a href="/">홈</a><ChevronRight /><span>제품</span></nav>
        <div className="products-title-row"><div><span className="eyebrow red">EXHAUST SYSTEMS</span><h1>배기 시스템</h1><p>선택한 차량과 재고 유형을 기준으로 비교해 보세요.</p></div><span><strong>{visible.length}</strong> PRODUCTS</span></div>
        <div className="selected-vehicle-bar"><div className="round-icon"><CarFront /></div><div><span>선택 차량</span><strong>BMW M3 G80 · 2022 · 3.0 가솔린</strong><small><CheckCircle2 /> 이 차량에 맞는 제품을 우선 표시 중</small></div><a className="button secondary" href="/vehicles">차량 변경</a></div>
        <div className="product-toolbar"><label className="search-field"><Search /><input placeholder="제품명, SKU 검색" aria-label="제품 검색" /></label><button className="button secondary mobile-filter-button" onClick={() => setMobileFilter(true)}><SlidersHorizontal />필터</button><label className="sort-select"><span>정렬</span><select><option>추천순</option><option>가격 낮은순</option><option>가격 높은순</option></select></label></div>
        <div className="product-catalog-layout">
          <aside className={`filter-sidebar ${mobileFilter ? "mobile-open" : ""}`}>
            <div className="filter-mobile-head"><strong>필터</strong><button className="icon-link" onClick={() => setMobileFilter(false)}><X /></button></div>
            <FilterGroup title="적합성"><FilterRadio label="전체" checked={fitFilter === "ALL"} onClick={() => setFitFilter("ALL")} /><FilterRadio label="장착 확인" checked={fitFilter === "VERIFIED"} onClick={() => setFitFilter("VERIFIED")} /><FilterRadio label="상담 필요" checked={fitFilter === "CONSULTATION_REQUIRED"} onClick={() => setFitFilter("CONSULTATION_REQUIRED")} /></FilterGroup>
            <FilterGroup title="재고·판매 유형"><FilterRadio label="전체" checked={stockFilter === "ALL"} onClick={() => setStockFilter("ALL")} /><FilterRadio label="국내 재고" checked={stockFilter === "DOMESTIC"} onClick={() => setStockFilter("DOMESTIC")} /><FilterRadio label="해외발주" checked={stockFilter === "OVERSEAS_ORDER"} onClick={() => setStockFilter("OVERSEAS_ORDER")} /><FilterRadio label="예약판매" checked={stockFilter === "PREORDER"} onClick={() => setStockFilter("PREORDER")} /><FilterRadio label="품절" checked={stockFilter === "OUT_OF_STOCK"} onClick={() => setStockFilter("OUT_OF_STOCK")} /></FilterGroup>
            <FilterGroup title="시스템 유형"><FilterRadio label="Cat-back System" /><FilterRadio label="Axle-back System" /><FilterRadio label="Valved Exhaust" /><FilterRadio label="Exhaust Tip" /></FilterGroup>
            <button className="button primary full filter-apply" onClick={() => setMobileFilter(false)}>상품 {visible.length}개 보기</button>
          </aside>
          <section><div className="active-filters"><span>BMW M3 G80 <button aria-label="차량 필터 삭제"><X /></button></span>{stockFilter !== "ALL" && <span>{stockMap[stockFilter].label}<button onClick={() => setStockFilter("ALL")}><X /></button></span>}<button onClick={() => { setStockFilter("ALL"); setFitFilter("ALL"); }}><RotateCcw /> 초기화</button></div>{visible.length ? <div className="product-grid catalog-grid">{visible.map((product) => <ProductCard key={product.slug} product={product} />)}</div> : <EmptyState icon={Search} title="조건에 맞는 제품이 없습니다" copy="필터를 초기화하거나 차량 적합성 상담을 신청해 주세요." action="필터 초기화" onAction={() => { setStockFilter("ALL"); setFitFilter("ALL"); }} />}</section>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="filter-group"><button className="filter-title"><strong>{title}</strong><ChevronDown /></button><div>{children}</div></div>;
}

function FilterRadio({ label, checked = false, onClick }: { label: string; checked?: boolean; onClick?: () => void }) {
  return <button className={`filter-radio ${checked ? "checked" : ""}`} onClick={onClick}><span>{checked && <Check />}</span>{label}</button>;
}

function ProductDetailPage({ product, addToCart, showToast }: { product: Product; addToCart: () => void; showToast: (message: string) => void }) {
  const [tip, setTip] = useState("Carbon Quad");
  const [quantity, setQuantity] = useState(1);
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
    } else addToCart();
  };
  return (
    <div className="product-detail page-light">
      <div className="grid-container detail-top-space"><nav className="breadcrumb"><a href="/">홈</a><ChevronRight /><a href="/products">제품</a><ChevronRight /><span>{product.name}</span></nav>
        <div className="product-detail-grid">
          <section className="product-gallery"><div className="gallery-main"><img src={product.image} alt={`${product.name} 장착 이미지`} /><span className="image-index">01 / 04</span><button className="gallery-arrow left" aria-label="이전 이미지"><ArrowLeft /></button><button className="gallery-arrow right" aria-label="다음 이미지"><ArrowRight /></button></div><div className="gallery-thumbs">{[product.image, garageImage, redBmwImage].map((image, index) => <button className={index === 0 ? "active" : ""} key={image}><img src={image} alt={`${product.name} 썸네일 ${index + 1}`} /></button>)}</div></section>
          <aside className="purchase-panel"><span className="eyebrow red">{product.category}</span><h1>{product.name}</h1><p className="product-sku">SKU {product.sku}</p><div className="panel-badges"><FitmentBadge status={product.fitment} /><StockBadge stock={product.stock} /></div><div className="detail-price"><strong>{formatPrice(product.price)}</strong><span>원</span><small>장착비 별도 · 상담 후 안내</small></div>
            <div className={`fitment-panel ${fitment.className}`}><div><FitIcon /><strong>{fitment.label}</strong></div><p>{fitment.description}</p><span>BMW M3 G80 · 2022 · 3.0 가솔린</span><button>판단 근거 보기 <ChevronRight /></button></div>
            <div className={`stock-panel ${stock.className}`}><StockIcon /><div><strong>{stock.label}</strong><p>{stock.copy}</p></div></div>
            <div className="option-block"><div><strong>팁 옵션</strong><span>필수</span></div><div className="option-chips">{["Carbon Quad", "Black Chrome"].map((item) => <button key={item} className={tip === item ? "selected" : ""} onClick={() => setTip(item)}>{item}{tip === item && <Check />}</button>)}</div></div>
            <div className="quantity-row"><strong>수량</strong><div><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)}><Plus /></button></div></div>
            <button className="button primary full large" onClick={handleCta}>{cta} <ArrowRight /></button><button className="button secondary full"><MessageCircle /> 장착 조건 상담</button><p className="purchase-note"><ShieldCheck /> 결제 직전 가격·재고·적합성을 다시 확인합니다.</p>
          </aside>
        </div>
      </div>
      <nav className="detail-tabs"><div className="grid-container"><a href="#overview">제품 소개</a><a href="#sound">배기음</a><a href="#specs">기술 사양</a><a href="#fitment">장착 조건</a><a href="#policy">보증·반품</a></div></nav>
      <section id="overview" className="section detail-story"><div className="grid-container story-grid"><div><span className="eyebrow red">ENGINEERED DETAIL</span><h2>정확한 라인,<br />절제된 존재감</h2><p>{product.kicker}. 차량 하부 구조와 순정 장착 포인트를 고려한 제품 구성을 확인하세요.</p></div><div className="story-image"><img src={garageImage} alt="배기 시스템 리어 디테일" /><span>SUS304</span></div></div></section>
      <section id="sound" className="section detail-dark-block"><div className="grid-container"><SectionHeading eyebrow="SOUND SAMPLE" title="BMW G80 · Comfort / Sport" copy="녹음 환경과 재생 기기에 따라 실제 소리는 다르게 들릴 수 있습니다." /><SoundPlayer /></div></section>
      <section id="specs" className="section"><div className="grid-container spec-layout"><div><span className="eyebrow red">SPECIFICATIONS</span><h2>기술 사양</h2></div><dl className="spec-table"><div><dt>재질</dt><dd>{product.material.split(" · ")[0]}</dd></div><div><dt>시스템 구성</dt><dd>{product.category}</dd></div><div><dt>밸브</dt><dd>{product.category.includes("VALVED") ? "전자식 밸브 포함" : "해당 없음"}</dd></div><div><dt>팁 구성</dt><dd>{tip}</dd></div><div><dt>장착 시간</dt><dd>상담 후 안내</dd></div><div><dt>인증·구조변경</dt><dd>차량 사양과 지역 기준에 따라 별도 확인 필요</dd></div></dl></div></section>
      <section id="fitment" className="section detail-fitment-info"><div className="grid-container"><div className="notice-card"><CircleHelp /><div><h3>장착과 관련 규정은 차량별 확인이 필요합니다</h3><p>화면의 적합성은 등록된 제품·차량 데이터를 기준으로 하며 법적 적합성이나 성능 향상을 보장하지 않습니다.</p></div><a href="/support/inquiry">적합성 문의 <ArrowRight /></a></div></div></section>
      <div className="product-mobile-action"><div><span>{formatPrice(product.price)}원</span><small>{fitment.label}</small></div><button className="button primary" onClick={handleCta}>{cta}</button></div>
    </div>
  );
}

function CartPage() {
  const [qty, setQty] = useState(1);
  const product = products[0];
  return (
    <div className="cart-page page-light"><div className="grid-container narrow-page"><nav className="breadcrumb"><a href="/">홈</a><ChevronRight /><span>장바구니</span></nav><div className="page-title-simple"><h1>장바구니</h1><span>1개 상품</span></div><div className="checkout-layout"><section><div className="revalidation-note"><RotateCcw /><div><strong>가격·재고·적합성을 다시 확인했습니다</strong><span>방금 전 확인 · 결제 직전 한 번 더 확인합니다.</span></div></div><div className="cart-group"><div className="cart-group-head"><div><PackageCheck /><strong>국내 재고</strong></div><span>주문 확인 후 출고일 안내</span></div><article className="cart-item"><input type="checkbox" defaultChecked aria-label={`${product.name} 선택`} /><img src={product.image} alt={product.name} /><div className="cart-item-info"><div className="badge-row"><FitmentBadge status="VERIFIED" /></div><h3>{product.name}</h3><p>Carbon Quad · Valve Controller</p><span>BMW M3 G80 · 2022</span><div className="cart-item-bottom"><div className="quantity-control"><button onClick={() => setQty(Math.max(1, qty - 1))}><Minus /></button><span>{qty}</span><button onClick={() => setQty(qty + 1)}><Plus /></button></div><strong>{formatPrice(product.price * qty)}원</strong></div></div><button className="cart-delete" aria-label="상품 삭제"><X /></button></article></div><a className="text-link" href="/products"><ArrowLeft /> 쇼핑 계속하기</a></section><OrderSummary total={product.price * qty} actionHref="/checkout" action="주문하기" /></div></div></div>
  );
}

function OrderSummary({ total, actionHref, action }: { total: number; actionHref: string; action: string }) {
  return <aside className="order-summary"><h2>주문 요약</h2><dl><div><dt>상품 금액</dt><dd>{formatPrice(total)}원</dd></div><div><dt>배송비</dt><dd>무료</dd></div><div><dt>장착비</dt><dd>상담 후 안내</dd></div></dl><div className="summary-total"><span>결제 예정 금액</span><strong>{formatPrice(total)}<small>원</small></strong></div><a className="button primary full large" href={actionHref}>{action} <ArrowRight /></a><p><LockKeyhole /> 결제 정보는 안전하게 처리됩니다.</p></aside>;
}

function CheckoutPage({ showToast }: { showToast: (message: string) => void }) {
  const [agree, setAgree] = useState(false);
  const [processing, setProcessing] = useState(false);
  const submit = async () => {
    if (!agree) { showToast("필수 동의 항목을 확인해 주세요."); return; }
    setProcessing(true);
    await saveAction("order", { product: products[0].sku, total: products[0].price, status: "RECEIVED" });
    window.setTimeout(() => { window.location.href = "/checkout/complete"; }, 700);
  };
  return (
    <div className="checkout-page page-light"><div className="checkout-header"><div className="grid-container"><BrandMark dark /><ol><li className="done"><Check />장바구니</li><li className="active"><span>2</span>주문·결제</li><li><span>3</span>완료</li></ol><a href="/cart"><X /></a></div></div><div className="grid-container narrow-page checkout-body"><h1>주문·결제</h1><div className="checkout-layout"><div className="checkout-sections"><CheckoutSection number="01" title="주문자 정보"><div className="form-grid"><Field label="이름" placeholder="홍길동" /><Field label="연락처" placeholder="010-0000-0000" /><Field label="이메일" placeholder="name@example.com" wide /></div></CheckoutSection><CheckoutSection number="02" title="배송지"><div className="form-grid"><Field label="받는 분" placeholder="홍길동" /><Field label="연락처" placeholder="010-0000-0000" /><Field label="주소" placeholder="우편번호 검색" wide /><Field label="상세 주소" placeholder="상세 주소 입력" wide /></div></CheckoutSection><CheckoutSection number="03" title="장착 방식"><div className="choice-grid"><label className="choice-card selected"><input type="radio" name="install" defaultChecked /><Store /><strong>장착점으로 배송</strong><span>구매 후 장착 예약 신청</span><CheckCircle2 /></label><label className="choice-card"><input type="radio" name="install" /><Truck /><strong>일반 배송</strong><span>입력한 주소로 배송</span></label></div></CheckoutSection><CheckoutSection number="04" title="결제 수단"><div className="payment-options"><button className="selected">신용·체크카드 <Check /></button><button>간편결제</button><button>무통장입금</button></div></CheckoutSection><CheckoutSection number="05" title="약관 동의"><label className="consent-all"><input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} /><span><Check /></span><strong>필수 약관에 모두 동의합니다</strong></label><label className="consent-row"><input type="checkbox" checked={agree} readOnly /><span>[필수] 구매조건 및 결제 진행 동의</span><a href="#">보기</a></label><label className="consent-row"><input type="checkbox" checked={agree} readOnly /><span>[필수] 개인정보 수집·이용 동의</span><a href="#">보기</a></label><label className="consent-row"><input type="checkbox" /><span>[선택] 장착 정보 및 혜택 알림 동의</span><a href="#">보기</a></label></CheckoutSection></div><aside className="order-summary checkout-summary"><h2>주문 상품</h2><div className="summary-product"><img src={products[0].image} alt={products[0].name} /><div><strong>{products[0].name}</strong><span>Carbon Quad · 1개</span></div></div><dl><div><dt>상품 금액</dt><dd>3,200,000원</dd></div><div><dt>배송비</dt><dd>무료</dd></div><div><dt>장착비</dt><dd>상담 후 안내</dd></div></dl><div className="summary-total"><span>최종 결제 금액</span><strong>3,200,000<small>원</small></strong></div><button className="button primary full large" disabled={processing} onClick={submit}>{processing ? "승인 상태 확인 중…" : "3,200,000원 결제하기"}</button><p><LockKeyhole /> 처리 중에는 중복 결제가 차단됩니다.</p></aside></div></div><div className="checkout-mobile-action"><div><span>결제 예정</span><strong>3,200,000원</strong></div><button className="button primary" onClick={submit} disabled={processing}>{processing ? "확인 중…" : "결제하기"}</button></div></div>
  );
}

function Field({ label, placeholder, wide = false }: { label: string; placeholder: string; wide?: boolean }) {
  return <label className={wide ? "wide" : ""}><span>{label}</span><input placeholder={placeholder} /></label>;
}

function CheckoutSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="checkout-section"><div className="checkout-section-title"><span>{number}</span><h2>{title}</h2></div>{children}</section>;
}

function CompletePage() {
  return (
    <div className="complete-page page-light"><div className="grid-container complete-container"><div className="complete-icon"><Check /></div><span className="eyebrow red">ORDER COMPLETE</span><h1>주문이 접수되었습니다</h1><p>주문번호 <strong>TB-260804-0142</strong> · 결제 및 재고 상태를 확인했습니다.</p><div className="next-step-card"><div className="next-step-head"><PackageCheck /><div><strong>국내 재고 상품</strong><span>주문 확인 후 출고 일정을 안내합니다</span></div></div><ol><li className="done"><span><Check /></span><div><strong>주문 접수</strong><small>2026.08.04 11:42</small></div></li><li className="active"><span>2</span><div><strong>상품 준비</strong><small>담당자가 재고를 최종 확인합니다</small></div></li><li><span>3</span><div><strong>배송 또는 장착점 입고</strong><small>확정 후 알림으로 안내합니다</small></div></li></ol></div><div className="complete-actions"><a className="button primary" href="/installation/booking">장착 예약 신청 <ArrowRight /></a><a className="button secondary" href="/mypage/orders/TB-260804-0142">주문 상세 보기</a></div><p className="muted-note">장착 일정은 장착점 확인 후 확정됩니다. 화면의 날짜는 임의로 생성하지 않습니다.</p></div></div>
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
  const submit = async () => { await saveAction("support", { type: path.split("/").pop(), product: products[0].sku, vehicle: "BMW M3 G80" }); showToast("문의가 접수되었습니다. 마이페이지에서 상태를 확인할 수 있습니다."); };
  return (
    <div className="support-page page-light"><div className="page-hero compact dark-hero"><div className="grid-container"><span className="eyebrow red">CUSTOMER SUPPORT</span><h1>{isForm ? "문의 접수" : "무엇을 도와드릴까요?"}</h1><p>제품, 적합성, 주문, 장착, AS 문의를 국내 운영팀에 남겨주세요.</p></div></div><div className="grid-container support-content">{isForm ? <div className="support-form-layout"><section className="support-form"><div className="attached-context"><span>자동 첨부 정보</span><div><img src={products[0].image} alt={products[0].name}/><p><strong>{products[0].name}</strong><small>BMW M3 G80 · 장착 확인 · Carbon Quad</small></p><CheckCircle2 /></div></div><div className="form-grid"><label><span>문의 유형</span><select><option>차량 적합성 문의</option><option>장착 조건 문의</option><option>주문·배송 문의</option><option>AS 문의</option></select></label><Field label="연락처" placeholder="010-0000-0000"/><Field label="제목" placeholder="문의 제목을 입력해 주세요" wide/><label className="wide"><span>문의 내용</span><textarea placeholder="차량 세부 사양과 궁금한 점을 남겨주세요."/></label><label className="wide file-upload"><span>첨부 파일</span><button><Plus/>사진 또는 파일 추가</button><small>차량 등록증은 개인정보를 가린 뒤 첨부해 주세요.</small></label></div><button className="button primary large" onClick={submit}>문의 접수하기 <ArrowRight /></button></section><aside className="support-side"><Headphones/><h3>접수 전 확인해 주세요</h3><p>차대번호는 선택 정보이며, 필요한 경우 담당자가 별도로 요청할 수 있습니다.</p><a href="/support/faq">자주 묻는 질문 <ArrowRight/></a></aside></div> : <><div className="support-quick-grid"><a href="/support/faq"><CircleHelp/><strong>자주 묻는 질문</strong><span>제품·주문·장착 안내</span><ChevronRight/></a><a href="/support/inquiry"><MessageCircle/><strong>1:1 문의</strong><span>차량 정보와 함께 접수</span><ChevronRight/></a><a href="/support/return"><RotateCcw/><strong>반품·교환</strong><span>정책과 신청 절차</span><ChevronRight/></a><a href="/support/warranty"><ShieldCheck/><strong>보증·AS</strong><span>보증 범위와 접수</span><ChevronRight/></a></div><section className="faq-section"><div><span className="eyebrow red">FAQ</span><h2>자주 묻는 질문</h2></div><div className="faq-list">{["내 차량에 장착 가능한지 어떻게 확인하나요?", "해외발주 상품의 일정은 언제 알 수 있나요?", "장착비는 상품 가격에 포함되나요?", "구조변경이나 소음 기준을 보장하나요?"].map((question, index) => <article key={question} className={openFaq === index ? "open" : ""}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)}><span>0{index + 1}</span><strong>{question}</strong><Plus/></button>{openFaq === index && <p>{index === 0 ? "차량을 선택하면 등록된 적합성 상태와 판단 근거를 함께 보여드립니다. 데이터가 부족한 경우 상담으로 연결합니다." : "확정된 데이터가 있는 범위만 안내하며, 임의의 기간이나 법적 보장을 표시하지 않습니다."}</p>}</article>)}</div></section></>}</div></div>
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
  if (path === "/admin/login" || path === "/admin/verify") return <AdminLogin verify={path.endsWith("verify")} />;
  return <div className="admin-shell"><AdminSidebar path={path}/><div className="admin-workspace"><AdminTopbar/><main className="admin-main">{path === "/admin" ? <AdminDashboard/> : <AdminModule path={path} showToast={showToast}/>}</main></div>{toast && <div className="toast" role="status"><CheckCircle2 size={18}/>{toast}</div>}</div>;
}

function AdminLogin({ verify }: { verify: boolean }) {
  return <div className="admin-login"><div className="admin-login-brand"><BrandMark/><span>OPERATIONS</span></div><div className="admin-login-card"><div className="admin-lock"><LockKeyhole/></div><span className="eyebrow red">SECURE ADMIN</span><h1>{verify ? "2단계 인증" : "운영자 로그인"}</h1><p>{verify ? "인증 앱에 표시된 6자리 코드를 입력해 주세요." : "권한이 부여된 운영자 계정으로 로그인하세요."}</p>{verify ? <><div className="code-inputs">{Array.from({length: 6}).map((_, index) => <input key={index} inputMode="numeric" maxLength={1} aria-label={`인증 코드 ${index + 1}번째 자리`}/>)}</div><a className="button primary full large" href="/admin">인증하기</a></> : <><Field label="이메일" placeholder="admin@taibosi.demo"/><Field label="비밀번호" placeholder="비밀번호 입력"/><a className="button primary full large" href="/admin/verify">로그인</a></>}<div className="admin-security-note"><ShieldCheck/><span>로그인과 2FA 시도는 감사 로그에 기록됩니다.</span></div><a href="/">고객 쇼핑몰로 돌아가기</a></div></div>;
}

function AdminSidebar({ path }: { path: string }) {
  return <aside className="admin-sidebar"><div className="admin-logo"><BrandMark/><span>OPERATIONS</span></div><nav>{adminNav.map((group) => <div key={group.group}><span>{group.group}</span>{group.items.map(([href, label, Icon]) => <a href={href} className={(href === "/admin" ? path === href : path.startsWith(href)) ? "active" : ""} key={href}><Icon/>{label}{label === "문의·AS" && <b>3</b>}</a>)}</div>)}</nav><div className="admin-user"><span>AK</span><div><strong>김아라</strong><small>Super Admin</small></div><ChevronRight/></div></aside>;
}

function AdminTopbar() {
  return <header className="admin-topbar"><div><Search/><input placeholder="주문번호, 상품, 고객 검색" aria-label="관리자 통합 검색"/><kbd>⌘ K</kbd></div><span className="admin-sample">샘플 데이터</span><button aria-label="알림"><Bell/><b>3</b></button><button aria-label="설정"><Settings/></button></header>;
}

function AdminDashboard() {
  const [eventCount, setEventCount] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/actions")
      .then((response) => response.json() as Promise<{ events?: unknown[] }>)
      .then((data) => setEventCount(Array.isArray(data.events) ? data.events.length : 0))
      .catch(() => setEventCount(0));
  }, []);
  return <><AdminPageHeader eyebrow="OVERVIEW" title="운영 대시보드" copy="2026년 8월 4일 화요일 · 샘플 운영 현황" actions={<><button className="admin-button secondary"><CalendarDays/>오늘</button><a className="admin-button primary" href="/admin/products/new"><Plus/>상품 등록</a></>}/><div className="admin-kpi-grid"><KPICard label="오늘 주문" value="18" change="+12.4%" icon={ShoppingBag}/><KPICard label="결제 금액" value="42.8M" change="+8.2%" icon={BarChart3}/><KPICard label="장착 확인 대기" value="7" change="3건 긴급" icon={ClipboardCheck} warning/><KPICard label="문의·AS" value="3" change={eventCount === null ? "접수 동기화 중" : `저장된 이벤트 ${eventCount}건`} icon={MessageCircle}/></div><div className="admin-dashboard-grid"><section className="admin-card order-status-card"><div className="admin-card-head"><div><h2>주문 현황</h2><p>최근 7일 처리 상태</p></div><a href="/admin/orders">전체 주문 <ChevronRight/></a></div><div className="mini-chart"><div className="chart-bars">{[48,64,52,80,68,88,76].map((height,index)=><span key={index}><i style={{height:`${height}%`}}/><b>{["월","화","수","목","금","토","일"][index]}</b></span>)}</div><div className="chart-summary"><strong>126</strong><span>이번 주 주문</span><small>지난주 112건</small></div></div><div className="status-summary-row"><span><i className="blue"/>접수 <b>22</b></span><span><i className="amber"/>준비 <b>18</b></span><span><i className="green"/>배송 <b>14</b></span><span><i className="gray"/>완료 <b>72</b></span></div></section><section className="admin-card attention-card"><div className="admin-card-head"><div><h2>확인 필요</h2><p>우선 처리가 필요한 항목</p></div></div><AttentionRow icon={Warehouse} color="error" title="재고 부족" count="4" copy="안전 재고 이하 SKU" href="/admin/inventory"/><AttentionRow icon={Truck} color="warning" title="해외발주 지연" count="2" copy="예상 일정 초과" href="/admin/purchase-orders"/><AttentionRow icon={ClipboardCheck} color="info" title="적합성 검수 대기" count="7" copy="근거 확인 필요" href="/admin/fitments"/><AttentionRow icon={CalendarDays} color="warning" title="장착 일정 충돌" count="1" copy="8월 12일 · 분당" href="/admin/bookings"/></section></div><div className="admin-dashboard-grid lower"><section className="admin-card recent-orders"><div className="admin-card-head"><div><h2>최근 주문</h2><p>실시간 접수 순</p></div><a href="/admin/orders">전체 보기 <ChevronRight/></a></div><AdminTable compact/></section><section className="admin-card timeline-card"><div className="admin-card-head"><div><h2>해외발주 진행</h2><p>상태 변경이 필요한 건</p></div><a href="/admin/purchase-orders">전체 보기 <ChevronRight/></a></div>{["PO-260731-08", "PO-260728-04", "PO-260721-11"].map((code,index)=><div className="po-row" key={code}><span className={`po-icon c${index}`}><Truck/></span><div><strong>{code}</strong><small>{["선적 서류 확인 대기","통관 일정 업데이트 필요","입고 완료 처리 대기"][index]}</small></div><span className={`status-badge ${["warning","info","success"][index]}`}>{["선적","통관","입고"][index]}</span></div>)}</section></div></>;
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

function AdminModule({ path, showToast }: { path: string; showToast: (message: string) => void }) {
  const key = path.split("/")[2] || "products";
  const meta = moduleMeta[key] || moduleMeta.products;
  const isDetail = path.split("/").length > 3;
  const [drawerOpen, setDrawerOpen] = useState(isDetail);
  const [dialogOpen, setDialogOpen] = useState(false);
  const submitChange = async () => { await saveAction(key === "inventory" ? "inventory" : "fitment", { module: key, reason: "샘플 운영 검증", actor: "김아라" }); setDialogOpen(false); showToast("변경 내용과 사유를 저장하고 감사 로그를 생성했습니다."); };
  if (key === "roles") return <PermissionModule meta={meta} showToast={showToast}/>;
  if (key === "fitments") return <FitmentModule meta={meta} showToast={showToast}/>;
  return <><AdminPageHeader eyebrow={meta.eyebrow} title={meta.title} copy={meta.copy} actions={<><button className="admin-button secondary"><SlidersHorizontal/>보기 설정</button><button className="admin-button primary" onClick={() => key === "inventory" ? setDialogOpen(true) : setDrawerOpen(true)}><Plus/>{meta.action}</button></>}/><div className="admin-filter-bar"><label><Search/><input placeholder={`${meta.title} 검색`}/></label><button>상태 <ChevronDown/></button><button>업데이트일 <ChevronDown/></button><span>필터 0개</span><button className="filter-reset"><RotateCcw/>초기화</button></div><section className="admin-table-card"><div className="table-meta"><strong>전체 {key === "orders" ? "248" : "32"}개</strong><div><button>열 표시 <ChevronDown/></button><button>내보내기</button></div></div><AdminTable module={key} onOpen={() => setDrawerOpen(true)}/></section>{drawerOpen && <DetailDrawer module={key} close={() => setDrawerOpen(false)} onChange={() => setDialogOpen(true)}/>} {dialogOpen && <ReasonDialog module={key} close={() => setDialogOpen(false)} submit={submitChange}/>}</>;
}

function AdminTable({ module = "orders", compact = false, onOpen }: { module?: string; compact?: boolean; onOpen?: () => void }) {
  const data = module === "inventory" ? [
    ["TB-BMW-G8X-VCE-001", "BMW G8X Valved Cat-back", "12", "3", "9", "정상"],
    ["TB-MB-W205-ABE-002", "AMG W205 Axle-back", "4", "2", "2", "부족"],
    ["TB-AU-B9-VCE-003", "Audi RS5 B9 Valved", "0", "0", "0", "예약판매"],
  ] : module === "products" ? [
    ["TB-BMW-G8X-VCE-001", "BMW G80/G82 Valved Cat-back", "Cat-back", "3,200,000원", "공개", "08.04"],
    ["TB-MB-W205-ABE-002", "AMG C63 W205 Axle-back", "Axle-back", "2,450,000원", "공개", "08.03"],
    ["TB-AU-B9-VCE-003", "Audi RS5 B9 Valved Exhaust", "Valved", "2,900,000원", "검수 대기", "08.02"],
  ] : module === "audit-logs" ? [
    ["08.04 11:42", "김아라", "재고 조정", "TB-BMW-G8X", "+2", "운영 입고"],
    ["08.04 10:18", "박도윤", "적합성 변경", "FIT-0082", "조건부 → 확인", "근거 검수"],
    ["08.04 09:31", "김아라", "개인정보 조회", "CUS-1048", "주문 상담", "CS 처리"],
  ] : [
    ["TB-260804-0142", "김민준", "BMW G8X Cat-back", "3,200,000원", "상품 준비", "11:42"],
    ["TB-260804-0141", "이서윤", "AMG W205 Axle-back", "2,450,000원", "결제 완료", "10:58"],
    ["TB-260804-0140", "최도윤", "Audi RS5 Valved", "2,900,000원", "상담 대기", "09:24"],
    ["TB-260803-0139", "박하린", "Porsche 992 Tip", "780,000원", "취소 요청", "어제"],
  ];
  const headers = module === "inventory" ? ["SKU", "상품", "실재고", "예약", "가용", "상태"] : module === "products" ? ["SKU", "상품명", "유형", "판매가", "상태", "수정일"] : module === "audit-logs" ? ["일시", "작업자", "행동", "대상", "변경", "사유"] : ["주문번호", "고객", "상품", "결제금액", "상태", "접수"];
  return <div className="admin-table-wrap"><table className={compact ? "compact" : ""}><thead><tr><th><input type="checkbox" aria-label="전체 선택"/></th>{headers.map((header)=><th key={header}>{header}<ChevronDown/></th>)}<th/></tr></thead><tbody>{data.slice(0,compact?4:data.length).map((row,index)=><tr key={row[0]} onClick={onOpen}><td><input type="checkbox" aria-label={`${row[0]} 선택`}/></td>{row.map((cell,cellIndex)=><td key={cellIndex}>{cellIndex===0?<strong>{cell}</strong>:cellIndex===4?<span className={`table-status s${index}`}>{cell}</span>:cell}</td>)}<td><button aria-label="행 메뉴">•••</button></td></tr>)}</tbody></table></div>;
}

function DetailDrawer({ module, close, onChange }: { module:string; close:()=>void; onChange:()=>void }) {
  return <div className="drawer-backdrop" onMouseDown={close}><aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={`${moduleMeta[module]?.title ?? "상세"} 상세`} onMouseDown={(e)=>e.stopPropagation()}><header><div><span>{moduleMeta[module]?.eyebrow}</span><h2>{module === "orders" ? "주문 TB-260804-0142" : "BMW G8X Valved Cat-back"}</h2></div><button onClick={close}><X/></button></header><div className="drawer-tabs"><button className="active">기본 정보</button><button>변경 이력</button><button>감사 로그</button></div><div className="drawer-content"><div className="drawer-status"><span className="status-badge info"><Package/>상품 준비</span><small>2026.08.04 11:42 업데이트</small></div><h3>핵심 정보</h3><dl><div><dt>상품</dt><dd>BMW G80/G82 Valved Cat-back Exhaust</dd></div><div><dt>SKU</dt><dd>TB-BMW-G8X-VCE-001</dd></div><div><dt>차량</dt><dd>BMW M3 G80 · 2022 · 3.0</dd></div><div><dt>적합성 Snapshot</dt><dd><span className="status-badge success"><CheckCircle2/>장착 확인</span></dd></div><div><dt>재고 유형</dt><dd>국내 재고</dd></div></dl><div className="drawer-evidence"><ShieldCheck/><div><strong>변경은 감사 로그에 기록됩니다</strong><p>상태 변경에는 사유 입력이 필요합니다.</p></div></div></div><footer><button className="admin-button secondary" onClick={close}>닫기</button><button className="admin-button primary" onClick={onChange}>상태 변경</button></footer></aside></div>;
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
