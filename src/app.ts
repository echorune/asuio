import { cashFlow, seedTransactions } from './data/transactions.js'
import type { RangeKey, Transaction } from './types/index.js'
import { holdings, portfolioHistory, watchAssets } from './data/portfolio.js'
import type { PortfolioAsset, PortfolioRange, WatchAsset } from './types/portfolio.js'

const root = document.querySelector<HTMLDivElement>('#root')!
const currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const state = {
  transactions: [...seedTransactions], balance: 24850.72, hidden: false, range: '1M' as RangeKey,
  filter: 'all' as 'all' | 'income' | 'spending', query: '', dialog: '' as '' | 'transfer' | 'receive',
  menuOpen: false, copied: false, review: false, recipient: '', amount: '', memo: '', showAll: false,
  view: 'overview' as 'overview' | 'invest', assetQuery: '', assetSort: 'value' as 'value' | 'return' | 'name',
  portfolioRange: '1M' as PortfolioRange, watchlist: ['amzn', 'tsla', 'renw'] as string[], selectedAsset: '',
}
let lastAssetTrigger = ''
const icons: Record<string, string> = {
  leaf: '<path d="M20.5 3.5C12 3.5 5 6.8 5 13.3a5.2 5.2 0 0 0 5.2 5.2c6.5 0 9.8-7 10.3-15Z"/><path d="M3.5 21c3.5-6 7.5-9 13-12"/>',
  wallet: '<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18M16 15h2"/>',
  arrows: '<path d="M7 7h13l-3-3m3 3-3 3M17 17H4l3 3m-3-3 3-3"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4"/>',
  down: '<path d="m6 9 6 6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
  upRight: '<path d="M7 17 17 7M7 7h10v10"/>', downLeft: '<path d="M17 7 7 17m10 0H7V7"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a14 14 0 0 1-3.2 4.1M6.2 6.3C3.5 8.1 2 12 2 12s3.5 7 10 7a10 10 0 0 0 3.6-.7"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>', x: '<path d="m6 6 12 12M18 6 6 18"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3m.1 4h.01"/>',
  sparkle: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z"/>',
}
function icon(name: string, size = 18): string { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? ''}</svg>` }
function esc(value: string): string { return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!) }
function money(value: number): string { return currency.format(value) }
function masked(value: number): string { return state.hidden ? '£ ••••••' : money(value) }
function amountError(value: string): string {
  const number = Number(value)
  if (!value) return ''
  if (!Number.isFinite(number) || number <= 0) return 'Enter an amount greater than £0.'
  if (! /^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(value)) return 'Use up to two decimal places.'
  if (number > state.balance) return 'This is more than your available balance.'
  return ''
}
async function copyAccountDetails(): Promise<boolean> {
  const value = 'Alex Morgan · 04-29-18 · 48294829'
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(value); return true }
    const field = document.createElement('textarea')
    field.value = value
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.append(field)
    field.select()
    const success = document.execCommand('copy')
    field.remove()
    return success
  } catch { return false }
}

function render(): void {
  const filtered = state.transactions.filter((tx) => {
    const kindMatch = state.filter === 'all' || tx.kind === state.filter
    return kindMatch && `${tx.merchant} ${tx.detail} ${tx.category}`.toLowerCase().includes(state.query.toLowerCase())
  })
  root.innerHTML = `<div class="app-shell">
    <aside class="sidebar ${state.menuOpen ? 'sidebar-open' : ''}">
      <a class="brand" href="#overview" data-view="overview" aria-label="Canopy home"><span class="brand-mark">${icon('leaf', 18)}</span><span>canopy<span class="brand-period">.</span></span></a>
      <div class="workspace-label">YOUR MONEY</div>
      <nav class="primary-nav" aria-label="Main navigation"><a class="nav-item ${state.view === 'overview' ? 'active' : ''}" href="#overview" data-view="overview" ${state.view === 'overview' ? 'aria-current="page"' : ''}><span class="nav-icon">${icon('wallet')}</span>Overview</a><a class="nav-item ${state.view === 'invest' ? 'active' : ''}" href="#invest" data-view="invest" ${state.view === 'invest' ? 'aria-current="page"' : ''}><span class="nav-icon">${icon('sparkle')}</span>Invest</a><a class="nav-item" href="#activity" data-view="activity"><span class="nav-icon">${icon('arrows')}</span>Activity<span class="nav-count">${state.transactions.length}</span></a></nav>
      <div class="sidebar-spacer"></div><div class="sidebar-card"><span class="sidebar-card-icon">${icon('shield', 16)}</span><strong>Banking, with a little more care.</strong><p>Your money is protected and your data stays yours.</p><span class="safety-link">Account safety, built in</span></div>
      <div class="profile-row"><div class="avatar">AM</div><div class="profile-copy"><strong>Alex Morgan</strong><span>Personal account</span></div>${icon('down', 16)}</div>
    </aside>${state.menuOpen ? '<button class="mobile-scrim" data-action="close-menu" aria-label="Close menu"></button>' : ''}
    <main class="main-content ${state.view === 'invest' ? 'invest-view' : ''}" id="overview"><header class="topbar"><button class="icon-button mobile-menu" data-action="open-menu" aria-label="Open menu">${icon('menu', 20)}</button><div class="breadcrumb">My finances ${icon('right', 14)} <strong>${state.view === 'invest' ? 'Invest' : 'Overview'}</strong></div><div class="topbar-actions"><span class="secure-status"><span class="status-dot"></span> All systems normal</span><div class="top-avatar">AM</div></div></header>
    ${state.view === 'invest' ? portfolioMarkup() : ''}<div class="page-content"><section class="welcome-row"><div><div class="eyebrow"><span class="eyebrow-line"></span> SATURDAY, NOVEMBER 7, 2026</div><h1>A little more <em>in balance.</em></h1><p class="welcome-subtitle">Here’s the shape of your money today.</p></div><span class="date-select">This month</span></section>
    <section class="overview-grid" aria-label="Account overview"><article class="balance-card"><div class="balance-card-top"><div class="balance-label"><span class="mini-icon">${icon('wallet', 15)}</span> TOTAL CASH BALANCE</div><button class="visibility-button" data-action="visibility">${icon(state.hidden ? 'eye' : 'eyeOff', 16)}<span>${state.hidden ? 'Show' : 'Hide'}</span></button></div><div class="balance-amount">${masked(state.balance)}</div><div class="balance-foot"><span class="account-pill"><span class="account-dot"></span> Everyday account</span><span class="account-number">•• 4829</span></div><div class="balance-decoration"><span class="decor-circle one"></span><span class="decor-circle two"></span><span class="decor-line"></span></div></article>
    <article class="stat-card income-card"><div class="stat-heading"><span class="stat-icon income-icon">${icon('downLeft', 17)}</span><span>Money in</span><span class="stat-period">THIS MONTH</span></div><div class="stat-value">${state.hidden ? '£ ••••••' : '£11,050.00'}</div><div class="stat-bottom"><span class="trend-up">↗ 12.8%</span><span>vs. last month</span><div class="sparkline positive"><svg viewBox="0 0 94 35" aria-hidden="true"><path d="M2 29 C13 29 12 20 24 22 S38 28 48 16 S62 21 68 12 S79 17 92 3"/></svg></div></div></article>
    <article class="stat-card spend-card"><div class="stat-heading"><span class="stat-icon spend-icon">${icon('upRight', 17)}</span><span>Money out</span><span class="stat-period">THIS MONTH</span></div><div class="stat-value">${state.hidden ? '£ ••••••' : '£2,184.62'}</div><div class="stat-bottom"><span class="trend-down">↓ 4.2%</span><span>vs. last month</span><div class="sparkline negative"><svg viewBox="0 0 94 35" aria-hidden="true"><path d="M2 7 C13 11 12 3 24 12 S38 8 48 20 S62 14 68 25 S79 18 92 32"/></svg></div></div></article></section>
    <section class="middle-grid"><article class="panel chart-panel"><div class="panel-heading"><div><div class="section-kicker">YOUR CASH FLOW</div><h2>Moving in the right direction</h2></div><a class="text-link" href="#activity">Review activity ${icon('right', 15)}</a></div><div class="chart-summary"><div class="chart-total">${state.hidden ? '£ ••••••' : '£8,865.38'} <span class="chart-trend">↗ 8.4%</span></div><span class="chart-caption">net cash flow <span class="caption-dot"></span> vs previous period</span></div>${chartMarkup()}<div class="chart-bottom"><div class="chart-legend"><span class="legend-dot"></span> Net cash flow</div><div class="range-tabs" role="group" aria-label="Chart time range">${(['1W', '1M', '3M', '6M', '1Y'] as RangeKey[]).map((range) => `<button data-range="${range}" class="${state.range === range ? 'selected' : ''}" aria-pressed="${state.range === range}">${range}</button>`).join('')}</div></div></article>
    <article class="panel action-panel"><div class="section-kicker">MAKE A MOVE</div><h2>Money, moving well.</h2><p>Simple actions for your everyday.</p><div class="action-buttons"><button class="action-tile transfer-tile" data-action="transfer"><span class="tile-icon transfer-icon">${icon('upRight', 19)}</span><span><strong>Send money</strong><small>Transfer to someone</small></span>${icon('right', 16)}</button><button class="action-tile receive-tile" data-action="receive"><span class="tile-icon receive-icon">${icon('downLeft', 19)}</span><span><strong>Get paid</strong><small>Share account details</small></span>${icon('right', 16)}</button></div><div class="action-note">${icon('shield', 14)}<span>Protected by 24/7 account monitoring</span></div></article></section>
    <section class="panel transactions-panel" id="activity"><div class="transactions-heading"><div><div class="section-kicker">THE LATEST</div><h2>Recent activity</h2></div><button class="text-link" data-action="all-activity">All activity ${icon('right', 15)}</button></div><div class="activity-tools"><div class="filter-tabs" role="group" aria-label="Filter transactions">${(['all', 'income', 'spending'] as const).map((filter) => `<button data-filter="${filter}" class="${state.filter === filter ? 'active-filter' : ''}" aria-pressed="${state.filter === filter}">${filter === 'all' ? 'All' : filter === 'income' ? 'Money in' : 'Money out'}</button>`).join('')}</div><label class="search-box">${icon('search', 15)}<input id="activity-search" value="${esc(state.query)}" placeholder="Search activity" aria-label="Search activity" />${state.query ? `<button data-action="clear-search" aria-label="Clear search">${icon('x', 14)}</button>` : ''}</label></div><div class="transaction-list">${filtered.length ? filtered.slice(0, state.showAll ? filtered.length : 6).map(transactionMarkup).join('') : `<div class="empty-state"><span class="empty-icon">${icon('search', 18)}</span><strong>No activity found</strong><span>Try another search or change your filter.</span><button data-action="clear-filters">Clear filters</button></div>`}</div>${filtered.length > 6 && !state.showAll ? '<button class="load-more" data-action="all-activity">Show all activity ' + icon('down', 14) + '</button>' : ''}</section>
    <footer class="page-footer"><span>© 2026 Canopy Financial, Ltd.</span><span>${icon('shield', 13)} Protected by bank-grade security</span><a class="guide-link" href="/guide.html">${icon('help', 14)} User guide</a></footer></div></main>${state.dialog ? dialogMarkup() : ''}${state.selectedAsset ? assetDialogMarkup() : ''}</div>`
  bindEvents()
}
function holdingValue(asset: PortfolioAsset): number { return asset.shares * asset.price }
function portfolioTotal(): number { return holdings.reduce((total, asset) => total + holdingValue(asset), 0) }
function portfolioCost(): number { return holdings.reduce((total, asset) => total + asset.shares * asset.costBasis, 0) }
function portfolioDay(): number { return holdings.reduce((total, asset) => total + asset.dayChange, 0) }
function watchAsset(id: string): PortfolioAsset | WatchAsset | undefined { return holdings.find((asset) => asset.id === id) ?? watchAssets.find((asset) => asset.id === id) }
function assetDayPercent(asset: PortfolioAsset | WatchAsset): number { return 'shares' in asset ? asset.dayChange / (holdingValue(asset) - asset.dayChange) * 100 : asset.dayPercent }
function assetSearchMatch(asset: PortfolioAsset | WatchAsset, query: string): boolean { return `${asset.symbol} ${asset.name} ${asset.kind}`.toLowerCase().includes(query.toLowerCase()) }
function miniLine(values: number[], color = '#36957e'): string {
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 260},${60 - value * 0.58}`).join(' ')
  return `<svg viewBox="0 0 260 64" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`
}
function portfolioMarkup(): string {
  const total = portfolioTotal()
  const cost = portfolioCost()
  const day = portfolioDay()
  const gain = total - cost
  const gainPercent = gain / cost * 100
  const dayPercent = day / (total - day) * 100
  const allocations = (['US equities', 'Global equities', 'Fixed income'] as const).map((assetClass) => ({ name: assetClass, value: holdings.filter((asset) => asset.assetClass === assetClass).reduce((sum, asset) => sum + holdingValue(asset), 0), color: assetClass === 'US equities' ? '#32957e' : assetClass === 'Global equities' ? '#e3a17b' : '#8eb8bd' }))
  let sweep = 0
  const ring = allocations.map((item) => { const start = sweep; sweep += item.value / total * 100; return `${item.color} ${start}% ${sweep}%` }).join(', ')
  const query = state.assetQuery.trim()
  const matched = holdings.filter((asset) => assetSearchMatch(asset, query)).sort((a, b) => state.assetSort === 'name' ? a.name.localeCompare(b.name) : state.assetSort === 'return' ? (holdingValue(b) - b.shares * b.costBasis) - (holdingValue(a) - a.shares * a.costBasis) : holdingValue(b) - holdingValue(a))
  const watched = state.watchlist.map(watchAsset).filter((asset): asset is PortfolioAsset | WatchAsset => !!asset && assetSearchMatch(asset, query))
  return `<section class="portfolio-page" id="invest"><div class="portfolio-wrap">
    <div class="portfolio-intro"><div><div class="eyebrow"><span class="eyebrow-line"></span> INVESTING, WITH A LONGER VIEW</div><h1>Your portfolio, <em>in perspective.</em></h1><p>See what you own, what’s moving, and how it all fits together.</p></div><span class="snapshot-pill"><span></span> DEMO MARKET SNAPSHOT · 06 NOV, CLOSE</span></div>
    <section class="portfolio-hero" aria-label="Portfolio performance"><div class="portfolio-hero-copy"><div class="portfolio-label">TOTAL INVESTED VALUE <span>${icon('sparkle', 13)} INVESTING</span><button class="visibility-button portfolio-visibility" data-action="visibility" aria-label="${state.hidden ? 'Show' : 'Hide'} portfolio values">${icon(state.hidden ? 'eye' : 'eyeOff', 14)}<span>${state.hidden ? 'Show' : 'Hide'}</span></button></div><div class="portfolio-total">${state.hidden ? '£ ••••••' : money(total)}</div><div class="portfolio-hero-metrics"><div><span>Today</span><strong class="positive-text">${day >= 0 ? '+' : '−'}${state.hidden ? '£ ••••' : money(Math.abs(day))} <small>(${dayPercent.toFixed(2)}%)</small></strong></div><i></i><div><span>All time</span><strong class="positive-text">${state.hidden ? '••••••' : `+${money(gain)}`} <small>(${gainPercent.toFixed(2)}%)</small></strong></div></div><p>Market values shown in GBP. Changes are against the previous close.</p></div><div class="portfolio-chart-block"><div class="portfolio-chart-top"><div><span>PORTFOLIO VALUE</span><strong>${state.hidden ? '£ ••••••' : money(total)}</strong></div><div class="portfolio-ranges" role="group" aria-label="Portfolio chart time range">${(['1M', '3M', '1Y'] as PortfolioRange[]).map((range) => `<button data-portfolio-range="${range}" class="${state.portfolioRange === range ? 'selected' : ''}" aria-pressed="${state.portfolioRange === range}">${range}</button>`).join('')}</div></div><div class="portfolio-chart"><div class="portfolio-chart-lines"><i></i><i></i><i></i><i></i></div>${miniLine(portfolioHistory[state.portfolioRange], '#a5e2c7')}<div class="portfolio-chart-labels"><span>${state.portfolioRange === '1M' ? 'Oct 6' : state.portfolioRange === '3M' ? 'Aug 6' : 'Nov ’25'}</span><span>${state.portfolioRange === '1M' ? 'Oct 20' : state.portfolioRange === '3M' ? 'Sep 20' : 'May ’26'}</span><span>Nov 6</span></div></div></div><div class="portfolio-glow glow-a"></div><div class="portfolio-glow glow-b"></div></section>
    <div class="portfolio-columns"><div class="portfolio-main-column"><section class="panel holdings-panel"><div class="invest-panel-heading"><div><div class="section-kicker">YOUR INVESTMENTS</div><h2>Holdings <span>${holdings.length}</span></h2></div><div class="holding-tools"><label class="search-box asset-search">${icon('search', 15)}<input id="asset-search" value="${esc(state.assetQuery)}" placeholder="Search assets" aria-label="Search holdings and watchlist" />${query ? `<button data-action="clear-assets" aria-label="Clear asset search">${icon('x', 14)}</button>` : ''}</label><label class="sort-select"><span>Sort</span><select id="asset-sort" aria-label="Sort holdings"><option value="value" ${state.assetSort === 'value' ? 'selected' : ''}>Value</option><option value="return" ${state.assetSort === 'return' ? 'selected' : ''}>Return</option><option value="name" ${state.assetSort === 'name' ? 'selected' : ''}>Name</option></select>${icon('down', 13)}</label></div></div><div class="holdings-table"><div class="holdings-table-head"><span>ASSET</span><span>PRICE</span><span>DAY</span><span>RETURN</span><span>VALUE</span><span></span></div>${matched.length ? matched.map((asset) => {
    const value = holdingValue(asset)
    const profit = value - asset.shares * asset.costBasis
    const percent = profit / (asset.shares * asset.costBasis) * 100
    return `<div class="holding-row"><button class="holding-main" data-asset="${asset.id}" aria-label="View ${esc(asset.name)} position details"><span class="asset-symbol" style="--asset-color:${asset.color}">${esc(asset.symbol.slice(0, 1))}</span><span class="holding-name"><strong>${esc(asset.name)}</strong><small>${esc(asset.symbol)} · ${esc(asset.kind.split(' · ')[0])}</small></span></button><span class="holding-price">${money(asset.price)}</span><span class="holding-day ${asset.dayChange >= 0 ? 'positive-text' : 'negative-text'}">${state.hidden ? '£ ••••' : `${asset.dayChange >= 0 ? '+' : '−'}${money(Math.abs(asset.dayChange))}`}</span><span class="holding-return ${profit >= 0 ? 'positive-text' : 'negative-text'}">${profit >= 0 ? '+' : '−'}${Math.abs(percent).toFixed(1)}%</span><strong class="holding-value">${state.hidden ? '£ ••••••' : money(value)}</strong><button class="watch-toggle ${state.watchlist.includes(asset.id) ? 'is-watched' : ''}" data-watch="${asset.id}" aria-label="${state.watchlist.includes(asset.id) ? 'Remove' : 'Add'} ${esc(asset.symbol)} ${state.watchlist.includes(asset.id) ? 'from' : 'to'} watchlist" aria-pressed="${state.watchlist.includes(asset.id)}">${state.watchlist.includes(asset.id) ? '★' : '☆'}</button></div>`
  }).join('') : `<div class="portfolio-empty"><span>${icon('search', 19)}</span><strong>No holdings match that search</strong><small>Try a company name, ticker, or asset type.</small><button data-action="clear-assets">Clear search</button></div>`}</div><div class="holdings-foot"><span>${icon('shield', 13)} Simulated positions · prices as of 06 Nov 2026 close</span><span>${holdings.length} positions</span></div></section>
    <section class="panel watchlist-panel"><div class="invest-panel-heading"><div><div class="section-kicker">KEEP AN EYE ON</div><h2>Watchlist <span>${state.watchlist.length}</span></h2></div><span class="watchlist-hint">Tap an asset to see its snapshot</span></div><div class="watchlist-grid">${watched.length ? watched.map((asset) => `<article class="watch-card"><button class="watch-card-main" data-asset="${asset.id}" aria-label="View ${esc(asset.name)} market snapshot"><span class="watch-symbol" style="--asset-color:${asset.color}">${esc(asset.symbol.slice(0, 1))}</span><span class="watch-name"><strong>${esc(asset.symbol)}</strong><small>${esc(asset.name)}</small></span><span class="watch-chart">${miniLine(asset.history, assetDayPercent(asset) >= 0 ? '#4b9c80' : '#d18272')}</span><strong class="watch-price">${money(asset.price)}</strong><span class="watch-change ${assetDayPercent(asset) >= 0 ? 'positive-text' : 'negative-text'}">${assetDayPercent(asset) >= 0 ? '+' : ''}${assetDayPercent(asset).toFixed(2)}%</span></button><button class="watch-remove" data-watch="${asset.id}" aria-label="Remove ${esc(asset.symbol)} from watchlist">${icon('x', 13)}</button></article>`).join('') : `<div class="portfolio-empty watch-empty"><span>${icon('sparkle', 19)}</span><strong>${query ? 'No watchlist assets match' : 'Your watchlist is clear'}</strong><small>${query ? 'Try another search term.' : 'Add a star beside any holding to keep it close.'}</small></div>`}</div>${!watched.length && !query ? '' : '<p class="watchlist-disclosure">Watchlist quotes are illustrative GBP snapshots and are not live market prices.</p>'}</section></div>
    <aside class="portfolio-side-column"><section class="panel allocation-panel"><div class="section-kicker">WHAT YOU’RE INVESTED IN</div><h2>Allocation</h2><p class="panel-subtitle">By asset class · current value</p><div class="allocation-layout"><div class="allocation-ring" role="img" aria-label="Portfolio allocation by asset class" style="--allocation:${ring}"><div><strong>${holdings.length}</strong><span>positions</span></div></div><div class="allocation-legend">${allocations.map((item) => `<div><span class="allocation-dot" style="--dot:${item.color}"></span><span class="allocation-name">${item.name}</span><strong>${(item.value / total * 100).toFixed(0)}%</strong></div>`).join('')}</div></div><div class="allocation-foot"><span>Market value</span><strong>${state.hidden ? '£ ••••••' : money(total)}</strong></div></section><section class="snapshot-note"><span class="snapshot-note-icon">${icon('shield', 17)}</span><div><strong>Built for the long view</strong><p>Portfolio values and price movements are simulated. Canopy has not placed any orders.</p></div></section><div class="portfolio-asof">${icon('help', 13)} Quotes converted to GBP for this demo view.</div></aside></div><footer class="page-footer portfolio-footer"><span>© 2026 Canopy Financial, Ltd.</span><span>${icon('shield', 13)} Simulated investing · no real orders</span><a class="guide-link" href="/guide.html">${icon('help', 14)} User guide</a></footer></div></section>`
}
function assetDialogMarkup(): string {
  const asset = watchAsset(state.selectedAsset)
  if (!asset) return ''
  const held = 'shares' in asset
  const currentValue = held ? holdingValue(asset) : asset.price
  const gain = held ? currentValue - asset.shares * asset.costBasis : 0
  const gainPercent = held ? gain / (asset.shares * asset.costBasis) * 100 : 0
  const watched = state.watchlist.includes(asset.id)
  const graphColor = held ? '#36957e' : asset.dayPercent >= 0 ? '#36957e' : '#cc816e'
  const history = asset.history
  return `<div class="modal-backdrop asset-backdrop" data-action="asset-backdrop"><section class="modal asset-modal" role="dialog" aria-modal="true" aria-labelledby="asset-title"><div class="modal-top"><span class="asset-modal-symbol" style="--asset-color:${asset.color}">${esc(asset.symbol.slice(0, 1))}</span><button class="modal-close" data-action="close-asset" aria-label="Close asset details">${icon('x', 19)}</button></div><div class="modal-step">${held ? 'YOUR HOLDING' : 'WATCHLIST ASSET'} · DEMO MARKET SNAPSHOT</div><h2 id="asset-title">${esc(asset.name)}</h2><div class="asset-detail-quote"><strong>${money(asset.price)}</strong><span class="${held ? gain >= 0 ? 'positive-text' : 'negative-text' : assetDayPercent(asset) >= 0 ? 'positive-text' : 'negative-text'}">${held ? `${state.hidden ? '••••••' : `${gain >= 0 ? '+' : '−'}${money(Math.abs(gain))}`} (${gainPercent.toFixed(2)}%) total return` : `${assetDayPercent(asset) >= 0 ? '+' : ''}${assetDayPercent(asset).toFixed(2)}% today`}</span></div><div class="asset-detail-chart">${miniLine(history, graphColor)}<div><span>06 Oct</span><span>06 Nov 2026</span></div></div><div class="asset-detail-facts">${held ? `<div><span>POSITION VALUE</span><strong>${state.hidden ? '£ ••••••' : money(currentValue)}</strong></div><div><span>UNITS HELD</span><strong>${asset.shares.toLocaleString('en-GB', { maximumFractionDigits: 3 })}</strong></div><div><span>AVERAGE COST</span><strong>${money(asset.costBasis)}</strong></div><div><span>ASSET CLASS</span><strong>${esc(asset.assetClass)}</strong></div><div><span>SECTOR</span><strong>${esc(asset.sector)}</strong></div><div><span>RISK PROFILE</span><strong>${esc(asset.risk)}</strong></div>` : `<div><span>MARKET PRICE</span><strong>${money(asset.price)}</strong></div><div><span>ASSET TYPE</span><strong>${esc(asset.kind)}</strong></div><div><span>SNAPSHOT CHANGE</span><strong class="${assetDayPercent(asset) >= 0 ? 'positive-text' : 'negative-text'}">${assetDayPercent(asset) >= 0 ? '+' : ''}${assetDayPercent(asset).toFixed(2)}%</strong></div><div><span>WATCHLIST</span><strong>${watched ? 'Following' : 'Not following'}</strong></div>`}</div><p class="asset-detail-note">${held ? esc(asset.note) : 'This asset is shown for market observation only. Values are simulated and shown in GBP.'}</p><div class="modal-actions"><button class="primary-button watch-modal-button" data-watch="${asset.id}" aria-pressed="${watched}">${watched ? '★ Remove from watchlist' : '☆ Add to watchlist'}</button></div><p class="demo-note">${icon('shield', 14)} Simulated market data. No order has been placed.</p></section></div>`
}

function transactionMarkup(tx: Transaction): string {
  const date = dateFormat.format(new Date(tx.date))
  return `<article class="transaction-row"><span class="merchant-avatar tone-${tx.tone}">${esc(tx.initials)}</span><div class="transaction-copy"><strong>${esc(tx.merchant)}</strong><span>${esc(tx.detail)}</span></div><span class="transaction-category">${esc(tx.category)}</span><time class="transaction-date" datetime="${esc(tx.date)}">${date}</time><strong class="transaction-amount ${tx.amount > 0 ? 'amount-positive' : ''}">${state.hidden ? '£ ••••' : `${tx.amount > 0 ? '+' : '−'}${money(Math.abs(tx.amount))}`}</strong></article>`
}
function chartMarkup(): string {
  const values = cashFlow[state.range]
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 700},${160 - value * 1.45}`).join(' ')
  const labels = state.range === '1W' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'] : state.range === '1M' ? ['Oct 8', 'Oct 12', 'Oct 16', 'Oct 20', 'Oct 24', 'Oct 28', 'Nov 1', 'Nov 7'] : state.range === '1Y' ? ['Dec', 'Feb', 'Apr', 'Jun', 'Aug', 'Oct', 'Nov'] : ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6']
  return `<div class="chart-wrap"><div class="chart-y-labels"><span>£8k</span><span>£6k</span><span>£4k</span><span>£2k</span><span>£0</span></div><svg class="cash-chart" viewBox="0 0 700 180" preserveAspectRatio="none" role="img" aria-label="${state.range} net cash flow trend chart"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#44b7a2" stop-opacity=".21"/><stop offset="100%" stop-color="#44b7a2" stop-opacity="0"/></linearGradient></defs><path class="chart-gridline" d="M0 20H700M0 60H700M0 100H700M0 140H700M0 179H700"/><polygon points="0,180 ${points} 700,180" fill="url(#chartFill)"/><polyline points="${points}" fill="none" stroke="#319e8a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><circle cx="700" cy="${160 - values[values.length - 1]! * 1.45}" r="5" fill="#fff" stroke="#319e8a" stroke-width="3" vector-effect="non-scaling-stroke"/></svg><div class="chart-x-labels">${labels.map((label) => `<span>${label}</span>`).join('')}</div></div>`
}
function dialogMarkup(): string {
  if (state.dialog === 'receive') return `<div class="modal-backdrop" data-action="backdrop"><section class="modal receive-modal" role="dialog" aria-modal="true" aria-labelledby="receive-title"><div class="modal-top"><span class="modal-symbol receive-symbol">${icon('downLeft', 20)}</span><button class="modal-close" data-action="close-dialog" aria-label="Close dialog">${icon('x', 19)}</button></div><div class="modal-step">GET PAID</div><h2 id="receive-title">Your account details</h2><p class="modal-copy">Share these details to receive a bank transfer into your Everyday account.</p><div class="detail-card"><div><span>ACCOUNT NAME</span><strong>Alex Morgan</strong></div><div><span>SORT CODE</span><strong>04-29-18</strong></div><div><span>ACCOUNT NUMBER</span><strong>•••• 4829</strong></div><div><span>BANK</span><strong>Canopy Financial</strong></div></div><button class="primary-button copy-button ${state.copied ? 'copied' : ''}" data-action="copy-details">${icon(state.copied ? 'shield' : 'copy', 16)}${state.copied ? 'Details copied' : 'Copy account details'}</button><p class="demo-note">${icon('shield', 14)} Demo account details. No real transfers are received.</p></section></div>`
  const problem = amountError(state.amount)
  const amountValue = Number(state.amount)
  return `<div class="modal-backdrop" data-action="backdrop"><section class="modal transfer-modal" role="dialog" aria-modal="true" aria-labelledby="transfer-title"><div class="modal-top"><span class="modal-symbol">${icon('upRight', 20)}</span><button class="modal-close" data-action="close-dialog" aria-label="Close dialog">${icon('x', 19)}</button></div><div class="modal-step">${state.review ? 'STEP 2 OF 2 · REVIEW' : 'STEP 1 OF 2 · DETAILS'}</div><h2 id="transfer-title">${state.review ? 'Review your transfer' : 'Send money'}</h2><p class="modal-copy">${state.review ? 'Check the details before confirming this demo transfer.' : 'Move money from your Everyday account.'}</p>${state.review ? `<div class="review-card"><div><span>TO</span><strong>${esc(state.recipient.trim())}</strong></div><div><span>FROM</span><strong>Everyday account ···· 4829</strong></div><div><span>NOTE</span><strong>${esc(state.memo.trim() || 'No note')}</strong></div><div class="review-total"><span>YOU’RE SENDING</span><strong>${money(amountValue)}</strong></div></div>` : `<div class="transfer-fields"><label>Recipient name<input id="recipient" value="${esc(state.recipient)}" placeholder="e.g. Jamie Taylor" maxlength="60" /></label><label>Amount<div class="amount-input"><span>£</span><input id="transfer-amount" type="number" min="0.01" max="${state.balance}" step="0.01" value="${esc(state.amount)}" placeholder="0.00" /></div><span class="field-hint">Available: ${money(state.balance)}</span>${problem ? `<span class="field-error" role="alert">${problem}</span>` : ''}</label><label>Reference <span class="optional">OPTIONAL</span><input id="transfer-memo" value="${esc(state.memo)}" placeholder="What’s it for?" maxlength="60" /></label></div>`}<div class="modal-actions">${state.review ? '<button class="secondary-button" data-action="edit-transfer">Edit details</button>' : ''}<button class="primary-button" data-action="${state.review ? 'confirm-transfer' : 'review-transfer'}" ${!state.review && !(state.recipient.trim().length >= 2 && amountValue > 0 && amountValue <= state.balance && !problem) ? 'disabled' : ''}>${state.review ? 'Confirm demo transfer' : 'Review transfer'}${icon('right', 16)}</button></div><p class="demo-note">${icon('shield', 14)} Simulated transfer. No real money will move.</p></section></div>`
}
function openDialog(kind: 'transfer' | 'receive'): void { state.dialog = kind; state.review = false; state.recipient = ''; state.amount = ''; state.memo = ''; state.copied = false; render(); if (kind === 'transfer') document.querySelector<HTMLInputElement>('#recipient')?.focus() }
function bindEvents(): void {
  root.querySelectorAll<HTMLAnchorElement>('[data-view]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault()
    const destination = link.dataset.view
    state.view = destination === 'invest' ? 'invest' : 'overview'
    state.menuOpen = false
    state.selectedAsset = ''
    render()
    if (destination === 'activity') { window.location.hash = 'activity'; document.querySelector('#activity')?.scrollIntoView({ behavior: 'smooth' }) }
    else { window.location.hash = destination === 'invest' ? 'invest' : 'overview'; window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }))
  root.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => element.addEventListener('click', (event) => {
    const action = element.dataset.action
    if ((action === 'backdrop' || action === 'asset-backdrop') && event.target !== element) return
    if (action === 'visibility') state.hidden = !state.hidden
    else if (action === 'transfer') { openDialog('transfer'); return }
    else if (action === 'receive') { openDialog('receive'); return }
    else if (action === 'close-dialog' || action === 'backdrop') state.dialog = ''
    else if (action === 'close-asset' || action === 'asset-backdrop') state.selectedAsset = ''
    else if (action === 'open-menu') state.menuOpen = true
    else if (action === 'close-menu') state.menuOpen = false
    else if (action === 'all-activity') { state.filter = 'all'; state.query = ''; state.showAll = true }
    else if (action === 'clear-filters') { state.filter = 'all'; state.query = '' }
    else if (action === 'clear-search') state.query = ''
    else if (action === 'clear-assets') state.assetQuery = ''
    else if (action === 'review-transfer') { state.recipient = document.querySelector<HTMLInputElement>('#recipient')?.value ?? ''; state.amount = document.querySelector<HTMLInputElement>('#transfer-amount')?.value ?? ''; state.memo = document.querySelector<HTMLInputElement>('#transfer-memo')?.value ?? ''; const value = Number(state.amount); if (state.recipient.trim().length >= 2 && value > 0 && value <= state.balance && !amountError(state.amount)) state.review = true }
    else if (action === 'edit-transfer') state.review = false
    else if (action === 'confirm-transfer') { const value = Number(state.amount); const tx: Transaction = { id: `tx-${Date.now()}`, merchant: state.recipient.trim(), detail: state.memo.trim() || 'Bank transfer · Just now', category: 'Transfer', date: new Date().toISOString(), amount: -value, kind: 'transfer', initials: state.recipient.trim().slice(0, 1).toUpperCase(), tone: 'sky' }; state.transactions.unshift(tx); state.balance = Math.round((state.balance - value) * 100) / 100; state.dialog = '' }
    else if (action === 'copy-details') { void copyAccountDetails().then((success) => { state.copied = success; render(); window.setTimeout(() => { if (state.dialog === 'receive') { state.copied = false; render() } }, 2200) }) }
    render()
    if (action === 'close-asset' || action === 'asset-backdrop') {
      (root.querySelector<HTMLButtonElement>(`[data-asset="${lastAssetTrigger}"]`) ?? root.querySelector<HTMLInputElement>('#asset-search'))?.focus()
      lastAssetTrigger = ''
    }
  }))
  root.querySelectorAll<HTMLButtonElement>('[data-range]').forEach((button) => button.addEventListener('click', () => { state.range = button.dataset.range as RangeKey; render() }))
  root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => { state.filter = button.dataset.filter as typeof state.filter; render() }))
  root.querySelectorAll<HTMLButtonElement>('[data-portfolio-range]').forEach((button) => button.addEventListener('click', () => { state.portfolioRange = button.dataset.portfolioRange as PortfolioRange; render() }))
  root.querySelectorAll<HTMLButtonElement>('[data-asset]').forEach((button) => button.addEventListener('click', () => { state.selectedAsset = button.dataset.asset ?? ''; lastAssetTrigger = state.selectedAsset; render(); root.querySelector<HTMLButtonElement>('.asset-modal .modal-close')?.focus() }))
  root.querySelectorAll<HTMLButtonElement>('[data-watch]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); const id = button.dataset.watch ?? ''; state.watchlist = state.watchlist.includes(id) ? state.watchlist.filter((item) => item !== id) : [...state.watchlist, id]; render() }))
  const assetSearch = root.querySelector<HTMLInputElement>('#asset-search')
  assetSearch?.addEventListener('input', () => { const cursor = assetSearch.selectionStart; state.assetQuery = assetSearch.value; render(); const next = root.querySelector<HTMLInputElement>('#asset-search'); next?.focus(); next?.setSelectionRange(cursor, cursor) })
  root.querySelector<HTMLSelectElement>('#asset-sort')?.addEventListener('change', (event) => { state.assetSort = (event.currentTarget as HTMLSelectElement).value as typeof state.assetSort; render() })
  const search = root.querySelector<HTMLInputElement>('#activity-search')
  search?.addEventListener('input', () => { const cursor = search.selectionStart; state.query = search.value; render(); const next = root.querySelector<HTMLInputElement>('#activity-search'); next?.focus(); next?.setSelectionRange(cursor, cursor) })
  const recipient = root.querySelector<HTMLInputElement>('#recipient')
  recipient?.addEventListener('input', () => { state.recipient = recipient.value; updateContinueButton() })
  const amount = root.querySelector<HTMLInputElement>('#transfer-amount')
  amount?.addEventListener('input', () => { state.amount = amount.value; updateContinueButton(); const current = amount.closest('label')?.querySelector('.field-error'); const text = amountError(amount.value); if (current) current.textContent = text; else if (text) { const hint = amount.closest('label')?.querySelector('.field-hint'); hint?.insertAdjacentHTML('afterend', `<span class="field-error" role="alert">${text}</span>`) } })
  root.querySelector<HTMLInputElement>('#transfer-memo')?.addEventListener('input', (event) => { state.memo = (event.currentTarget as HTMLInputElement).value })
  root.querySelector<HTMLDivElement>('.modal')?.addEventListener('keydown', (event) => { if (event.key === 'Escape') { const closingAsset = !!state.selectedAsset; if (closingAsset) state.selectedAsset = ''; else state.dialog = ''; render(); if (closingAsset) { root.querySelector<HTMLButtonElement>(`[data-asset="${lastAssetTrigger}"]`)?.focus(); lastAssetTrigger = '' } } })
}
function updateContinueButton(): void {
  const value = Number(state.amount)
  const invalid = !state.recipient.trim() || state.recipient.trim().length < 2 || !value || value > state.balance || value < 0 || !!amountError(state.amount)
  const button = root.querySelector<HTMLButtonElement>('[data-action="review-transfer"]')
  if (button) button.disabled = invalid
}
render()
