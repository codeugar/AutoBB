import { Globe, ExternalLink, ArrowRight } from 'lucide-react'
import type { SerpResult, DomainData } from '@/serp/types'
import { extractDomain } from '@/serp/utils/helpers'
import { formatVisits, formatRank } from '@/shared/formatters'
import KeywordTag from './KeywordTag'
import Skeleton from './Skeleton'

interface ResultCardProps {
  result: SerpResult
  domainData: DomainData | undefined
  domainLoading: boolean
  country: string
  language: string
}

const FaviconImage = ({ domain }: { domain: string }) => {
  return (
    <img
      src={`https://favicon.im/${domain}`}
      alt=""
      width={32}
      height={32}
      className="rounded-md"
      onError={(e) => {
        const target = e.currentTarget
        target.style.display = 'none'
        target.nextElementSibling?.classList.remove('hidden')
      }}
    />
  )
}

const ResultCard = ({ result, domainData, domainLoading, country, language }: ResultCardProps) => {
  const domain = extractDomain(result.url)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      {/* Row 1: Rank + Favicon + Title + URL */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center justify-center">
          {result.position}
        </span>
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
          <FaviconImage domain={domain} />
          <Globe className="w-5 h-5 text-gray-400 hidden" />
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1 flex items-center gap-1.5"
          >
            {result.title}
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
          </a>
          <p className="text-sm text-emerald-600 truncate mt-0.5">{result.url}</p>
        </div>
      </div>

      {/* Row 2: Keywords (skeleton when loading) */}
      <div className="mt-4">
        {domainLoading ? (
          <div className="flex gap-2">
            <Skeleton width="120px" height="28px" className="rounded-full" />
            <Skeleton width="100px" height="28px" className="rounded-full" />
            <Skeleton width="140px" height="28px" className="rounded-full" />
            <Skeleton width="110px" height="28px" className="rounded-full" />
          </div>
        ) : domainData && domainData.topKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {domainData.topKeywords.slice(0, 5).map((kw) => (
              <KeywordTag key={kw.name} keyword={kw} country={country} language={language} />
            ))}
          </div>
        ) : null}
      </div>

      {/* Row 3: Metrics + Details link */}
      <div className="mt-4 flex items-center justify-between">
        {domainLoading ? (
          <div className="flex gap-6">
            <Skeleton width="100px" height="16px" />
            <Skeleton width="80px" height="16px" />
            <Skeleton width="90px" height="16px" />
            <Skeleton width="100px" height="16px" />
          </div>
        ) : domainData ? (
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
            <span>
              <span className="font-medium text-gray-700">Monthly Visits:</span>{' '}
              {formatVisits(domainData.monthlyVisits)}
            </span>
            <span>
              <span className="font-medium text-gray-700">Time on Site:</span> {domainData.timeOnSite}
            </span>
            <span>
              <span className="font-medium text-gray-700">Global Rank:</span> {formatRank(domainData.globalRank)}
            </span>
            {domainData.registrationDate && (
              <span>
                <span className="font-medium text-gray-700">Registered:</span> {domainData.registrationDate}
              </span>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-400">No domain data available</div>
        )}

        <a
          href={`domain.html?domain=${domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors ml-4"
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}

export default ResultCard
