import type { KeywordData } from '@/serp/types'

interface KeywordTagProps {
  keyword: KeywordData
  country: string
  language: string
}

const KeywordTag = ({ keyword, country, language }: KeywordTagProps) => {
  const handleClick = () => {
    const params = new URLSearchParams({ q: keyword.name, country, language })
    window.open(`results.html?${params.toString()}`, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium transition-colors cursor-pointer border border-emerald-100 hover:border-emerald-200"
    >
      <span className="font-semibold">{keyword.name}</span>
      <span className="text-emerald-500">{keyword.traffic.toLocaleString()}</span>
      <span className="text-emerald-400">· ${keyword.cpc.toFixed(2)}</span>
    </button>
  )
}

export default KeywordTag
