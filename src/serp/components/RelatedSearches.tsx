import { Search } from 'lucide-react'

interface RelatedSearchesProps {
  suggestions: string[]
  country: string
  language: string
}

const RelatedSearches = ({ suggestions, country, language }: RelatedSearchesProps) => {
  if (suggestions.length === 0) return null

  const handleClick = (query: string) => {
    const params = new URLSearchParams({ q: query, country, language })
    window.open(`results.html?${params.toString()}`, '_blank')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Related Searches</h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleClick(suggestion)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-lg text-sm font-medium transition-colors cursor-pointer border border-gray-200 hover:border-emerald-200"
          >
            <Search className="w-3.5 h-3.5" />
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

export default RelatedSearches
