export type TransactionKind = 'income' | 'spending' | 'transfer'

export interface Transaction {
  id: string
  merchant: string
  detail: string
  category: string
  date: string
  amount: number
  kind: TransactionKind
  initials: string
  tone: 'mint' | 'peach' | 'lavender' | 'sand' | 'sky'
}

export type RangeKey = '1W' | '1M' | '3M' | '6M' | '1Y'
