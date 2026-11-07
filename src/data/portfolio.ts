import type { PortfolioAsset, WatchAsset } from '../types/portfolio.js'

export const holdings: PortfolioAsset[] = [
  { id: 'aapl', symbol: 'AAPL', name: 'Apple Inc.', kind: 'Equity · Technology', assetClass: 'US equities', sector: 'Technology', risk: 'Growth', shares: 14.5, price: 192.46, costBasis: 157.25, dayChange: 31.82, color: '#95a6cc', history: [39, 43, 41, 50, 47, 54, 52, 62, 60, 69, 66, 76], note: 'A large-cap consumer technology company with global hardware and services revenue.' },
  { id: 'msft', symbol: 'MSFT', name: 'Microsoft Corp.', kind: 'Equity · Technology', assetClass: 'US equities', sector: 'Technology', risk: 'Growth', shares: 7.25, price: 421.08, costBasis: 375.62, dayChange: 48.1, color: '#76a994', history: [42, 45, 44, 51, 49, 58, 57, 62, 66, 70, 69, 78], note: 'A global software and cloud business with a broad enterprise customer base.' },
  { id: 'nvda', symbol: 'NVDA', name: 'NVIDIA Corp.', kind: 'Equity · Semiconductors', assetClass: 'US equities', sector: 'Semiconductors', risk: 'Higher growth', shares: 18, price: 134.70, costBasis: 118.40, dayChange: -32.40, color: '#8cae7b', history: [27, 34, 31, 46, 40, 54, 48, 65, 58, 73, 70, 77], note: 'A semiconductor designer focused on accelerated computing and graphics processors.' },
  { id: 'vwrp', symbol: 'VWRP', name: 'Vanguard FTSE All-World', kind: 'ETF · Global equities', assetClass: 'Global equities', sector: 'Multi-sector', risk: 'Moderate', shares: 22.4, price: 117.10, costBasis: 108.35, dayChange: 18.20, color: '#d5a77e', history: [44, 45, 48, 47, 52, 55, 53, 58, 61, 63, 67, 69], note: 'A broad index fund that tracks large and mid-sized companies across developed and emerging markets.' },
  { id: 'igls', symbol: 'IGLS', name: 'iShares UK Gilts 0–5yr', kind: 'ETF · Fixed income', assetClass: 'Fixed income', sector: 'Government bonds', risk: 'Lower volatility', shares: 100, price: 17.77, costBasis: 18.10, dayChange: 3.90, color: '#8fb8c1', history: [55, 54, 57, 56, 59, 58, 61, 60, 62, 61, 65, 65], note: 'Short-dated UK government bonds, included here to provide a steadier counterweight to equities.' },
]

export const watchAssets: WatchAsset[] = [
  { id: 'amzn', symbol: 'AMZN', name: 'Amazon.com, Inc.', kind: 'Equity · Consumer', price: 198.42, dayPercent: 1.24, color: '#d19d6e', history: [45, 48, 44, 50, 53, 49, 58, 55, 61, 65, 63, 72] },
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla, Inc.', kind: 'Equity · Automotive', price: 338.80, dayPercent: -0.86, color: '#d47e75', history: [72, 68, 75, 63, 67, 57, 61, 49, 55, 47, 51, 42] },
  { id: 'renw', symbol: 'RENW', name: 'L&G Clean Energy', kind: 'ETF · Clean energy', price: 8.74, dayPercent: 0.48, color: '#82a98c', history: [44, 45, 47, 43, 49, 50, 52, 48, 55, 57, 58, 62] },
]

export const portfolioHistory = {
  '1M': [38, 42, 40, 48, 45, 54, 51, 60, 57, 66, 64, 73],
  '3M': [29, 33, 38, 34, 42, 46, 44, 53, 57, 55, 66, 73],
  '1Y': [18, 21, 27, 25, 31, 38, 35, 44, 49, 48, 60, 73],
}
