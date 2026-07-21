export default function SectionHeader({
      title,
      sub,
      action,
}: {
      title: string;
      sub?: string;
      action?: React.ReactNode;
}) {
      return (
            <div className="flex items-end justify-between mb-6">
                  <div>
                        <h2 className="font-display font-bold text-xl text-ink-primary">
                              {title}
                        </h2>
                        {sub && (
                              <p className="text-ink-muted text-sm mt-0.5 font-body">
                                    {sub}
                              </p>
                        )}
                  </div>
                  {action}
            </div>
      );
}
