export function CalendarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-16 bg-muted/50 mb-4 rounded-md" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square bg-muted/50 rounded-md" />
        ))}
      </div>
    </div>
  );
}
