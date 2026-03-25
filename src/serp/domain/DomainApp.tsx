import { useState, useEffect, useCallback } from 'react'
import type { DomainData } from '@/serp/types'
import { getDomainData } from '@/serp/services/domainDataService'
import { getRegistrationDate } from '@/serp/services/whoisService'
import { parseDomain } from '@/shared/formatters'
import DomainOverview from '@/serp/components/DomainOverview'
import MetricsCards from '@/serp/components/MetricsCards'
import VisitTrends from '@/serp/components/VisitTrends'
import TrafficSources from '@/serp/components/TrafficSources'
import RegionDistribution from '@/serp/components/RegionDistribution'
import TopKeywords from '@/serp/components/TopKeywords'

function Skeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="h-3 bg-gray-200 rounded w-20 mb-3" />
                        <div className="h-6 bg-gray-200 rounded w-16" />
                    </div>
                ))}
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="h-5 bg-gray-200 rounded w-36 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-64 mb-4" />
                    <div className="h-[200px] bg-gray-100 rounded" />
                </div>
            ))}
        </div>
    )
}

export default function DomainApp() {
    const [domain, setDomain] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [domainData, setDomainData] = useState<DomainData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Parse initial domain from URL params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const d = params.get('domain')
        if (d) {
            const parsed = parseDomain(d)
            setDomain(parsed)
            setInputValue(parsed)
        }
    }, [])

    const fetchDomainData = useCallback(async (d: string) => {
        setLoading(true)
        setError(null)
        setDomainData(null)

        try {
            const [data, regDate] = await Promise.all([
                getDomainData(d),
                getRegistrationDate(d),
            ])
            data.registrationDate = regDate
            setDomainData(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch domain data')
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch when domain changes
    useEffect(() => {
        if (domain) {
            fetchDomainData(domain)
        }
    }, [domain, fetchDomainData])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const parsed = parseDomain(inputValue)
        if (parsed) {
            setDomain(parsed)
            setInputValue(parsed)
            // Update URL without reload
            const url = new URL(window.location.href)
            url.searchParams.set('domain', parsed)
            window.history.pushState({}, '', url.toString())
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-[1200px] mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                        Domain Analysis
                    </h1>
                    <p className="text-gray-500 mt-1">Analyze website traffic, keywords, and audience data</p>
                </div>

                {/* Domain Input */}
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Enter domain (e.g., openai.com)"
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all text-sm"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || loading}
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm whitespace-nowrap"
                        >
                            {loading ? 'Analyzing...' : 'Analyze Traffic'}
                        </button>
                    </div>
                </form>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading && <Skeleton />}

                {/* Content */}
                {domainData && !loading && (
                    <div className="space-y-6">
                        <DomainOverview
                            domain={domain}
                            siteName={domainData.siteName}
                            globalRank={domainData.globalRank}
                            description={domainData.description}
                        />

                        <MetricsCards
                            monthlyVisits={domainData.monthlyVisits}
                            timeOnSite={domainData.timeOnSite}
                            pagesPerVisit={domainData.pagesPerVisit}
                            bounceRate={domainData.bounceRate}
                            registrationDate={domainData.registrationDate}
                        />

                        <VisitTrends trends={domainData.visitTrends} />

                        <TrafficSources sources={domainData.trafficSources} />

                        <RegionDistribution regions={domainData.regionDistribution} />

                        <TopKeywords keywords={domainData.topKeywords} />
                    </div>
                )}

                {/* Empty state */}
                {!domain && !loading && (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 mb-4">
                            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-lg">Enter a domain above to analyze its traffic</p>
                    </div>
                )}
            </div>
        </div>
    )
}
