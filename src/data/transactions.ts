import type { Transaction } from '../types'

export const seedTransactions: Transaction[] = [
  { id: 'tx-1', merchant: 'Northstar Studio', detail: 'Client payment · INV-2084', category: 'Income', date: '2026-11-07T09:42:00', amount: 4850, kind: 'income', initials: 'N', tone: 'mint' },
  { id: 'tx-2', merchant: 'Whole Foods Market', detail: 'Groceries · Everyday', category: 'Groceries', date: '2026-11-06T18:26:00', amount: -84.32, kind: 'spending', initials: 'W', tone: 'peach' },
  { id: 'tx-3', merchant: 'Aster & Row', detail: 'Home · Contactless', category: 'Shopping', date: '2026-11-06T13:12:00', amount: -126, kind: 'spending', initials: 'A', tone: 'lavender' },
  { id: 'tx-4', merchant: 'Monthly savings', detail: 'From Everyday · Automatic', category: 'Transfer', date: '2026-11-05T08:00:00', amount: -650, kind: 'transfer', initials: '↗', tone: 'sky' },
  { id: 'tx-5', merchant: 'The New Yorker', detail: 'Subscription · Monthly', category: 'Lifestyle', date: '2026-11-04T10:04:00', amount: -12, kind: 'spending', initials: 'N', tone: 'sand' },
  { id: 'tx-6', merchant: 'Juniper Coffee', detail: 'Coffee · Contactless', category: 'Dining', date: '2026-11-03T08:38:00', amount: -8.75, kind: 'spending', initials: 'J', tone: 'peach' },
  { id: 'tx-7', merchant: 'Payroll · Fieldwork', detail: 'Salary · Monthly', category: 'Income', date: '2026-11-01T07:15:00', amount: 6200, kind: 'income', initials: 'F', tone: 'mint' },
  { id: 'tx-8', merchant: 'City of London', detail: 'Council tax · Direct debit', category: 'Home', date: '2026-10-30T06:00:00', amount: -184, kind: 'spending', initials: 'C', tone: 'sky' },
  { id: 'tx-9', merchant: 'Tide & Timber', detail: 'Dining · Contactless', category: 'Dining', date: '2026-10-28T20:11:00', amount: -46.8, kind: 'spending', initials: 'T', tone: 'lavender' },
  { id: 'tx-10', merchant: 'Studio Koto', detail: 'Design retainer · INV-103', category: 'Income', date: '2026-10-25T11:22:00', amount: 2200, kind: 'income', initials: 'K', tone: 'mint' },
]

export const cashFlow: Record<string, number[]> = {
  '1W': [46, 52, 48, 64, 58, 73, 68],
  '1M': [35, 48, 40, 62, 51, 73, 64, 81, 69, 77, 59, 85],
  '3M': [30, 43, 38, 59, 54, 68, 48, 73, 65, 84, 72, 91],
  '6M': [24, 38, 31, 54, 49, 62, 46, 72, 65, 81, 74, 92],
  '1Y': [18, 29, 24, 44, 38, 57, 49, 68, 61, 77, 70, 91],
}
