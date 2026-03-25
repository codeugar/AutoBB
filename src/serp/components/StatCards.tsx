import { BarChart3, FileText, Home, Globe } from 'lucide-react'
import type { PageTypeFilter } from '@/serp/types'

interface StatCardsProps {
  total: number
  innerPages: number
  homePages: number
  keywordDomains: number
  activeFilter: PageTypeFilter
  onFilterChange: (filter: PageTypeFilter) => void
}

const cards: {
  key: PageTypeFilter
  label: string
  icon: typeof BarChart3
  iconBg: string
  iconColor: string
  activeBorder: string
  activeBg: string
  countKey: 'total' | 'innerPages' | 'homePages' | 'keywordDomains'
}[] = [
  {
    key: 'all',
    label: 'Total Results',
    icon: BarChart3,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    activeBorder: 'border-emerald-400',
    activeBg: 'bg-emerald-50',
    countKey: 'total',
  },
  {
    key: 'inner',
    label: 'Inner Pages',
    icon: FileText,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    activeBorder: 'border-green-400',
    activeBg: 'bg-green-50',
    countKey: 'innerPages',
  },
  {
    key: 'home',
    label: 'Home Pages',
    icon: Home,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    activeBorder: 'border-teal-400',
    activeBg: 'bg-teal-50',
    countKey: 'homePages',
  },
  {
    key: 'keyword',
    label: 'Keyword Domains',
    icon: Globe,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    activeBorder: 'border-amber-400',
    activeBg: 'bg-amber-50',
    countKey: 'keywordDomains',
  },
]

const StatCards = ({ total, innerPages, homePages, keywordDomains, activeFilter, onFilterChange }: StatCardsProps) => {
  const counts = { total, innerPages, homePages, keywordDomains }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isActive = activeFilter === card.key
        return (
          <button
            key={card.key}
            onClick={() => onFilterChange(isActive ? 'all' : card.key)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
              isActive
                ? `${card.activeBg} ${card.activeBorder} shadow-sm`
                : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.iconBg}`}>
              <Icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-gray-900">{counts[card.countKey]}</div>
              <div className="text-xs text-gray-500 font-medium">{card.label}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default StatCards
