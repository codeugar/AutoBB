import { useState, useEffect, useCallback, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import type { SerpResult, DomainData, PageTypeFilter, DateRangeFilter } from '@/serp/types'
import { searchSerpAll } from '@/serp/services/searchService'
import { getDomainData } from '@/serp/services/domainDataService'
import { getRegistrationDate } from '@/serp/services/whoisService'
import { extractDomain, isHomePage, domainContainsKeyword } from '@/serp/utils/helpers'
import { DEFAULT_COUNTRY, DEFAULT_LANGUAGE, DEFAULT_PER_PAGE } from '@/serp/utils/constants'
import SearchForm from '@/serp/components/SearchForm'
import StatCards from '@/serp/components/StatCards'
import DateFilter from '@/serp/components/DateFilter'
import ResultCard from '@/serp/components/ResultCard'
import RelatedSearches from '@/serp/components/RelatedSearches'
import Skeleton from '@/serp/components/Skeleton'

function getUrlParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    query: params.get('q') || '',
    country: params.get('country') || DEFAULT_COUNTRY,
    language: params.get('language') || DEFAULT_LANGUAGE,
    perPage: Number(params.get('perPage')) || DEFAULT_PER_PAGE,
  }
}

function getDateThreshold(range: 'week' | 'month' | 'year' | '3years'): Date {
  const now = new Date()
  switch (range) {
    case 'week':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    case 'year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    case '3years':
      return new Date(now.getFullYear() - 3, now.getMonth(), now.getDate())
  }
}

function isWithinDateRange(dateStr: string, range: 'week' | 'month' | 'year' | '3years'): boolean {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return false
  return date >= getDateThreshold(range)
}

const ResultsApp = () => {
  const urlParams = getUrlParams()

  const [results, setResults] = useState<SerpResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [domainDataMap, setDomainDataMap] = useState<Map<string, DomainData>>(new Map())
  const [searchLoading, setSearchLoading] = useState(false)
  const [domainLoading, setDomainLoading] = useState(false)
  const [pageTypeFilter, setPageTypeFilter] = useState<PageTypeFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(null)

  const [query, setQuery] = useState(urlParams.query)
  const [country, setCountry] = useState(urlParams.country)
  const [language, setLanguage] = useState(urlParams.language)
  const [perPage, setPerPage] = useState(urlParams.perPage)

  const fetchDomainData = useCallback(async (serpResults: SerpResult[]) => {
    const uniqueDomains = [...new Set(serpResults.map((r) => extractDomain(r.url)))]
    setDomainLoading(true)

    const fetchOne = async (domain: string) => {
      try {
        const [data, regDate] = await Promise.all([
          getDomainData(domain),
          getRegistrationDate(domain),
        ])
        const merged: DomainData = { ...data, registrationDate: regDate || data.registrationDate }
        setDomainDataMap((prev) => new Map(prev).set(domain, merged))
      } catch {
        // Domain data unavailable — leave entry absent
      }
    }

    // Batch in groups of 5 to avoid overwhelming APIs
    for (let i = 0; i < uniqueDomains.length; i += 5) {
      const batch = uniqueDomains.slice(i, i + 5)
      await Promise.all(batch.map(fetchOne))
    }

    setDomainLoading(false)
  }, [])

  const doSearch = useCallback(
    async (q: string, c: string, l: string, pp: number) => {
      setQuery(q)
      setCountry(c)
      setLanguage(l)
      setPerPage(pp)
      setResults([])
      setSuggestions([])
      setDomainDataMap(new Map())
      setPageTypeFilter('all')
      setDateFilter(null)
      setSearchLoading(true)

      // Update URL params without navigation
      const params = new URLSearchParams({ q, country: c, language: l, perPage: String(pp) })
      window.history.replaceState({}, '', `?${params.toString()}`)

      try {
        const response = await searchSerpAll(q, c, l, pp)
        const serpResults = response.data.results.map((r) => ({
          ...r,
          domain: extractDomain(r.url),
        }))
        setResults(serpResults)
        setSuggestions(response.data.suggestions || [])
        setSearchLoading(false)
        fetchDomainData(serpResults)
      } catch (err) {
        console.error('Search failed:', err)
        setSearchLoading(false)
      }
    },
    [fetchDomainData],
  )

  // Auto-search on mount if query param exists
  useEffect(() => {
    if (urlParams.query) {
      doSearch(urlParams.query, urlParams.country, urlParams.language, urlParams.perPage)
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stat counts
  const stats = useMemo(() => {
    const inner = results.filter((r) => !isHomePage(r.url)).length
    const home = results.filter((r) => isHomePage(r.url)).length
    const keyword = results.filter((r) => domainContainsKeyword(extractDomain(r.url), query)).length
    return { total: results.length, innerPages: inner, homePages: home, keywordDomains: keyword }
  }, [results, query])

  // Date filter counts
  const dateCounts = useMemo(() => {
    const count = (range: 'week' | 'month' | 'year' | '3years') =>
      results.filter((r) => {
        const domain = extractDomain(r.url)
        const data = domainDataMap.get(domain)
        return data?.registrationDate ? isWithinDateRange(data.registrationDate, range) : false
      }).length
    return { week: count('week'), month: count('month'), year: count('year'), '3years': count('3years') }
  }, [results, domainDataMap])

  // Filtered results
  const filteredResults = useMemo(() => {
    let filtered = results

    // Page type filter
    if (pageTypeFilter === 'inner') {
      filtered = filtered.filter((r) => !isHomePage(r.url))
    } else if (pageTypeFilter === 'home') {
      filtered = filtered.filter((r) => isHomePage(r.url))
    } else if (pageTypeFilter === 'keyword') {
      filtered = filtered.filter((r) => domainContainsKeyword(extractDomain(r.url), query))
    }

    // Date filter (AND logic with page type)
    if (dateFilter) {
      filtered = filtered.filter((r) => {
        const domain = extractDomain(r.url)
        const data = domainDataMap.get(domain)
        return data?.registrationDate ? isWithinDateRange(data.registrationDate, dateFilter) : false
      })
    }

    return filtered
  }, [results, pageTypeFilter, dateFilter, domainDataMap, query])

  return (
    <div className="bg-gray-50 min-h-screen" style={{ overflow: 'auto' }}>
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
            {query ? `${query} — SERP Analysis` : 'SERP Analysis'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {query
              ? `Analyzing search results for "${query}"`
              : 'Enter a keyword to analyze search engine results'}
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-6">
          <SearchForm
            initialQuery={query}
            initialCountry={country}
            initialLanguage={language}
            initialPerPage={perPage}
            onSearch={({ query: q, country: c, language: l, perPage: pp }) => doSearch(q, c, l, pp)}
            loading={searchLoading}
          />
        </div>

        {/* Loading skeleton for initial search */}
        {searchLoading && (
          <div className="space-y-4">
            {/* Stat cards skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                  <Skeleton width="40px" height="40px" rounded />
                  <div className="space-y-2">
                    <Skeleton width="48px" height="24px" />
                    <Skeleton width="80px" height="12px" />
                  </div>
                </div>
              ))}
            </div>
            {/* Result card skeletons */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton width="32px" height="32px" rounded />
                  <Skeleton width="32px" height="32px" className="rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton width="60%" height="20px" />
                    <Skeleton width="40%" height="14px" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton width="120px" height="28px" className="rounded-full" />
                  <Skeleton width="100px" height="28px" className="rounded-full" />
                  <Skeleton width="140px" height="28px" className="rounded-full" />
                </div>
                <Skeleton width="80%" height="16px" />
              </div>
            ))}
          </div>
        )}

        {/* Results loaded */}
        {!searchLoading && results.length > 0 && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <StatCards
              total={stats.total}
              innerPages={stats.innerPages}
              homePages={stats.homePages}
              keywordDomains={stats.keywordDomains}
              activeFilter={pageTypeFilter}
              onFilterChange={setPageTypeFilter}
            />

            {/* Date Filter */}
            <DateFilter
              activeFilter={dateFilter}
              onFilterChange={setDateFilter}
              counts={dateCounts}
              loading={domainLoading}
            />

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-700">{filteredResults.length}</span> of{' '}
                <span className="font-semibold text-gray-700">{results.length}</span> results
                {domainLoading && (
                  <span className="inline-flex items-center gap-1.5 ml-3 text-emerald-600">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading domain data...
                  </span>
                )}
              </p>
            </div>

            {/* Result Cards */}
            <div className="space-y-4">
              {filteredResults.map((result) => {
                const domain = extractDomain(result.url)
                return (
                  <ResultCard
                    key={`${result.position}-${result.url}`}
                    result={result}
                    domainData={domainDataMap.get(domain)}
                    domainLoading={domainLoading && !domainDataMap.has(domain)}
                    country={country}
                    language={language}
                  />
                )
              })}
            </div>

            {/* Empty filtered state */}
            {filteredResults.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <p className="text-gray-500">No results match the current filters.</p>
                <button
                  onClick={() => {
                    setPageTypeFilter('all')
                    setDateFilter(null)
                  }}
                  className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Related Searches */}
            {suggestions.length > 0 && (
              <RelatedSearches suggestions={suggestions} country={country} language={language} />
            )}
          </div>
        )}

        {/* No results state (after search completed with no results) */}
        {!searchLoading && results.length === 0 && query && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500 text-lg">No search results found for "{query}"</p>
            <p className="text-gray-400 text-sm mt-2">Try a different keyword or adjust your search parameters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsApp
