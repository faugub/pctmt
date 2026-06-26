import { Skeleton, SkeletonList } from '@/components/ui/Skeleton'

export default function SearchLoading() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Skeleton className="h-7 w-24 mb-6" />
      <Skeleton className="h-12 w-full rounded-xl mb-8" />
      <SkeletonList count={4} />
    </main>
  )
}
