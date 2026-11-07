export type PortfolioClass = 'US equities' | 'Global equities' | 'Fixed income'
export type RiskLevel = 'Moderate' | 'Growth' | 'Higher growth' | 'Lower volatility'
export type PortfolioRange = '1M' | '3M' | '1Y'

export interface PortfolioAsset {
  id: string
  symbol: string
  name: string
  kind: string
  assetClass: PortfolioClass
  sector: string
  risk: RiskLevel
  shares: number
  price: number
  costBasis: number
  dayChange: number
  color: string
  history: number[]
  note: string
}

export interface WatchAsset {
  id: string
  symbol: string
  name: string
  kind: string
  price: number
  dayPercent: number
  color: string
  history: number[]
}
