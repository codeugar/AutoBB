import type { KeywordData } from '@/serp/types'
import { formatNumber } from '@/shared/formatters'

interface TopKeywordsProps {
    keywords: KeywordData[]
}

export default function TopKeywords({ keywords }: TopKeywordsProps) {
    const top10 = keywords.slice(0, 10)

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900">Top Keywords</h3>
                <p className="text-sm text-gray-500 mt-0.5">Main keywords driving traffic to this website</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left py-2.5 font-medium text-gray-500">Keyword</th>
                            <th className="text-right py-2.5 font-medium text-gray-500">Traffic</th>
                            <th className="text-right py-2.5 font-medium text-gray-500">Volume</th>
                            <th className="text-right py-2.5 font-medium text-gray-500">CPC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {top10.map((kw, i) => (
                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="py-2.5">
                                    <a
                                        href={`results.html?q=${encodeURIComponent(kw.name)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
                                    >
                                        {kw.name}
                                    </a>
                                </td>
                                <td className="py-2.5 text-right text-gray-900">{formatNumber(kw.traffic)}</td>
                                <td className="py-2.5 text-right text-gray-900">{formatNumber(kw.volume)}</td>
                                <td className="py-2.5 text-right text-gray-900">${kw.cpc.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
