/**
 * Skeleton loader para el menú
 * Mejora la percepción de velocidad de carga
 */
export function MenuSkeleton() {
  return (
    <div className="container-custom py-8">
      {/* Header skeleton */}
      <div className="text-center mb-8">
        <div className="h-12 w-64 bg-charcoal-light rounded-lg mx-auto mb-3 animate-pulse" />
        <div className="h-4 w-48 bg-charcoal-light rounded mx-auto animate-pulse" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-3 mb-8">
        {Array.from({ length: 4 }, (_, i) => `tab-${crypto.randomUUID()}`).map(
          (id) => (
            <div
              key={id}
              className="h-12 w-24 bg-charcoal-light rounded-lg animate-pulse"
            />
          )
        )}
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 6 }, (_, i) => `card-${crypto.randomUUID()}`).map(
          (id) => (
            <div key={id} className="glass-card overflow-hidden">
              <div className="h-48 bg-charcoal-light animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-charcoal-light rounded animate-pulse" />
                <div className="h-4 bg-charcoal-light rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-charcoal-light rounded w-1/2 animate-pulse" />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
