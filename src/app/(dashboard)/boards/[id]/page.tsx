import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TacticBoardEditor } from '@/components/ui/TacticBoardEditor'
import { DeleteBoardButton } from '@/components/ui/DeleteBoardButton'
import { renameBoard, type BoardData } from '@/app/actions/boards'

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: board, error } = await supabase
    .from('tactic_boards')
    .select('id, title, board_data, strategies(title)')
    .eq('id', id)
    .single()

  if (error || !board) notFound()

  const strategyTitle = (board.strategies as unknown as { title: string } | null)?.title
  const boardData = (board.board_data as BoardData) ?? { tokens: [], lines: [] }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">

      <Link href="/boards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Pizarras
      </Link>

      {/* Title + rename */}
      <div>
        <form action={renameBoard.bind(null, id)} className="flex items-center gap-2">
          <input
            name="title"
            defaultValue={board.title}
            className="text-2xl font-semibold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors px-0.5 -ml-0.5 flex-1"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-shrink-0"
          >
            Renombrar
          </button>
        </form>
        {strategyTitle && (
          <p className="text-sm text-muted-foreground mt-1">Vinculada a la estrategia &quot;{strategyTitle}&quot;</p>
        )}
      </div>

      {/* Editor */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
        <TacticBoardEditor boardId={id} initialData={boardData} />
      </div>

      {/* Delete */}
      <div className="pt-2 max-w-xs">
        <DeleteBoardButton id={id} title={board.title} />
      </div>

    </main>
  )
}
