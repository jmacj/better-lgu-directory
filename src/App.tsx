import {
  FormEvent,
  ReactNode,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Database,
  ExternalLink,
  Facebook,
  FileCheck2,
  FileText,
  Github,
  HeartPulse,
  Landmark,
  Mail,
  Menu,
  Phone,
  MapPin,
  ReceiptText,
  Search,
  ShieldCheck,
  Siren,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { z } from "zod";
import {
  civicRecords,
  departments,
  disclosures,
  financialSnapshot,
  governanceHighlights,
  officials,
  procurementSources,
  publicProjects,
  searchableRecords,
  services,
  VERIFIED_ON,
} from "./data";
import {
  barangayMicrositeBySlug,
  barangayMicrosites,
  barangaySlugFromHostname,
  type BarangayMicrositeProfile,
} from "./barangayProfiles";

const navItems = [
  { label: "Transparency", to: "/transparency" },
  { label: "Government", to: "/government" },
  { label: "Barangays", to: "/barangays" },
  { label: "Public services", to: "/services" },
  { label: "Participate", to: "/participate" },
];

const telephoneHref = (value?: string) =>
  value?.split(/\s*(?:\/|\|)\s*/)[0].replace(/[^+\d]/g, "") ?? "";

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="BetterMC home">
      <span className="brand-assets" aria-hidden="true">
        <span className="brand-main" />
        <span className="brand-wordmark" />
      </span>
      <span className="brand-title">
        <strong>Better Malaybalay City</strong>
        <small>Independent public information</small>
      </span>
    </Link>
  );
}

function MalaybalayClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const date = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);
  const time = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);
  return (
    <div
      className="city-clock"
      aria-label={`Malaybalay time: ${date}, ${time}`}
    >
      <Clock3 aria-hidden="true" />
      <span>
        <small>Malaybalay time · Asia/Manila</small>
        <strong>
          <time dateTime={now.toISOString()}>{time}</time>
          <em>{date}</em>
        </strong>
      </span>
    </div>
  );
}

function FinancialBreakdown() {
  const [selectedRow, setSelectedRow] = useState<{
    section: "income" | "spending";
    label: string;
    amount: number;
  } | null>(null);
  const currency = (value: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);
  const incomeMax = financialSnapshot.incomeBreakdown[0].amount;
  const spendingMax = financialSnapshot.expenditureBreakdown[0].amount;
  return (
    <div className="financial-detail">
      <div className="breakdown-panel">
        <div className="breakdown-title">
          <h3>Operating income by source</h3>
          <strong>{currency(financialSnapshot.currentOperatingIncome)}</strong>
        </div>
        <div className="money-rows">
          {financialSnapshot.incomeBreakdown.map((row) => (
            <button
              className="money-row"
              type="button"
              key={row.label}
              aria-pressed={
                selectedRow?.section === "income" &&
                selectedRow.label === row.label
              }
              onClick={() => setSelectedRow({ section: "income", ...row })}
            >
              <span>
                <span>{row.label}</span>
                <strong>{currency(row.amount)}</strong>
              </span>
              <span className="amount-track" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.max(1, (row.amount / incomeMax) * 100)}%`,
                  }}
                />
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="breakdown-panel">
        <div className="breakdown-title">
          <h3>Operating spending by service area</h3>
          <strong>
            {currency(financialSnapshot.currentOperatingExpenditures)}
          </strong>
        </div>
        <div className="money-rows">
          {financialSnapshot.expenditureBreakdown.map((row) => (
            <button
              className="money-row"
              type="button"
              key={row.label}
              aria-pressed={
                selectedRow?.section === "spending" &&
                selectedRow.label === row.label
              }
              onClick={() => setSelectedRow({ section: "spending", ...row })}
            >
              <span>
                <span>{row.label}</span>
                <strong>{currency(row.amount)}</strong>
              </span>
              <span className="amount-track" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.max(1, (row.amount / spendingMax) * 100)}%`,
                  }}
                />
              </span>
            </button>
          ))}
        </div>
      </div>
      {selectedRow && (
        <div className="breakdown-insight" role="status">
          <div>
            <span>
              {selectedRow.section === "income"
                ? "Share of reported operating income"
                : "Share of reported operating expenditures"}
            </span>
            <strong>
              {(
                (selectedRow.amount /
                  (selectedRow.section === "income"
                    ? financialSnapshot.currentOperatingIncome
                    : financialSnapshot.currentOperatingExpenditures)) *
                100
              ).toFixed(2)}
              %
            </strong>
          </div>
          <p>
            <b>{selectedRow.label}</b> accounts for{" "}
            {currency(selectedRow.amount)} in the source statement. Select
            another row to compare its reported share.
          </p>
          <a
            href={financialSnapshot.source.url}
            target="_blank"
            rel="noreferrer"
          >
            Check the source PDF <ExternalLink />
          </a>
        </div>
      )}
      <div className="cash-panel">
        <div>
          <span>Beginning cash balance</span>
          <strong>{currency(financialSnapshot.beginningCashBalance)}</strong>
        </div>
        <ArrowRight aria-hidden="true" />
        <div>
          <span>Net increase in funds</span>
          <strong>{currency(financialSnapshot.netIncreaseInFunds)}</strong>
        </div>
        <ArrowRight aria-hidden="true" />
        <div>
          <span>Ending cash balance</span>
          <strong>{currency(financialSnapshot.endingCashBalance)}</strong>
        </div>
      </div>
      <div className="non-operating">
        <h3>Other reported financial movements</h3>
        <div>
          {financialSnapshot.nonOperatingBreakdown.map((row) => (
            <p key={row.label}>
              <span>{row.label}</span>
              <strong>{currency(row.amount)}</strong>
            </p>
          ))}
          <p>
            <span>Prior-year accounts payable paid</span>
            <strong>
              {currency(financialSnapshot.priorYearAccountsPayable)}
            </strong>
          </p>
          <p>
            <span>Continuing appropriation</span>
            <strong>
              {currency(financialSnapshot.continuingAppropriation)}
            </strong>
          </p>
        </div>
      </div>
      <p className="finance-method">
        <CircleAlert />
        Amounts are reported actuals for 2025 Q2. “Net operating balance,” “net
        increase in funds,” and “ending cash balance” are different accounting
        measures and are not interchangeable with savings.
      </p>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <div className="independence-bar">
        <div className="container independence-inner">
          <p>
            Independent public information platform{" "}
            <span>Not an official City Government website</span>
          </p>
          <MalaybalayClock />
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            className="menu-button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <div
          id="mobile-navigation"
          className={`mobile-nav-shell ${open ? "is-open" : ""}`}
          aria-hidden={!open}
        >
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
              >
                {item.label}
                <ArrowRight />
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <section className="footer-intro" aria-labelledby="footer-purpose">
          <Brand />
          <div>
            <span id="footer-purpose">Public information, made useful</span>
            <p>
              Understand local government through records that keep their
              source, context, and verification date.
            </p>
          </div>
        </section>
        <nav
          className="footer-column footer-nav"
          aria-label="Footer navigation"
        >
          <h2>Explore BetterMC</h2>
          <Link to="/about">About & methodology</Link>
          <Link to="/transparency">Transparency records</Link>
          <Link to="/participate">Submit a correction</Link>
          <a
            className="footer-icon-link"
            href="https://github.com/lordzxxxx/bettermalaybalay"
            target="_blank"
            rel="noreferrer"
          >
            <Github aria-hidden="true" />
            Contribute on GitHub
          </a>
        </nav>
        <address className="footer-column footer-contact">
          <h2>Official city contact</h2>
          <a
            className="footer-action-card footer-contact-primary"
            href="tel:09171884225"
          >
            <Phone aria-hidden="true" />
            <span>
              <small>City Administrator’s Office</small>
              <strong>0917 188 4225</strong>
            </span>
          </a>
          <small className="footer-source-label">
            Published in the City Government contact directory
          </small>
          <div className="footer-contact-links">
            <a
              href="https://sakata.malaybalaycity.gov.ph/"
              target="_blank"
              rel="noreferrer"
            >
              City Government website <ExternalLink aria-hidden="true" />
            </a>
            <a
              className="footer-icon-link"
              href="https://www.facebook.com/profile.php?id=100063747444247"
              target="_blank"
              rel="noreferrer"
            >
              <Facebook aria-hidden="true" />
              Official Facebook page
            </a>
          </div>
        </address>
        <section
          className="footer-column footer-network"
          aria-labelledby="civic-network"
        >
          <h2 id="civic-network">Civic network</h2>
          <a
            className="footer-action-card bettergov-link"
            href="https://lgu.bettergov.ph/"
            target="_blank"
            rel="noreferrer"
          >
            <span>Powered by</span>
            <strong>BetterGov</strong>
            <ExternalLink aria-hidden="true" />
          </a>
          <p>
            Source-linked local government information built for public
            participation.
          </p>
        </section>
      </div>
      <div className="container footer-bottom">
        <p className="disclaimer">
          <ShieldCheck aria-hidden="true" />
          <span>
            <strong>Independent civic platform.</strong> BetterMC is not
            affiliated with, endorsed by, or operated by the City Government of
            Malaybalay. Use the responsible government office for official
            transactions and certifications.
          </span>
        </p>
        <small>Sources reviewed {VERIFIED_ON}</small>
      </div>
    </footer>
  );
}

function Layout({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      window.requestAnimationFrame(() =>
        document
          .getElementById(hash.slice(1))
          ?.scrollIntoView({ block: "start" }),
      );
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}

function SourceNote({
  url,
  label = "Official source",
  date = VERIFIED_ON,
}: {
  url: string;
  label?: string;
  date?: string;
}) {
  return (
    <div className="source-note">
      <ShieldCheck aria-hidden="true" />
      <span>
        <a href={url} target="_blank" rel="noreferrer">
          {label}
          <ExternalLink aria-hidden="true" />
        </a>
        <small>Checked {date}</small>
      </span>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase();
    if (!value) return [];
    return searchableRecords
      .filter((record) =>
        `${record.title} ${record.detail} ${record.type}`
          .toLowerCase()
          .includes(value),
      )
      .slice(0, 7);
  }, [deferredQuery]);
  return (
    <div className="global-search">
      <Search aria-hidden="true" />
      <label htmlFor="site-search" className="sr-only">
        Search officials, offices, barangays and services
      </label>
      <input
        id="site-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search officials, offices, barangays, services…"
        autoComplete="off"
      />
      {query && (
        <div
          className="search-results"
          role="listbox"
          aria-label="Search results"
        >
          {results.length ? (
            results.map((result) => (
              <Link
                key={`${result.type}-${result.title}`}
                to={result.href}
                role="option"
              >
                <small>{result.type}</small>
                <span>
                  {result.title}
                  <em>{result.detail}</em>
                </span>
                <ArrowRight />
              </Link>
            ))
          ) : (
            <p>No matching verified record found.</p>
          )}
        </div>
      )}
    </div>
  );
}

function HomePage() {
  const [financeFocus, setFinanceFocus] = useState<
    "income" | "spending" | "balance" | "savings" | null
  >(null);
  const [financeDetailsOpen, setFinanceDetailsOpen] = useState(false);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const availableDisclosures = disclosures.filter(
    (item) => item.status === "Source listed",
  ).length;
  const money = (value: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      notation: "compact",
      maximumFractionDigits: 3,
    }).format(value);
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>
              Malaybalay public information, <em>made clear.</em>
            </h1>
            <p>
              Understand city finances, public records, leadership, barangays,
              and services through a source-linked platform built for
              accountability.
            </p>
            <div className="hero-actions">
              <Link className="button primary" to="/transparency">
                Explore transparency <ArrowRight />
              </Link>
              <Link className="button secondary" to="/government">
                Find an office
              </Link>
            </div>
            <div className="hero-verification">
              <ShieldCheck />
              <span>
                Records show their original source and verification date.
                <strong>Last research review: November 5, 2026</strong>
              </span>
            </div>
          </div>
          <div className="hero-panel glass-panel">
            <div className="hero-brand">
              <span className="hero-brand-main" />
              <span className="hero-brand-wordmark" />
              <p>
                Better information. Better accountability. Better Malaybalay.
              </p>
            </div>
            <div className="panel-top">
              <span>Search public information</span>
              <kbd>⌘ K</kbd>
            </div>
            <GlobalSearch />
            <div className="quick-grid">
              <Link to="/transparency">
                <FileText />
                <span>
                  Full disclosure<small>2022–2026 catalog</small>
                </span>
              </Link>
              <Link to="/government">
                <Landmark />
                <span>
                  Government<small>Officials & offices</small>
                </span>
              </Link>
              <Link to="/services">
                <BookOpen />
                <span>
                  Public services<small>Charter & forms</small>
                </span>
              </Link>
              <Link to="/government?tab=hotlines">
                <Siren />
                <span>
                  Emergency contacts<small>Tap to call</small>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="metrics-strip">
        <div className="container metrics-grid">
          <div>
            <strong>{availableDisclosures}</strong>
            <span>source-listed disclosure entries</span>
          </div>
          <div>
            <strong>{departments.length}</strong>
            <span>offices and public contacts</span>
          </div>
          <div>
            <strong>{officials.length}</strong>
            <span>elected and sectoral officials</span>
          </div>
          <div>
            <strong>{barangayMicrosites.length}</strong>
            <span>barangays with DILG-listed leaders</span>
          </div>
        </div>
        <p className="metric-caption container">
          Counts reflect records in this portal, not a legal-compliance
          assessment.
        </p>
      </section>
      <section
        className="section container finance-section"
        id="financial-snapshot"
      >
        <div className="finance-heading">
          <SectionHeading
            eyebrow="City finances · 2025 Q2"
            title="Where the money came from, where it went, and what remained."
          >
            These are reported actual amounts—not forecasts—from Malaybalay
            City’s Statement of Receipts and Expenditures for the quarter ending
            June 2025. Labels below follow the source record.
          </SectionHeading>
          <div className="finance-source">
            <FileCheck2 aria-hidden="true" />
            <div>
              <span>Primary financial record</span>
              <a
                href={financialSnapshot.source.url}
                target="_blank"
                rel="noreferrer"
              >
                2025 Q2 Statement of Receipts and Expenditures <ExternalLink />
              </a>
              <small>
                Official City Government PDF · source reviewed {VERIFIED_ON}
              </small>
            </div>
          </div>
        </div>
        <div className="finance-grid">
          <button
            type="button"
            aria-expanded={financeFocus === "income"}
            onClick={() =>
              setFinanceFocus(financeFocus === "income" ? null : "income")
            }
          >
            <TrendingUp />
            <span>Current operating income</span>
            <strong>{money(financialSnapshot.currentOperatingIncome)}</strong>
            <small>{financialSnapshot.period} reported actual · inspect</small>
          </button>
          <button
            type="button"
            aria-expanded={financeFocus === "spending"}
            onClick={() =>
              setFinanceFocus(financeFocus === "spending" ? null : "spending")
            }
          >
            <ReceiptText />
            <span>Current operating expenditures</span>
            <strong>
              {money(financialSnapshot.currentOperatingExpenditures)}
            </strong>
            <small>{financialSnapshot.period} reported actual · inspect</small>
          </button>
          <button
            type="button"
            aria-expanded={financeFocus === "balance"}
            onClick={() =>
              setFinanceFocus(financeFocus === "balance" ? null : "balance")
            }
          >
            <BarChart3 />
            <span>Net operating balance</span>
            <strong>{money(financialSnapshot.netOperatingBalance)}</strong>
            <small>Income less operating expenditures · inspect</small>
          </button>
          <button
            type="button"
            className="savings-card"
            aria-expanded={financeFocus === "savings"}
            onClick={() =>
              setFinanceFocus(financeFocus === "savings" ? null : "savings")
            }
          >
            <ShieldCheck />
            <span>Total savings</span>
            <strong>Not separately reported</strong>
            <small>Why BetterMC does not invent this number · inspect</small>
          </button>
        </div>
        {financeFocus && (
          <div className="finance-insight" role="region" aria-live="polite">
            <div>
              <span>What this figure means</span>
              <h3>
                {financeFocus === "income"
                  ? "Current operating income"
                  : financeFocus === "spending"
                    ? "Current operating expenditures"
                    : financeFocus === "balance"
                      ? "Net operating balance"
                      : "Savings is not a reported line item"}
              </h3>
            </div>
            <p>
              {financeFocus === "income"
                ? "Revenue reported from operating sources during the period. It is not the same as the total cash available to the city."
                : financeFocus === "spending"
                  ? "Current operating costs reported for the period. Capital, debt-principal, and other non-operating movements are shown separately below."
                  : financeFocus === "balance"
                    ? `${money(financialSnapshot.currentOperatingIncome)} income less ${money(financialSnapshot.currentOperatingExpenditures)} operating expenditures equals ${money(financialSnapshot.netOperatingBalance)}. This is not automatically “savings.”`
                    : "The official statement reports a net operating balance, net increase in funds, and ending cash balance, but it does not publish a distinct total-savings figure. BetterMC therefore leaves it uncalculated."}
            </p>
            <a
              href={financialSnapshot.source.url}
              target="_blank"
              rel="noreferrer"
            >
              Verify in the official statement <ExternalLink />
            </a>
          </div>
        )}
        <button
          className="home-disclosure-control"
          type="button"
          aria-expanded={financeDetailsOpen}
          aria-controls="financial-detail"
          onClick={() => setFinanceDetailsOpen((open) => !open)}
        >
          <span>
            <strong>
              {financeDetailsOpen
                ? "Hide detailed breakdown"
                : "Show detailed breakdown"}
            </strong>
            <small>
              Income sources, service-area spending, cash movement, and exact
              amounts
            </small>
          </span>
          <ChevronDown aria-hidden="true" />
        </button>
        <div
          id="financial-detail"
          className={`home-reveal ${financeDetailsOpen ? "is-open" : ""}`}
          aria-hidden={!financeDetailsOpen}
        >
          <div className="home-reveal-inner">
            <FinancialBreakdown />
          </div>
        </div>
      </section>
      <section className="section container records-preview-section">
        <SectionHeading
          eyebrow="Legislative record"
          title="Published measures, without invented attribution"
        >
          See ordinances and other measures from verified public listings. When
          an individual author or sponsor is not published, BetterMC says so.
        </SectionHeading>
        <div className={`records-preview ${recordsOpen ? "is-expanded" : ""}`}>
          {civicRecords.slice(0, 3).map((record) => (
            <article key={record.number}>
              <span>
                {record.kind} · {new Date(record.published).getFullYear()}
              </span>
              <h3>{record.number}</h3>
              <p>{record.title}</p>
              <small>{record.body}</small>
              <a href={record.source.url} target="_blank" rel="noreferrer">
                Open official listing <ExternalLink />
              </a>
            </article>
          ))}
        </div>
        <div className="home-section-actions">
          <button
            className="mobile-collection-toggle"
            type="button"
            aria-expanded={recordsOpen}
            onClick={() => setRecordsOpen((open) => !open)}
          >
            {recordsOpen ? "Show fewer measures" : "Show 2 more measures"}{" "}
            <ChevronDown aria-hidden="true" />
          </button>
          <Link className="button secondary" to="/government?tab=records">
            View all published measures <ArrowRight />
          </Link>
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          eyebrow="Transparency center"
          title="Start with the original record"
        >
          BetterMC organizes official listings without turning allocations into
          claims of spending or missing files into claims of noncompliance.
        </SectionHeading>
        <div className="transparency-actions">
          <Link className="disclosure-row" to="/transparency">
            <span className="disclosure-icon">
              <FileCheck2 />
            </span>
            <span className="disclosure-copy">
              <small>Full disclosure portal</small>
              <strong>Browse public documents</strong>
              <em>
                Filter financial, procurement, utilization, staffing, and GAD
                records by year and quarter.
              </em>
            </span>
            <span className="disclosure-meta">
              <b>{availableDisclosures} entries</b>
              <small>Source-listed in this portal</small>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
          <div className="supporting-links">
            <a href="/#financial-snapshot">
              <BarChart3 />
              <span>
                <small>Financial breakdown</small>
                <strong>Read the 2025 Q2 figures with context</strong>
              </span>
              <ArrowRight />
            </a>
            <Link to="/participate">
              <Database />
              <span>
                <small>Correction desk</small>
                <strong>Submit a source-backed correction</strong>
              </span>
              <ArrowRight />
            </Link>
            <Link to="/barangays">
              <Landmark />
              <span>
                <small>{barangayMicrosites.length} barangays</small>
                <strong>
                  Find every barangay and its publicly listed leader
                </strong>
              </span>
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
      <section className="section soft-section">
        <div className="container">
          <SectionHeading
            eyebrow="Public directory"
            title="The right office, without the runaround"
          >
            Direct contact details are reproduced from the City Government’s
            current contact directory and retain the original source.
          </SectionHeading>
          <div className="office-preview">
            {departments.slice(0, 6).map((office) => (
              <article key={office.name}>
                <Building2 />
                <h3>{office.name}</h3>
                <a href={`tel:${telephoneHref(office.phone)}`}>
                  <Phone />
                  {office.phone}
                </a>
                <a href={`mailto:${office.email}`}>
                  <Mail />
                  {office.email}
                </a>
              </article>
            ))}
          </div>
          <div className="home-section-actions office-directory-actions">
            <Link className="button secondary" to="/government?tab=offices">
              View all offices <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>
    </section>
  );
}

function TransparencyPage() {
  const [params, setParams] = useSearchParams();
  const year = Number(params.get("year") ?? 2026);
  const quarter = params.get("quarter") ?? "All";
  const category = params.get("category") ?? "All";
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const rows = disclosures.filter(
    (item) =>
      item.year === year &&
      (quarter === "All" || item.quarter === quarter) &&
      (category === "All" || item.category === category) &&
      item.title.toLowerCase().includes(deferredQuery.toLowerCase()),
  );
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next);
  };
  return (
    <>
      <PageHero
        eyebrow="Transparency center"
        title="Public records, with their context intact."
        description="Browse the City Government’s Full Disclosure listings. Availability here means a record was listed by the official source; it is not a legal-compliance rating."
      />
      <section className="section container">
        <div className="data-notice">
          <CircleAlert />
          <div>
            <strong>What this catalog can and cannot tell you</strong>
            <p>
              BetterMC links to the official disclosure source. It does not
              infer that an appropriation was spent, or that an unlisted record
              proves noncompliance.
            </p>
          </div>
        </div>
        <div className="procurement-sources">
          <SectionHeading
            eyebrow="Procurement records"
            title="Award notices and bidding opportunities, kept distinct"
          >
            The BAC pages below organize public procurement records by type. An
            invitation to bid is not an award, and an award notice does not by
            itself establish payment, delivery, or project completion.
          </SectionHeading>
          <div className="procurement-grid">
            {procurementSources.map((source) => (
              <a
                key={source.title}
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                <span>{source.kind}</span>
                <h2>{source.title}</h2>
                <p>{source.description}</p>
                <small>{source.coverage}</small>
                <strong>
                  Open BAC source <ExternalLink />
                </strong>
              </a>
            ))}
          </div>
          <p className="procurement-review">
            <ShieldCheck aria-hidden="true" /> Pages reviewed {VERIFIED_ON}. The
            general hub and SVP page currently mix bidding opportunities with
            other records; BetterMC does not relabel them as awarded projects.
          </p>
        </div>
        <div className="toolbar">
          <label>
            <span>Search records</span>
            <div className="input-wrap">
              <Search />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search document titles"
              />
            </div>
          </label>
          <label>
            <span>Fiscal year</span>
            <select
              value={year}
              onChange={(event) => updateParam("year", event.target.value)}
            >
              {[2026, 2025, 2024, 2023, 2022].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Quarter</span>
            <select
              value={quarter}
              onChange={(event) => updateParam("quarter", event.target.value)}
            >
              {["All", "Annual", "Q1", "Q2", "Q3", "Q4"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => updateParam("category", event.target.value)}
            >
              {[
                "All",
                "Budget",
                "Procurement",
                "Financial",
                "Utilization",
                "Staffing",
                "GAD",
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="results-summary">
          <strong>{rows.length} records</strong>
          <span>Source checked {VERIFIED_ON}</span>
        </div>
        <div className="records-list">
          {rows.map((record) => (
            <article key={`${record.year}-${record.quarter}-${record.title}`}>
              <div className="record-icon">
                <FileText />
              </div>
              <div className="record-main">
                <div className="record-meta">
                  <span>{record.category}</span>
                  <span>{record.year}</span>
                  <span>{record.quarter}</span>
                </div>
                <h2>{record.title}</h2>
                <p
                  className={
                    record.status.startsWith("Not")
                      ? "unavailable"
                      : "available"
                  }
                >
                  {record.status.startsWith("Not") ? (
                    <CircleAlert />
                  ) : (
                    <Check />
                  )}
                  {record.status}
                </p>
              </div>
              <a
                className="record-link"
                href={record.source.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open official source for ${record.title}`}
              >
                Official source <ExternalLink />
              </a>
            </article>
          ))}
        </div>
        <SourceNote
          url="https://sakata.malaybalaycity.gov.ph/full-disclosure/"
          label="Malaybalay City Full Disclosure"
        />
      </section>
    </>
  );
}

type GovernmentTab = "officials" | "records" | "offices" | "hotlines";
function GovernmentPage() {
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get("tab");
  const tab: GovernmentTab =
    requestedTab === "records" ||
    requestedTab === "offices" ||
    requestedTab === "hotlines"
      ? requestedTab
      : "officials";
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.toLowerCase());
  const visibleOfficials = officials.filter((item) =>
    `${item.name} ${item.role}`.toLowerCase().includes(deferredQuery),
  );
  const openOfficial = params.get("official");
  const officialId = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  useEffect(() => {
    if (!openOfficial) return;
    const profile = document.getElementById(`official-${openOfficial}`);
    if (!profile || typeof profile.scrollIntoView !== "function") return;
    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    profile.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [openOfficial]);
  const toggleOfficial = (name: string) => {
    const next = new URLSearchParams(params);
    next.set("tab", "officials");
    if (openOfficial === officialId(name)) next.delete("official");
    else next.set("official", officialId(name));
    setParams(next);
  };
  const visibleOffices = departments.filter(
    (item) =>
      (tab !== "hotlines" || item.emergency) &&
      `${item.name} ${item.email} ${item.phone}`
        .toLowerCase()
        .includes(deferredQuery),
  );
  return (
    <>
      <PageHero
        eyebrow="Government directory"
        title="Know who serves, and where to reach the right office."
        description="Search source-linked leadership profiles, office contacts, and separately identified emergency and assistance numbers."
      />
      <section className="section container">
        <div
          className="tabs"
          role="tablist"
          aria-label="Government directory views"
        >
          {(
            [
              ["officials", "Officials"],
              ["records", "Published measures"],
              ["offices", "Offices"],
              ["hotlines", "Hotlines"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              role="tab"
              aria-selected={tab === value}
              onClick={() => setParams({ tab: value })}
            >
              {label}
            </button>
          ))}
        </div>
        {tab !== "records" && (
          <label className="directory-search">
            <span className="sr-only">Search directory</span>
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${tab}`}
            />
          </label>
        )}
        {tab === "records" ? (
          <>
            <SectionHeading
              eyebrow="Ordinances, executive orders, and memoranda"
              title="Published measures by the responsible institution"
            >
              Ordinances are legislative acts of the Sangguniang Panlungsod.
              Executive orders are mayoral office issuances. A memorandum is
              assigned only when the source identifies its issuing authority.
            </SectionHeading>
            <div className="civic-records">
              {civicRecords.map((record) => (
                <article key={record.number}>
                  <div className="record-meta">
                    <span>{record.kind}</span>
                    <span>{record.published}</span>
                    <span>{record.attributionLevel}</span>
                  </div>
                  <h2>{record.number}</h2>
                  <p>{record.title}</p>
                  <strong>{record.body}</strong>
                  <small>{record.attribution}</small>
                  <SourceNote
                    url={record.source.url}
                    date={record.source.verifiedOn}
                  />
                </article>
              ))}
            </div>
            <div className="records-subsection">
              <SectionHeading
                eyebrow="Projects and programs"
                title="Reported implementation status"
              >
                Progress and costs are reproduced from the 2025 Q1 consolidated
                trust-fund report. They are reporting-period values, not live
                completion claims or personal achievements.
              </SectionHeading>
              <div className="project-grid">
                {publicProjects.map((project) => (
                  <article key={project.title}>
                    <div className="project-progress">
                      <strong>{project.reportedProgress}</strong>
                      <span>reported progress</span>
                    </div>
                    <h2>{project.title}</h2>
                    <p>{project.location}</p>
                    <dl>
                      <div>
                        <dt>Total cost</dt>
                        <dd>
                          {new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                          }).format(project.totalCost)}
                        </dd>
                      </div>
                      <div>
                        <dt>Cost incurred</dt>
                        <dd>
                          {new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                          }).format(project.costIncurred)}
                        </dd>
                      </div>
                    </dl>
                    <small>
                      {project.status} · {project.period}
                    </small>
                    <SourceNote
                      url={project.source.url}
                      label="Official project report"
                      date={project.source.verifiedOn}
                    />
                  </article>
                ))}
              </div>
            </div>
            <div className="records-subsection">
              <SectionHeading
                eyebrow="Achievements and awards"
                title="Verified recognition, with the recipient scope preserved"
              >
                City-level recognition and institutional initiatives are not
                presented as personal awards for elected officials.
              </SectionHeading>
              <div className="highlight-grid">
                {governanceHighlights.map((item) => (
                  <article key={item.title}>
                    <Award />
                    <span>
                      {item.category} · {item.year}
                    </span>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                    <SourceNote
                      url={item.source.url}
                      label={item.source.label}
                      date={item.source.verifiedOn}
                    />
                  </article>
                ))}
              </div>
            </div>
          </>
        ) : tab === "officials" ? (
          <>
            <div className="data-notice">
              <CircleAlert />
              <div>
                <strong>Click any leader to inspect the verified record</strong>
                <p>
                  Every profile links to an official City Government page and a
                  clearly labeled published contact route. City ordinances are
                  not assigned to an individual councilor unless the source
                  names that sponsor or author.
                </p>
              </div>
            </div>
            <div className="people-grid">
              {visibleOfficials.map((official) => {
                const id = officialId(official.name);
                const expanded = openOfficial === id;
                const officeRecords =
                  official.role === "City Mayor"
                    ? civicRecords.filter(
                        (record) => record.attributionLevel === "office",
                      )
                    : [];
                const sharedContact =
                  official.office.scope === "Shared legislative-office routing";
                return (
                  <article
                    id={`official-${id}`}
                    className={expanded ? "expanded" : ""}
                    key={official.name}
                  >
                    <div className="official-summary">
                      <div className="avatar" aria-hidden="true">
                        {official.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <span>{official.group}</span>
                      <h2>{official.name}</h2>
                      <p>{official.role}</p>
                      <button
                        className="leader-toggle"
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={`leader-details-${id}`}
                        onClick={() => toggleOfficial(official.name)}
                      >
                        View verified details <ChevronDown />
                      </button>
                    </div>
                    <div
                      id={`leader-details-${id}`}
                      className={`leader-reveal ${expanded ? "is-open" : ""}`}
                      aria-hidden={!expanded}
                    >
                      <div className="leader-reveal-inner">
                        <div className="leader-details">
                          <div className="leader-office">
                            <span>{official.office.scope}</span>
                            <h3>{official.office.name}</h3>
                            {sharedContact && (
                              <p className="contact-scope-note">
                                <CircleAlert />
                                No individual phone or email is published on
                                this official’s City Government profile. The
                                contact below routes inquiries through the
                                shared legislative office.
                              </p>
                            )}
                            <p>
                              <MapPin />
                              {official.office.address}
                            </p>
                            <a
                              href={`tel:${telephoneHref(official.office.phone)}`}
                            >
                              <Phone />
                              {official.office.phone}
                            </a>
                            {official.office.email ? (
                              <a href={`mailto:${official.office.email}`}>
                                <Mail />
                                {official.office.email}
                              </a>
                            ) : (
                              <span className="contact-unavailable">
                                <Mail />
                                No direct email published
                              </span>
                            )}
                            <a
                              href={official.office.source.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Verify published contact <ExternalLink />
                            </a>
                          </div>
                          {(official.chairmanships?.length ||
                            official.committeeMemberships?.length) && (
                            <div className="leader-committees">
                              <span>Published committee assignments</span>
                              {official.chairmanships?.length && (
                                <div>
                                  <strong>Chairmanship</strong>
                                  <ul>
                                    {official.chairmanships.map((committee) => (
                                      <li key={committee}>{committee}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {official.committeeMemberships?.length && (
                                <div>
                                  <strong>Member committees</strong>
                                  <ul>
                                    {official.committeeMemberships.map(
                                      (committee) => (
                                        <li key={committee}>{committee}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}
                              <a
                                href={official.source.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Verify committee assignments <ExternalLink />
                              </a>
                            </div>
                          )}
                          <div className="leader-records">
                            <span>Published record coverage</span>
                            {officeRecords.length ? (
                              <>
                                <strong>
                                  {officeRecords.length} mayoral office
                                  issuances indexed
                                </strong>
                                <ul>
                                  {officeRecords.map((record) => (
                                    <li key={record.number}>
                                      <a
                                        href={record.source.url}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        <b>{record.number}</b>
                                        {record.title}
                                        <ExternalLink />
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            ) : (
                              <>
                                <strong>
                                  No individually attributed measure found
                                </strong>
                                <p>
                                  The verified listings publish council measures
                                  at the Sangguniang Panlungsod level and do not
                                  name this official as sponsor or author.
                                </p>
                                <Link to="/government?tab=records">
                                  Review institutional measures <ArrowRight />
                                </Link>
                              </>
                            )}
                            <p className="award-status">
                              <Award />
                              No personal award is claimed because no verified
                              source reviewed names this official as the
                              individual recipient.
                            </p>
                          </div>
                          <div className="leader-sources">
                            <a
                              href={official.source.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open official profile <ExternalLink />
                            </a>
                            <small>Sources reviewed {VERIFIED_ON}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="directory-list">
            {visibleOffices.map((office) => (
              <article key={office.name}>
                <div className="office-symbol">
                  {office.emergency ? <Siren /> : <Building2 />}
                </div>
                <div>
                  <span>
                    {office.emergency
                      ? "Emergency / assistance contact"
                      : "City office"}
                  </span>
                  <h2>{office.name}</h2>
                </div>
                <div className="contact-actions">
                  <a href={`tel:${telephoneHref(office.phone)}`}>
                    <Phone />
                    {office.phone}
                  </a>
                  <a href={`mailto:${office.email}`}>
                    <Mail />
                    {office.email}
                  </a>
                </div>
                <SourceNote
                  url={office.source.url}
                  date={office.source.verifiedOn}
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function BarangaysPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.toLowerCase());
  const visible = barangayMicrosites.filter((item) =>
    `${item.name} ${item.punongBarangay} ${item.classification}`
      .toLowerCase()
      .includes(deferredQuery),
  );
  return (
    <>
      <PageHero
        eyebrow="46 barangays"
        title="Every barangay, with its publicly listed leader."
        description="Barangay names come from the City Government directory. Punong Barangay names and available public contact fields come from the DILG Barangay Officials Directory."
      />
      <section className="section container">
        <div className="data-notice barangay-contact-notice">
          <CircleAlert />
          <div>
            <strong>Public contact data is shown as published</strong>
            <p>
              Incomplete or malformed DILG contact entries are treated as
              unavailable. Contact the City Government or DILG Malaybalay office
              when a barangay has no complete public number here.
            </p>
          </div>
        </div>
        <label className="directory-search">
          <span className="sr-only">Search barangays</span>
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a barangay"
          />
        </label>
        <div className="barangay-grid">
          {visible.map((barangay) => (
            <article key={barangay.name}>
              <div className="barangay-card-heading">
                <img
                  src={barangay.logo}
                  width="56"
                  height="56"
                  loading="lazy"
                  alt={`${barangay.name} mark published by the City Government`}
                />
                <span>
                  Malaybalay City
                  <small>{barangay.classification} barangay</small>
                </span>
              </div>
              <h2>{barangay.name}</h2>
              <p className="barangay-stat">
                <strong>{barangay.population.toLocaleString("en-PH")}</strong>
                <span>2024 POPCEN population</span>
              </p>
              <p className="barangay-leader">
                <span>Punong Barangay</span>
                <strong>{barangay.punongBarangay}</strong>
              </p>
              <div className="barangay-contacts">
                {barangay.phone && (
                  <a href={`tel:${telephoneHref(barangay.phone)}`}>
                    <Phone />
                    {barangay.phone}
                  </a>
                )}
                {barangay.email && (
                  <a href={`mailto:${barangay.email}`}>
                    <Mail />
                    {barangay.email}
                  </a>
                )}
                {!barangay.phone && !barangay.email && (
                  <span>
                    <CircleAlert />
                    No complete public contact listed
                  </span>
                )}
              </div>
              <Link
                className="barangay-profile-link"
                to={`/barangays/${barangay.slug}`}
              >
                Open barangay profile <ArrowRight />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function BarangaySourceLink({
  source,
}: {
  source: BarangayMicrositeProfile["psgcSource"];
}) {
  return (
    <a href={source.url} target="_blank" rel="noreferrer">
      {source.label} <ExternalLink />
    </a>
  );
}

function BarangayProfilePage({ slugOverride }: { slugOverride?: string }) {
  const { slug: routeSlug } = useParams();
  const profile = barangayMicrositeBySlug.get(slugOverride ?? routeSlug ?? "");
  const emergencyContacts = departments.filter((office) => office.emergency);

  useEffect(() => {
    if (!profile) return;
    const previousTitle = document.title;
    document.title = `${profile.name} — BetterMC Barangay Profile`;
    return () => {
      document.title = previousTitle;
    };
  }, [profile]);

  if (!profile) return <NotFoundPage />;

  return (
    <div className="barangay-site">
      <section className="barangay-hero">
        <div className="barangay-hero-image" aria-hidden="true" />
        <div className="container barangay-hero-content">
          <div className="barangay-brand-lockup">
            <div className="barangay-logo-frame">
              <img
                src={profile.logo}
                alt={`${profile.name} mark published by the City Government`}
              />
            </div>
            <div className="barangay-bettermc-mark">
              <img src="/bettermc1.png" alt="" aria-hidden="true" />
              <span>Barangay profile by BetterMC</span>
            </div>
          </div>
          <div className="barangay-hero-copy">
            <span>{profile.classification} barangay · Malaybalay City</span>
            <h1>{profile.name}</h1>
            <p>{profile.description}</p>
            <div className="barangay-hero-actions">
              {profile.phone && (
                <a
                  className="button primary"
                  href={`tel:${telephoneHref(profile.phone)}`}
                >
                  <Phone /> Call barangay contact
                </a>
              )}
              <a className="button secondary" href="#emergency">
                <Siren /> Emergency numbers
              </a>
            </div>
          </div>
          <dl className="barangay-facts">
            <div>
              <dt>Population</dt>
              <dd>
                {profile.population.toLocaleString("en-PH")}
                <small>2024 POPCEN</small>
              </dd>
            </div>
            <div>
              <dt>PSGC code</dt>
              <dd>{profile.code}</dd>
            </div>
            <div>
              <dt>Punong Barangay</dt>
              <dd>{profile.punongBarangay}</dd>
            </div>
          </dl>
        </div>
      </section>

      <nav
        className="barangay-local-nav"
        aria-label={`${profile.name} page sections`}
      >
        <div className="container">
          <a href="#about">About</a>
          <a href="#leadership">Leadership</a>
          <a href="#committees">Committees</a>
          <a href="#services">Services</a>
          <a href="#contacts">Contacts</a>
          <a href="#emergency">Emergency</a>
        </div>
      </nav>

      <div className="barangay-profile-main container">
        <section id="about" className="barangay-profile-section barangay-about">
          <div>
            <span className="eyebrow">About the barangay</span>
            <h2>Source-backed community profile</h2>
            <p>{profile.description}</p>
            <p>
              The population and classification are official PSA records.
              BetterMC does not publish an area figure or boundary map here
              because no surveyed barangay boundary was verified for this
              profile.
            </p>
          </div>
          <aside className="barangay-source-card">
            <ShieldCheck />
            <strong>Where this information comes from</strong>
            <BarangaySourceLink source={profile.psgcSource} />
            <BarangaySourceLink source={profile.leadershipSource} />
            <BarangaySourceLink source={profile.logoSource} />
            <small>Sources reviewed {VERIFIED_ON}</small>
          </aside>
        </section>

        <section id="leadership" className="barangay-profile-section">
          <SectionHeading
            eyebrow="Current published leadership"
            title="Who leads the barangay"
          >
            Only roles and names found in the reviewed public directory are
            presented as verified.
          </SectionHeading>
          <div className="barangay-leadership-grid">
            <article className="barangay-captain-card">
              <Users />
              <span>Punong Barangay</span>
              <h3>{profile.punongBarangay}</h3>
              <p>Leader listed in the DILG Barangay Officials Directory.</p>
              <BarangaySourceLink source={profile.leadershipSource} />
            </article>
            <article className="barangay-data-gap">
              <CircleAlert />
              <div>
                <span>Barangay council roster</span>
                <h3>Complete roster not published in the reviewed sources</h3>
                <p>
                  BetterMC will add kagawad, secretary, treasurer, SK, and
                  committee assignments when an attributable current roster is
                  available.
                </p>
                <Link to="/participate">
                  Submit an official source <ArrowRight />
                </Link>
              </div>
            </article>
          </div>
        </section>

        <section id="committees" className="barangay-profile-section">
          <SectionHeading
            eyebrow="Committee transparency"
            title="Service areas awaiting named assignments"
          >
            These topics help residents route concerns. They are not presented
            as this barangay’s verified committee roster because chair
            assignments were not published in the sources reviewed.
          </SectionHeading>
          <div className="barangay-committee-grid">
            {profile.committeeAreas.map((committee) => (
              <article key={committee}>
                <Check />
                <div>
                  <h3>{committee}</h3>
                  <p>
                    Chair and members not yet published in a verified source.
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="services" className="barangay-profile-section">
          <SectionHeading
            eyebrow="Resident guide"
            title="Services to ask about at the barangay hall"
          >
            Availability, documents, fees, and schedules can vary. Confirm
            directly with the barangay before travelling.
          </SectionHeading>
          <div className="barangay-services-grid">
            {profile.serviceAreas.map((service) => (
              <article key={service.title}>
                <BookOpen />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="contacts"
          className="barangay-profile-section barangay-contact-section"
        >
          <div>
            <span className="eyebrow">Contact the barangay</span>
            <h2>Use the published public channels</h2>
            <p>
              These details are reproduced from the reviewed public directory.
              Personal or unverified numbers are not added.
            </p>
          </div>
          <div className="barangay-contact-card">
            <h3>{profile.name} barangay contact</h3>
            {profile.phone ? (
              <a href={`tel:${telephoneHref(profile.phone)}`}>
                <Phone />
                {profile.phone}
              </a>
            ) : (
              <span>
                <CircleAlert />
                No complete public phone listed
              </span>
            )}
            {profile.email ? (
              <a href={`mailto:${profile.email}`}>
                <Mail />
                {profile.email}
              </a>
            ) : (
              <span>
                <CircleAlert />
                No public email listed
              </span>
            )}
            <BarangaySourceLink source={profile.leadershipSource} />
          </div>
        </section>

        <section
          id="emergency"
          className="barangay-profile-section barangay-emergency-section"
        >
          <SectionHeading
            eyebrow="Citywide emergency contacts"
            title="Urgent help across Malaybalay"
          >
            Call the appropriate response office. For immediate danger, clearly
            state your barangay, landmark, and callback number.
          </SectionHeading>
          <div className="barangay-emergency-grid">
            {emergencyContacts.map((office) => (
              <article key={office.name}>
                <HeartPulse />
                <div>
                  <h3>{office.name}</h3>
                  <a href={`tel:${telephoneHref(office.phone)}`}>
                    {office.phone}
                  </a>
                  {office.email && (
                    <a href={`mailto:${office.email}`}>{office.email}</a>
                  )}
                </div>
              </article>
            ))}
          </div>
          <SourceNote
            url={emergencyContacts[0].source.url}
            label="Official City Government contact directory"
            date={VERIFIED_ON}
          />
        </section>

        <aside className="barangay-domain-note">
          <Database />
          <div>
            <strong>Subdomain-ready profile</strong>
            <p>
              Requested address: <code>{profile.requestedSubdomain}</code>. The
              application resolves barangay subdomains when wildcard DNS and
              hosting are connected.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Public services"
        title="Start with the official service standard."
        description="Open the City Government’s Citizen’s Charter, protocol manual, and official forms. BetterMC does not replace an application or official transaction channel."
      />
      <section className="section container">
        <div className="service-grid">
          {services.map((service) => (
            <article key={service.title}>
              <BookOpen />
              <span>{service.office}</span>
              <h2>{service.title}</h2>
              <p>{service.description}</p>
              <a
                className="button secondary"
                href={service.url}
                target="_blank"
                rel="noreferrer"
              >
                Open official resource <ExternalLink />
              </a>
              <small>Source checked {service.verifiedOn}</small>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

const feedbackSchema = z.object({
  category: z.enum([
    "correction",
    "broken-link",
    "document-request",
    "website-feedback",
  ]),
  subject: z
    .string()
    .trim()
    .min(5, "Please enter a specific subject.")
    .max(120),
  details: z
    .string()
    .trim()
    .min(20, "Please provide at least 20 characters of context.")
    .max(3000),
  sourceUrl: z
    .string()
    .trim()
    .url("Enter a complete URL, including https://")
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .or(z.literal("")),
  website: z.string().max(0),
});

type FeedbackState = "idle" | "submitting" | "success" | "error";
function ParticipatePage() {
  const [state, setState] = useState<FeedbackState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState("");
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setServerMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const parsed = feedbackSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      setState("error");
      return;
    }
    setState("submitting");
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(result.message ?? "The submission could not be saved.");
      setState("success");
      setServerMessage(result.message ?? "Your submission was received.");
      event.currentTarget.reset();
    } catch (error) {
      setState("error");
      setServerMessage(
        error instanceof Error
          ? error.message
          : "The submission could not be saved.",
      );
    }
  }
  return (
    <>
      <PageHero
        eyebrow="Community participation"
        title="Improve the public record with evidence."
        description="Suggest a correction, report a broken official link, or ask the BetterMC research team to locate a public document. Submissions are reviewed before publication."
      />
      <section className="section container participation-grid">
        <div>
          <SectionHeading
            eyebrow="How review works"
            title="Community input is not published automatically."
          />
          <ol className="process-list">
            <li>
              <span>1</span>
              <div>
                <strong>Submit context and a source</strong>
                <p>Give reviewers enough detail to reproduce the issue.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Independent review</strong>
                <p>
                  A moderator checks the claim against an attributable public
                  source.
                </p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Correction history</strong>
                <p>Accepted changes retain their source and review date.</p>
              </div>
            </li>
          </ol>
        </div>
        <form className="feedback-form" onSubmit={handleSubmit} noValidate>
          <h2>Submit to the correction desk</h2>
          {serverMessage && (
            <div className={`form-message ${state}`} role="status">
              {state === "success" ? <Check /> : <CircleAlert />}
              {serverMessage}
            </div>
          )}
          <label>
            Request type
            <select name="category" defaultValue="correction">
              <option value="correction">Suggest a correction</option>
              <option value="broken-link">Report a broken link</option>
              <option value="document-request">
                Suggest a public document
              </option>
              <option value="website-feedback">Website feedback</option>
            </select>
          </label>
          <label>
            Subject
            <input
              name="subject"
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={errors.subject ? "subject-error" : undefined}
            />
            {errors.subject && (
              <small id="subject-error" className="field-error">
                {errors.subject}
              </small>
            )}
          </label>
          <label>
            Details
            <textarea
              name="details"
              rows={6}
              aria-invalid={Boolean(errors.details)}
              aria-describedby={errors.details ? "details-error" : undefined}
            />
            {errors.details && (
              <small id="details-error" className="field-error">
                {errors.details}
              </small>
            )}
          </label>
          <label>
            Supporting source URL <span>(recommended)</span>
            <input
              name="sourceUrl"
              type="url"
              placeholder="https://…"
              aria-invalid={Boolean(errors.sourceUrl)}
            />
            {errors.sourceUrl && (
              <small className="field-error">{errors.sourceUrl}</small>
            )}
          </label>
          <label>
            Email <span>(optional, never published)</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && (
              <small className="field-error">{errors.email}</small>
            )}
          </label>
          <label className="honeypot" aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <button className="button primary" disabled={state === "submitting"}>
            {state === "submitting" ? "Sending…" : "Send for review"}
            <ArrowRight />
          </button>
          <p className="privacy-note">
            Do not submit confidential, sensitive, or private personal
            information.
          </p>
        </form>
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About BetterMC"
        title="Independent by design. Evidence-led by default."
        description="BetterMC helps residents navigate public information. It does not represent the City Government and does not make legal-compliance findings."
      />
      <section className="section container prose">
        <h2>Editorial and verification policy</h2>
        <p>
          Government-related factual records must identify an inspectable source
          and a review date. Official city sources are preferred, followed by
          national government sources such as COA, DBM, DILG, PSA, PhilGEPS and
          DPWH.
        </p>
        <h2>What “source listed” means</h2>
        <p>
          It means the official Full Disclosure page displayed a record title
          during the review. It does not confirm completeness of the file,
          validate every figure in a PDF, or establish legal compliance.
        </p>
        <h2>Reuse and attribution</h2>
        <p>
          The architecture was informed by the CC0 BetterLosBaños project and
          the BetterGov LGU ecosystem. Malaybalay-specific data is independently
          compiled from its cited sources.
        </p>
        <SourceNote
          url="https://github.com/BetterLosBanos/betterlb"
          label="BetterLosBaños technical reference"
        />
      </section>
    </>
  );
}

function NotFoundPage() {
  return (
    <section className="empty-page container">
      <span>404</span>
      <h1>This page is not in the public record.</h1>
      <p>Return to the homepage or search the current directory.</p>
      <Link className="button primary" to="/">
        Return home
      </Link>
    </section>
  );
}

export default function App() {
  const subdomainSlug =
    typeof window === "undefined"
      ? null
      : barangaySlugFromHostname(window.location.hostname);
  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            subdomainSlug ? (
              <BarangayProfilePage slugOverride={subdomainSlug} />
            ) : (
              <HomePage />
            )
          }
        />
        <Route path="/transparency" element={<TransparencyPage />} />
        <Route path="/government" element={<GovernmentPage />} />
        <Route path="/barangays" element={<BarangaysPage />} />
        <Route path="/barangays/:slug" element={<BarangayProfilePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/participate" element={<ParticipatePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
