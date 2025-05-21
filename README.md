
interface Schedule {
  id: number
  title: string
  description: string
  date: string        // ISO date string
  isActive: boolean   // false if cancelled
  mc: string | null
  host: string | null
  technicalOperator: string | null
  createdAt: string
  updatedAt: string
}