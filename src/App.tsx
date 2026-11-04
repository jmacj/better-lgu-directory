import { FormEvent, ReactNode, useDeferredValue, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, Award, BarChart3, BookOpen, Building2, Check, ChevronLeft, ChevronRight, CircleAlert, Clock3,
  Database, ExternalLink, FileCheck2, FileText, Landmark, Mail, Menu, Phone,
  ReceiptText, Search, ShieldCheck, Siren, TrendingUp, X,
} from 'lucide-react'
import { Link, NavLink, Route, Routes, useLocation, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { barangayProfiles, cityGallery, civicRecords, departments, disclosures, financialSnapshot, governanceHighlights, officials, publicProjects, searchableRecords, services, VERIFIED_ON } from './data'

const navItems = [
  { label: 'Transparency', to: '/transparency' },
  { label: 'Government', to: '/government' },
  { label: 'Barangays', to: '/barangays' },
  { label: 'Public services', to: '/services' },
  { label: 'Participate', to: '/participate' },
]

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="BetterMC home">
      <span className="brand-assets" aria-hidden="true"><span className="brand-main" /><span className="brand-wordmark" /></span>
      <span className="brand-title"><strong>Better Malaybalay City</strong><small>Independent public information</small></span>
    </Link>
  )
}

function MalaybalayClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const date = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(now)
  const time = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(now)
  return <div className="city-clock" aria-label={`Malaybalay time: ${date}, ${time}`}><Clock3 aria-hidden="true" /><span><small>Malaybalay time · Asia/Manila</small><strong><time dateTime={now.toISOString()}>{time}</time><em>{date}</em></strong></span></div>
}

function CityGallery() {
  const [active, setActive] = useState(0)
  const selected = cityGallery[active]
  const show = (index: number) => setActive((index + cityGallery.length) % cityGallery.length)
  return <section className="city-gallery" aria-label="Malaybalay city gallery">
    <div className="gallery-stage">
      <img src={selected.image} alt={selected.title} width="768" height="576" loading="eager" />
      <div className="gallery-scrim" />
      <div className="gallery-caption"><span>Discover Malaybalay</span><h2>{selected.title}</h2><p>{selected.description}</p><a href={selected.source.url} target="_blank" rel="noreferrer">Official image source <ExternalLink /></a></div>
      <div className="gallery-controls"><button type="button" onClick={() => show(active - 1)} aria-label="Previous image"><ChevronLeft /></button><span aria-live="polite">{active + 1} / {cityGallery.length}</span><button type="button" onClick={() => show(active + 1)} aria-label="Next image"><ChevronRight /></button></div>
    </div>
    <div className="gallery-thumbnails" aria-label="Choose a gallery image">{cityGallery.map((item, index) => <button key={item.image} type="button" className={index === active ? 'active' : ''} aria-label={`Show ${item.title}`} aria-pressed={index === active} onClick={() => show(index)}><img src={item.image} alt="" width="180" height="120" loading="lazy" /><span>{item.title}</span></button>)}</div>
  </section>
}

function FinancialBreakdown() {
  const currency = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(value)
  const incomeMax = financialSnapshot.incomeBreakdown[0].amount
  const spendingMax = financialSnapshot.expenditureBreakdown[0].amount
  return <div className="financial-detail">
    <div className="breakdown-panel"><div className="breakdown-title"><h3>Operating income by source</h3><strong>{currency(financialSnapshot.currentOperatingIncome)}</strong></div><div className="money-rows">{financialSnapshot.incomeBreakdown.map((row) => <div className="money-row" key={row.label}><div><span>{row.label}</span><strong>{currency(row.amount)}</strong></div><div className="amount-track" aria-hidden="true"><span style={{ width: `${Math.max(1, row.amount / incomeMax * 100)}%` }} /></div></div>)}</div></div>
    <div className="breakdown-panel"><div className="breakdown-title"><h3>Operating spending by service area</h3><strong>{currency(financialSnapshot.currentOperatingExpenditures)}</strong></div><div className="money-rows">{financialSnapshot.expenditureBreakdown.map((row) => <div className="money-row" key={row.label}><div><span>{row.label}</span><strong>{currency(row.amount)}</strong></div><div className="amount-track" aria-hidden="true"><span style={{ width: `${Math.max(1, row.amount / spendingMax * 100)}%` }} /></div></div>)}</div></div>
    <div className="cash-panel"><div><span>Beginning cash balance</span><strong>{currency(financialSnapshot.beginningCashBalance)}</strong></div><ArrowRight aria-hidden="true" /><div><span>Net increase in funds</span><strong>{currency(financialSnapshot.netIncreaseInFunds)}</strong></div><ArrowRight aria-hidden="true" /><div><span>Ending cash balance</span><strong>{currency(financialSnapshot.endingCashBalance)}</strong></div></div>
    <div className="non-operating"><h3>Other reported financial movements</h3><div>{financialSnapshot.nonOperatingBreakdown.map((row) => <p key={row.label}><span>{row.label}</span><strong>{currency(row.amount)}</strong></p>)}<p><span>Prior-year accounts payable paid</span><strong>{currency(financialSnapshot.priorYearAccountsPayable)}</strong></p><p><span>Continuing appropriation</span><strong>{currency(financialSnapshot.continuingAppropriation)}</strong></p></div></div>
    <p className="finance-method"><CircleAlert />Amounts are reported actuals for 2025 Q2. “Net operating balance,” “net increase in funds,” and “ending cash balance” are different accounting measures and are not interchangeable with savings.</p>
  </div>
}

function Header() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <div className="independence-bar">Independent public information platform <span>Not an official City Government website</span></div>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item) => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}
          </nav>
          <button className="menu-button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && <nav className="mobile-nav container" aria-label="Mobile navigation">
          {navItems.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>{item.label}<ArrowRight /></NavLink>)}
        </nav>}
      </header>
    </>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div><Brand /><p>Public information should be accessible. Public spending should be understandable.</p><MalaybalayClock /></div>
        <div><h2>Platform</h2><Link to="/about">About & methodology</Link><Link to="/transparency">Data sources</Link><a href="https://github.com/lordzxxxx/bettermalaybalay" target="_blank" rel="noreferrer">Contribute on GitHub</a></div>
        <div><h2>Official sources</h2><a href="https://sakata.malaybalaycity.gov.ph/" target="_blank" rel="noreferrer">Malaybalay City Government</a><a href="https://lgu.bettergov.ph/" target="_blank" rel="noreferrer">BetterGov LGU directory</a></div>
      </div>
      <div className="container disclaimer">BetterMC is an independent public information platform. It is not affiliated with, endorsed by, or operated by the City Government of Malaybalay. For official transactions and certifications, contact the responsible government office directly.</div>
    </footer>
  )
}

function Layout({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      window.requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }))
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return <><Header /><main id="main">{children}</main><Footer /></>
}

function SourceNote({ url, label = 'Official source', date = VERIFIED_ON }: { url: string, label?: string, date?: string }) {
  return <div className="source-note"><ShieldCheck aria-hidden="true" /><span><a href={url} target="_blank" rel="noreferrer">{label}<ExternalLink aria-hidden="true" /></a><small>Checked {date}</small></span></div>
}

function SectionHeading({ eyebrow, title, children }: { eyebrow: string, title: string, children?: ReactNode }) {
  return <div className="section-heading"><span>{eyebrow}</span><h2>{title}</h2>{children && <p>{children}</p>}</div>
}

function GlobalSearch() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const results = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase()
    if (!value) return []
    return searchableRecords.filter((record) => `${record.title} ${record.detail} ${record.type}`.toLowerCase().includes(value)).slice(0, 7)
  }, [deferredQuery])
  return <div className="global-search">
    <Search aria-hidden="true" />
    <label htmlFor="site-search" className="sr-only">Search officials, offices, barangays and services</label>
    <input id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search officials, offices, barangays, services…" autoComplete="off" />
    {query && <div className="search-results" role="listbox" aria-label="Search results">
      {results.length ? results.map((result) => <Link key={`${result.type}-${result.title}`} to={result.href} role="option"><small>{result.type}</small><span>{result.title}<em>{result.detail}</em></span><ArrowRight /></Link>) : <p>No matching verified record found.</p>}
    </div>}
  </div>
}

function HomePage() {
  const availableDisclosures = disclosures.filter((item) => item.status === 'Source listed').length
  const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', notation: 'compact', maximumFractionDigits: 3 }).format(value)
  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1>Malaybalay public information, <em>made clear.</em></h1>
          <p>Understand city finances, public records, leadership, barangays, and services through a source-linked platform built for accountability.</p>
          <div className="hero-actions"><Link className="button primary" to="/transparency">Explore transparency <ArrowRight /></Link><Link className="button secondary" to="/government">Find an office</Link></div>
          <div className="hero-verification"><ShieldCheck /><span>Records show their original source and verification date.<strong>Last research review: November 4, 2026</strong></span></div>
        </div>
        <div className="hero-panel glass-panel">
          <div className="hero-brand"><span className="hero-brand-main" /><span className="hero-brand-wordmark" /><p>Better information. Better accountability. Better Malaybalay.</p></div>
          <div className="panel-top"><span>Search public information</span><kbd>⌘ K</kbd></div>
          <GlobalSearch />
          <div className="quick-grid">
            <Link to="/transparency"><FileText /><span>Full disclosure<small>2022–2026 catalog</small></span></Link>
            <Link to="/government"><Landmark /><span>Government<small>Officials & offices</small></span></Link>
            <Link to="/services"><BookOpen /><span>Public services<small>Charter & forms</small></span></Link>
            <Link to="/government?tab=hotlines"><Siren /><span>Emergency contacts<small>Tap to call</small></span></Link>
          </div>
        </div>
      </div>
    </section>
    <section className="section container gallery-section"><SectionHeading eyebrow="The city in context" title="A real place behind every public record">Official tourism imagery adds geographic and cultural context without distracting from the records residents came to inspect.</SectionHeading><CityGallery /></section>
    <section className="metrics-strip">
      <div className="container metrics-grid">
        <div><strong>{availableDisclosures}</strong><span>source-listed disclosure entries</span></div>
        <div><strong>{departments.length}</strong><span>offices and public contacts</span></div>
        <div><strong>{officials.length}</strong><span>elected and sectoral officials</span></div>
        <div><strong>{barangayProfiles.length}</strong><span>barangays with DILG-listed leaders</span></div>
      </div>
      <p className="metric-caption container">Counts reflect records in this portal, not a legal-compliance assessment.</p>
    </section>
    <section className="section container finance-section" id="financial-snapshot">
      <div className="finance-heading"><SectionHeading eyebrow="Financial snapshot" title="See the numbers, and what they actually mean">Figures below are transcribed from the City Government’s 2025 Q2 Statement of Receipts and Expenditures. They are not estimates.</SectionHeading><SourceNote url={financialSnapshot.source.url} label={financialSnapshot.source.label} /></div>
      <div className="finance-grid">
        <article><TrendingUp /><span>Current operating income</span><strong>{money(financialSnapshot.currentOperatingIncome)}</strong><small>{financialSnapshot.period} reported actual</small></article>
        <article><ReceiptText /><span>Current operating expenditures</span><strong>{money(financialSnapshot.currentOperatingExpenditures)}</strong><small>{financialSnapshot.period} reported actual</small></article>
        <article><BarChart3 /><span>Net operating balance</span><strong>{money(financialSnapshot.netOperatingBalance)}</strong><small>Income less current operating expenditures</small></article>
        <article className="savings-card"><ShieldCheck /><span>Total savings</span><strong>Not separately reported</strong><small>The source reports a net operating balance, not a distinct “savings” figure.</small></article>
      </div>
      <FinancialBreakdown />
    </section>
    <section className="section container records-preview-section">
      <SectionHeading eyebrow="Legislative record" title="Published measures, without invented attribution">See ordinances and other measures from verified public listings. When an individual author or sponsor is not published, BetterMC says so.</SectionHeading>
      <div className="records-preview">{civicRecords.slice(0, 3).map((record) => <article key={record.number}><span>{record.kind} · {new Date(record.published).getFullYear()}</span><h3>{record.number}</h3><p>{record.title}</p><small>{record.body}</small><a href={record.source.url} target="_blank" rel="noreferrer">Open official listing <ExternalLink /></a></article>)}</div>
      <Link className="button secondary centered" to="/government?tab=records">View published measures <ArrowRight /></Link>
    </section>
    <section className="section container">
      <SectionHeading eyebrow="Transparency center" title="Start with the original record">BetterMC organizes official listings without turning allocations into claims of spending or missing files into claims of noncompliance.</SectionHeading>
      <div className="feature-grid">
        <Link className="feature-card feature-primary" to="/transparency"><span className="icon-box"><FileCheck2 /></span><small>Full disclosure portal</small><h3>Browse public documents by year, quarter, and category.</h3><p>Source-listed financial, procurement, utilization, staffing and GAD records.</p><span className="text-link">Browse records <ArrowRight /></span></Link>
        <div className="feature-stack">
          <a className="feature-card" href="/#financial-snapshot"><BarChart3 /><div><small>Financial breakdown</small><h3>2025 Q2 figures with context</h3><p>Review income sources, service-area spending, non-operating expenditures, and cash movement from the original statement.</p></div></a>
          <Link className="feature-card" to="/participate"><Database /><div><small>Correction desk</small><h3>Help improve the record</h3><p>Submit a source-backed correction or report a broken official link.</p></div></Link>
        </div>
      </div>
    </section>
    <section className="section soft-section">
      <div className="container">
        <SectionHeading eyebrow="Public directory" title="The right office, without the runaround">Direct contact details are reproduced from the City Government’s current contact directory and retain the original source.</SectionHeading>
        <div className="office-preview">
          {departments.slice(0, 6).map((office) => <article key={office.name}><Building2 /><h3>{office.name}</h3><a href={`tel:${office.phone?.replace(/[^+\d]/g, '')}`}><Phone />{office.phone}</a><a href={`mailto:${office.email}`}><Mail />{office.email}</a></article>)}
        </div>
        <Link className="button secondary centered" to="/government?tab=offices">View all offices <ArrowRight /></Link>
      </div>
    </section>
  </>
}

function PageHero({ eyebrow, title, description, children }: { eyebrow: string, title: string, description: string, children?: ReactNode }) {
  return <section className="page-hero"><div className="container"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p>{children}</div></section>
}

function TransparencyPage() {
  const [params, setParams] = useSearchParams()
  const year = Number(params.get('year') ?? 2026)
  const quarter = params.get('quarter') ?? 'All'
  const category = params.get('category') ?? 'All'
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const rows = disclosures.filter((item) => item.year === year && (quarter === 'All' || item.quarter === quarter) && (category === 'All' || item.category === category) && item.title.toLowerCase().includes(deferredQuery.toLowerCase()))
  const updateParam = (key: string, value: string) => { const next = new URLSearchParams(params); next.set(key, value); setParams(next) }
  return <>
    <PageHero eyebrow="Transparency center" title="Public records, with their context intact." description="Browse the City Government’s Full Disclosure listings. Availability here means a record was listed by the official source; it is not a legal-compliance rating." />
    <section className="section container">
      <div className="data-notice"><CircleAlert /><div><strong>What this catalog can and cannot tell you</strong><p>BetterMC links to the official disclosure source. It does not infer that an appropriation was spent, or that an unlisted record proves noncompliance.</p></div></div>
      <div className="toolbar">
        <label><span>Search records</span><div className="input-wrap"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search document titles" /></div></label>
        <label><span>Fiscal year</span><select value={year} onChange={(event) => updateParam('year', event.target.value)}>{[2026, 2025, 2024, 2023, 2022].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>Quarter</span><select value={quarter} onChange={(event) => updateParam('quarter', event.target.value)}>{['All', 'Annual', 'Q1', 'Q2', 'Q3', 'Q4'].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>Category</span><select value={category} onChange={(event) => updateParam('category', event.target.value)}>{['All', 'Budget', 'Procurement', 'Financial', 'Utilization', 'Staffing', 'GAD'].map((value) => <option key={value}>{value}</option>)}</select></label>
      </div>
      <div className="results-summary"><strong>{rows.length} records</strong><span>Source checked {VERIFIED_ON}</span></div>
      <div className="records-list">
        {rows.map((record) => <article key={`${record.year}-${record.quarter}-${record.title}`}>
          <div className="record-icon"><FileText /></div><div className="record-main"><div className="record-meta"><span>{record.category}</span><span>{record.year}</span><span>{record.quarter}</span></div><h2>{record.title}</h2><p className={record.status.startsWith('Not') ? 'unavailable' : 'available'}>{record.status.startsWith('Not') ? <CircleAlert /> : <Check />}{record.status}</p></div>
          <a className="record-link" href={record.source.url} target="_blank" rel="noreferrer" aria-label={`Open official source for ${record.title}`}>Official source <ExternalLink /></a>
        </article>)}
      </div>
      <SourceNote url="https://sakata.malaybalaycity.gov.ph/full-disclosure/" label="Malaybalay City Full Disclosure" />
    </section>
  </>
}

type GovernmentTab = 'officials' | 'records' | 'offices' | 'hotlines'
function GovernmentPage() {
  const [params, setParams] = useSearchParams()
  const requestedTab = params.get('tab')
  const tab: GovernmentTab = requestedTab === 'records' || requestedTab === 'offices' || requestedTab === 'hotlines' ? requestedTab : 'officials'
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.toLowerCase())
  const visibleOfficials = officials.filter((item) => `${item.name} ${item.role}`.toLowerCase().includes(deferredQuery))
  const visibleOffices = departments.filter((item) => (tab !== 'hotlines' || item.emergency) && `${item.name} ${item.email} ${item.phone}`.toLowerCase().includes(deferredQuery))
  return <>
    <PageHero eyebrow="Government directory" title="Know who serves, and where to reach the right office." description="Search source-linked leadership profiles, office contacts, and separately identified emergency and assistance numbers." />
    <section className="section container">
      <div className="tabs" role="tablist" aria-label="Government directory views">
        {([['officials', 'Officials'], ['records', 'Published measures'], ['offices', 'Offices'], ['hotlines', 'Hotlines']] as const).map(([value, label]) => <button key={value} role="tab" aria-selected={tab === value} onClick={() => setParams({ tab: value })}>{label}</button>)}
      </div>
      {tab !== 'records' && <label className="directory-search"><span className="sr-only">Search directory</span><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${tab}`} /></label>}
      {tab === 'records' ? <><SectionHeading eyebrow="Ordinances and executive orders" title="Published measures by the responsible institution">Ordinances are legislative acts of the Sangguniang Panlungsod. Executive orders are mayoral issuances. Individual sponsors are named only when the verified listing publishes them.</SectionHeading><div className="civic-records">{civicRecords.map((record) => <article key={record.number}><div className="record-meta"><span>{record.kind}</span><span>{record.published}</span></div><h2>{record.number}</h2><p>{record.title}</p><strong>{record.body}</strong><small>{record.attribution}</small><SourceNote url={record.source.url} date={record.source.verifiedOn} /></article>)}</div><div className="records-subsection"><SectionHeading eyebrow="Projects and programs" title="Reported implementation status">Progress and costs are reproduced from the 2025 Q1 consolidated trust-fund report. They are reporting-period values, not live completion claims or personal achievements.</SectionHeading><div className="project-grid">{publicProjects.map((project) => <article key={project.title}><div className="project-progress"><strong>{project.reportedProgress}</strong><span>reported progress</span></div><h2>{project.title}</h2><p>{project.location}</p><dl><div><dt>Total cost</dt><dd>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(project.totalCost)}</dd></div><div><dt>Cost incurred</dt><dd>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(project.costIncurred)}</dd></div></dl><small>{project.status} · {project.period}</small><SourceNote url={project.source.url} label="Official project report" date={project.source.verifiedOn} /></article>)}</div></div><div className="records-subsection"><SectionHeading eyebrow="Achievements and awards" title="Verified recognition, with the recipient scope preserved">City-level recognition and institutional initiatives are not presented as personal awards for elected officials.</SectionHeading><div className="highlight-grid">{governanceHighlights.map((item) => <article key={item.title}><Award /><span>{item.category} · {item.year}</span><h2>{item.title}</h2><p>{item.description}</p><SourceNote url={item.source.url} label={item.source.label} date={item.source.verifiedOn} /></article>)}</div></div></> : tab === 'officials' ? <><div className="data-notice"><CircleAlert /><div><strong>Records are not assigned to individuals without evidence</strong><p>The current official listings identify officeholders but do not consistently publish the individual sponsor for ordinances, a per-official accomplishment ledger, or personal awards. The institutional records tab preserves that distinction.</p></div></div><div className="people-grid">{visibleOfficials.map((official) => <article key={official.name}><div className="avatar" aria-hidden="true">{official.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><span>{official.group}</span><h2>{official.name}</h2><p>{official.role}</p><div className="official-ledger"><span><FileText />{official.role === 'City Mayor' ? 'Mayoral executive issuances indexed separately' : official.group === 'Legislative' || official.group === 'Sectoral' ? 'Council measures indexed at body level' : 'Institutional records indexed separately'}</span><span><Award />No individual award claimed without a named source</span></div><SourceNote url={official.source.url} date={official.source.verifiedOn} /></article>)}</div></> :
        <div className="directory-list">{visibleOffices.map((office) => <article key={office.name}><div className="office-symbol">{office.emergency ? <Siren /> : <Building2 />}</div><div><span>{office.emergency ? 'Emergency / assistance contact' : 'City office'}</span><h2>{office.name}</h2></div><div className="contact-actions"><a href={`tel:${office.phone?.replace(/[^+\d]/g, '')}`}><Phone />{office.phone}</a><a href={`mailto:${office.email}`}><Mail />{office.email}</a></div><SourceNote url={office.source.url} date={office.source.verifiedOn} /></article>)}</div>}
    </section>
  </>
}

function BarangaysPage() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.toLowerCase())
  const visible = barangayProfiles.filter((item) => `${item.name} ${item.punongBarangay}`.toLowerCase().includes(deferredQuery))
  return <>
    <PageHero eyebrow="46 barangays" title="Every barangay, with its publicly listed leader." description="Barangay names come from the City Government directory. Punong Barangay names and available public contact fields come from the DILG Barangay Officials Directory." />
    <section className="section container">
      <div className="data-notice barangay-contact-notice"><CircleAlert /><div><strong>Public contact data is shown as published</strong><p>Incomplete or malformed DILG contact entries are treated as unavailable. Contact the City Government or DILG Malaybalay office when a barangay has no complete public number here.</p></div></div>
      <label className="directory-search"><span className="sr-only">Search barangays</span><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a barangay" /></label>
      <div className="barangay-grid">{visible.map((barangay) => <article key={barangay.name}><div><Landmark /><span>Malaybalay City</span></div><h2>{barangay.name}</h2><p className="barangay-leader"><span>Punong Barangay</span><strong>{barangay.punongBarangay}</strong></p><div className="barangay-contacts">{barangay.phone && <a href={`tel:${barangay.phone.replace(/[^+\d]/g, '')}`}><Phone />{barangay.phone}</a>}{barangay.email && <a href={`mailto:${barangay.email}`}><Mail />{barangay.email}</a>}{!barangay.phone && !barangay.email && <span><CircleAlert />No complete public contact listed</span>}</div><SourceNote url={barangay.leadershipSource.url} label="DILG officials directory" date={barangay.leadershipSource.verifiedOn} /></article>)}</div>
    </section>
  </>
}

function ServicesPage() {
  return <>
    <PageHero eyebrow="Public services" title="Start with the official service standard." description="Open the City Government’s Citizen’s Charter, protocol manual, and official forms. BetterMC does not replace an application or official transaction channel." />
    <section className="section container"><div className="service-grid">{services.map((service) => <article key={service.title}><BookOpen /><span>{service.office}</span><h2>{service.title}</h2><p>{service.description}</p><a className="button secondary" href={service.url} target="_blank" rel="noreferrer">Open official resource <ExternalLink /></a><small>Source checked {service.verifiedOn}</small></article>)}</div></section>
  </>
}

const feedbackSchema = z.object({
  category: z.enum(['correction', 'broken-link', 'document-request', 'website-feedback']),
  subject: z.string().trim().min(5, 'Please enter a specific subject.').max(120),
  details: z.string().trim().min(20, 'Please provide at least 20 characters of context.').max(3000),
  sourceUrl: z.string().trim().url('Enter a complete URL, including https://').or(z.literal('')),
  email: z.string().trim().email('Enter a valid email address.').or(z.literal('')),
  website: z.string().max(0),
})

type FeedbackState = 'idle' | 'submitting' | 'success' | 'error'
function ParticipatePage() {
  const [state, setState] = useState<FeedbackState>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverMessage, setServerMessage] = useState('')
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setErrors({}); setServerMessage('')
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    const parsed = feedbackSchema.safeParse(payload)
    if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]))); setState('error'); return }
    setState('submitting')
    try {
      const response = await fetch('/api/submissions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(parsed.data) })
      const result = await response.json() as { message?: string }
      if (!response.ok) throw new Error(result.message ?? 'The submission could not be saved.')
      setState('success'); setServerMessage(result.message ?? 'Your submission was received.'); event.currentTarget.reset()
    } catch (error) { setState('error'); setServerMessage(error instanceof Error ? error.message : 'The submission could not be saved.') }
  }
  return <>
    <PageHero eyebrow="Community participation" title="Improve the public record with evidence." description="Suggest a correction, report a broken official link, or ask the BetterMC research team to locate a public document. Submissions are reviewed before publication." />
    <section className="section container participation-grid">
      <div><SectionHeading eyebrow="How review works" title="Community input is not published automatically." /><ol className="process-list"><li><span>1</span><div><strong>Submit context and a source</strong><p>Give reviewers enough detail to reproduce the issue.</p></div></li><li><span>2</span><div><strong>Independent review</strong><p>A moderator checks the claim against an attributable public source.</p></div></li><li><span>3</span><div><strong>Correction history</strong><p>Accepted changes retain their source and review date.</p></div></li></ol></div>
      <form className="feedback-form" onSubmit={handleSubmit} noValidate>
        <h2>Submit to the correction desk</h2>
        {serverMessage && <div className={`form-message ${state}`} role="status">{state === 'success' ? <Check /> : <CircleAlert />}{serverMessage}</div>}
        <label>Request type<select name="category" defaultValue="correction"><option value="correction">Suggest a correction</option><option value="broken-link">Report a broken link</option><option value="document-request">Suggest a public document</option><option value="website-feedback">Website feedback</option></select></label>
        <label>Subject<input name="subject" aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? 'subject-error' : undefined} />{errors.subject && <small id="subject-error" className="field-error">{errors.subject}</small>}</label>
        <label>Details<textarea name="details" rows={6} aria-invalid={Boolean(errors.details)} aria-describedby={errors.details ? 'details-error' : undefined} />{errors.details && <small id="details-error" className="field-error">{errors.details}</small>}</label>
        <label>Supporting source URL <span>(recommended)</span><input name="sourceUrl" type="url" placeholder="https://…" aria-invalid={Boolean(errors.sourceUrl)} />{errors.sourceUrl && <small className="field-error">{errors.sourceUrl}</small>}</label>
        <label>Email <span>(optional, never published)</span><input name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} />{errors.email && <small className="field-error">{errors.email}</small>}</label>
        <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <button className="button primary" disabled={state === 'submitting'}>{state === 'submitting' ? 'Sending…' : 'Send for review'}<ArrowRight /></button>
        <p className="privacy-note">Do not submit confidential, sensitive, or private personal information.</p>
      </form>
    </section>
  </>
}

function AboutPage() {
  return <>
    <PageHero eyebrow="About BetterMC" title="Independent by design. Evidence-led by default." description="BetterMC helps residents navigate public information. It does not represent the City Government and does not make legal-compliance findings." />
    <section className="section container prose"><h2>Editorial and verification policy</h2><p>Government-related factual records must identify an inspectable source and a review date. Official city sources are preferred, followed by national government sources such as COA, DBM, DILG, PSA, PhilGEPS and DPWH.</p><h2>What “source listed” means</h2><p>It means the official Full Disclosure page displayed a record title during the review. It does not confirm completeness of the file, validate every figure in a PDF, or establish legal compliance.</p><h2>Reuse and attribution</h2><p>The architecture was informed by the CC0 BetterLosBaños project and the BetterGov LGU ecosystem. Malaybalay-specific data is independently compiled from its cited sources.</p><SourceNote url="https://github.com/BetterLosBanos/betterlb" label="BetterLosBaños technical reference" /></section>
  </>
}

function NotFoundPage() { return <section className="empty-page container"><span>404</span><h1>This page is not in the public record.</h1><p>Return to the homepage or search the current directory.</p><Link className="button primary" to="/">Return home</Link></section> }

export default function App() {
  return <Layout><Routes><Route path="/" element={<HomePage />} /><Route path="/transparency" element={<TransparencyPage />} /><Route path="/government" element={<GovernmentPage />} /><Route path="/barangays" element={<BarangaysPage />} /><Route path="/services" element={<ServicesPage />} /><Route path="/participate" element={<ParticipatePage />} /><Route path="/about" element={<AboutPage />} /><Route path="*" element={<NotFoundPage />} /></Routes></Layout>
}
