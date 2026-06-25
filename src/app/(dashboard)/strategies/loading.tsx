import { SkeletonChipRow, SkeletonList, SkeletonPageHeader } from '@/components/ui/Skeleton'

export default function StrategiesLoading() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <SkeletonPageHeader />
      <SkeletonChipRow count={5} />
      <SkeletonList count={6} />
    </main>
  )
}
