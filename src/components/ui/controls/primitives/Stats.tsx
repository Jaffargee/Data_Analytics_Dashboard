import { StatCardProps } from "./types";
import StatCard from "./StatCard";

export default function Stats ({ stats }: { stats: StatCardProps[]; loading?: boolean }) {
      return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-4 py-4">
                  {
                        stats.map((stat, index) => (
                              <StatCard
                                    key={index}
                                    label={stat.label}
                                    value={stat.value}
                                    icon={stat.icon ?? <></>}
                                    trend={stat.trend ?? 0}
                                    delay={stat.delay ?? 0}
                                    accent={stat.accent ?? 'gold'}
                              />
                        ))
                  }
            </div>
      )
}
