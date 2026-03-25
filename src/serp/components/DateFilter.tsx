import type { DateRangeFilter } from '@/serp/types'

interface DateFilterProps {
  activeFilter: DateRangeFilter
  onFilterChange: (filter: DateRangeFilter) => void
  counts: Record<'week' | 'month' | 'year' | '3years', number>
  loading: boolean
}

const filters: { key: DateRangeFilter & string; label: string }[] = [
  { key: 'week', label: 'Past Week' },
  { key: 'month', label: 'Past Month' },
  { key: 'year', label: 'Past Year' },
  { key: '3years', label: 'Past 3 Years' },
]

const DateFilter = ({ activeFilter, onFilterChange, counts, loading }: DateFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => {
        const isActive = activeFilter === f.key
        return (
          <button
            key={f.key}
            onClick={() => onFilterChange(isActive ? null : f.key)}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
              isActive
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                isActive ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {loading ? '...' : counts[f.key]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default DateFilter
