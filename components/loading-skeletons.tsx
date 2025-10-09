import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[400px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>
      
      {/* Search skeleton */}
      <Skeleton className="h-10 w-[300px]" />
      
      {/* Table skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-[200px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-6 w-[400px]" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-[60px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        ))}
      </div>

      {/* Analytics cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                  <Skeleton className="h-4 w-[40px]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CalendarioSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-8 w-[180px]" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          
          <div className="flex gap-2">
            <Skeleton className="h-9 w-[120px] rounded-lg" />
            <Skeleton className="h-9 w-[80px] rounded-lg" />
          </div>
        </div>
      </div>

      {/* Calendario skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header días - Desktop */}
        <div className="hidden sm:grid grid-cols-7 border-b border-gray-200">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-4 text-center">
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
          ))}
        </div>
        
        {/* Vista móvil skeleton */}
        <div className="sm:hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-gray-100 last:border-b-0 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-6 w-6 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Vista desktop skeleton */}
        <div className="hidden sm:grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-[120px] border-r border-b border-gray-100 last:border-r-0 p-2">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-4" />
                {i % 5 === 0 && <Skeleton className="h-4 w-4 rounded-full" />}
              </div>
              {i % 3 === 0 && (
                <div className="space-y-1">
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}