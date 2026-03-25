import { formatRank } from '@/shared/formatters'

interface DomainOverviewProps {
    domain: string
    siteName: string
    globalRank: number
    description: string
}

export default function DomainOverview({ domain, siteName, globalRank, description }: DomainOverviewProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <a
                        href={`https://${domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl font-bold text-gray-900 hover:text-emerald-600 transition-colors"
                    >
                        {domain}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">{siteName}</p>
                    <p className="text-gray-600 mt-3 leading-relaxed">{description}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold whitespace-nowrap">
                    {formatRank(globalRank)}
                </span>
            </div>
        </div>
    )
}
