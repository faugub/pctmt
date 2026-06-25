import { SkeletonList, SkeletonPageHeader } from '@/components/ui/Skeleton'

export default function SessionsLoading() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <SkeletonPageHeader />
      <SkeletonList count={6} />
    </main>
  )
}
