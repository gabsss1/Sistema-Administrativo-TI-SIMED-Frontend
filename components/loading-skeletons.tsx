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