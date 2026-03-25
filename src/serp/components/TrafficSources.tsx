import type { TrafficSource } from '@/serp/types'
import { TRAFFIC_SOURCE_COLORS } from '@/serp/utils/constants'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

interface TrafficSourcesProps {
    sources: TrafficSource[]
}

const SOURCE_LABELS: Record<string, string> = {
    search: 'Search',
    direct: 'Direct',
    referrals: 'Referrals',
    social: 'Social',
    paid_referrals: 'Paid Referrals',
    mail: 'Mail',
}

export default function TrafficSources({ sources }: TrafficSourcesProps) {
    const chartData = sources.map((s) => ({
        name: SOURCE_LABELS[s.source] || s.source,
        value: s.share,
        color: TRAFFIC_SOURCE_COLORS[s.source] || '#9CA3AF',
    }))

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900">Traffic Sources</h3>
                <p className="text-sm text-gray-500 mt-0.5">Main traffic sources for this website</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/5">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-2 font-medium text-gray-500">Source</th>
                                <th className="text-right py-2 font-medium text-gray-500">Share %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sources.map((s) => (
                                <tr key={s.source} className="border-b border-gray-50">
                                    <td className="py-2 text-gray-700 flex items-center gap-2">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full inline-block"
                                            style={{ backgroundColor: TRAFFIC_SOURCE_COLORS[s.source] }}
                                        />
                                        {SOURCE_LABELS[s.source] || s.source}
                                    </td>
                                    <td className="py-2 text-right text-gray-900 font-medium">{s.share.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="lg:w-3/5 h-[280px]">
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="45%"
                                outerRadius={85}
                                innerRadius={40}
                                dataKey="value"
                                label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                                labelLine={{ stroke: '#D1D5DB' }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Share']}
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                iconSize={8}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
