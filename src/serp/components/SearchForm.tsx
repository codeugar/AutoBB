import { useState } from 'react'
import { Search } from 'lucide-react'
import {
  COUNTRIES,
  LANGUAGES,
  PER_PAGE_OPTIONS,
  DEFAULT_COUNTRY,
  DEFAULT_LANGUAGE,
  DEFAULT_PER_PAGE,
} from '@/serp/utils/constants'

interface SearchFormProps {
  initialQuery?: string
  initialCountry?: string
  initialLanguage?: string
  initialPerPage?: number
  onSearch: (params: { query: string; country: string; language: string; perPage: number }) => void
  loading?: boolean
}

const SearchForm = ({
  initialQuery = '',
  initialCountry = DEFAULT_COUNTRY,
  initialLanguage = DEFAULT_LANGUAGE,
  initialPerPage = DEFAULT_PER_PAGE,
  onSearch,
  loading = false,
}: SearchFormProps) => {
  const [query, setQuery] = useState(initialQuery)
  const [country, setCountry] = useState(initialCountry)
  const [language, setLanguage] = useState(initialLanguage)
  const [perPage, setPerPage] = useState(initialPerPage)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    onSearch({ query: trimmed, country, language, perPage })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter keyword to analyze..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      <div className="flex gap-3 mt-3">
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>

        <select
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} results
            </option>
          ))}
        </select>
      </div>
    </form>
  )
}

export default SearchForm
