
export default function EmptyState({
      message = 'No data available',
}: {
      message?: string;
}) {
      return (
            <div className="flex flex-col items-center justify-center py-16 text-ink-faint gap-2">
                  <span className="text-3xl">⬜</span>
                  <p className="text-sm font-body">{message}</p>
            </div>
      );
}