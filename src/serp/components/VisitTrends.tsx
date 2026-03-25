import type { VisitTrend } from '@/serp/types'
import { formatVisits } from '@/shared/formatters'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface VisitTrendsProps {
    trends: VisitTrend[]
}

export default function VisitTrends({ trends }: VisitTrendsProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900">Visit Trends</h3>
                <p className="text-sm text-gray-500 mt-0.5">Recent website traffic trends over time</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/5">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-2 font-medium text-gray-500">Month</th>
                                <th className="text-right py-2 font-medium text-gray-500">Traffic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trends.map((t) => (
                                <tr key={t.month} className="border-b border-gray-50">
                                    <td className="py-2 text-gray-700">{t.month}</td>
                                    <td className="py-2 text-right text-gray-900 font-medium">{formatVisits(t.traffic)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="lg:w-3/5 h-[250px]">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={trends} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => formatVisits(v)}
                            />
                            <Tooltip
                                formatter={(value) => [formatVisits(Number(value)), 'Traffic']}
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Bar
                                dataKey="traffic"
                                fill="#10B981"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={48}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
