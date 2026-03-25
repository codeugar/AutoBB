import type { RegionData } from '@/serp/types'
import { REGION_COLORS } from '@/serp/utils/constants'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface RegionDistributionProps {
    regions: RegionData[]
}

export default function RegionDistribution({ regions }: RegionDistributionProps) {
    const top5 = regions.slice(0, 5)

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900">Region Distribution</h3>
                <p className="text-sm text-gray-500 mt-0.5">Geographic distribution of website visitors</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/5">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-2 font-medium text-gray-500">Region</th>
                                <th className="text-right py-2 font-medium text-gray-500">Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top5.map((r, i) => (
                                <tr key={r.region} className="border-b border-gray-50">
                                    <td className="py-2 text-gray-700 flex items-center gap-2">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full inline-block"
                                            style={{ backgroundColor: REGION_COLORS[i] }}
                                        />
                                        {r.region}
                                    </td>
                                    <td className="py-2 text-right text-gray-900 font-medium">{r.percentage.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="lg:w-3/5 h-[250px]">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                            data={top5}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        >
                            <XAxis
                                type="number"
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <YAxis
                                type="category"
                                dataKey="region"
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                                width={75}
                            />
                            <Tooltip
                                formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Share']}
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Bar dataKey="percentage" radius={[0, 4, 4, 0]} maxBarSize={28}>
                                {top5.map((_, i) => (
                                    <Cell key={i} fill={REGION_COLORS[i % REGION_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
