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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href="/boards" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Pizarras
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Title + rename */}
        <div>
          <form action={renameBoard.bind(null, id)} className="flex items-center gap-2">
            <input
              name="title"
              defaultValue={board.title}
              className="text-2xl font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-400 focus:outline-none transition-colors px-0.5 -ml-0.5 flex-1"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:border-gray-400 transition-colors flex-shrink-0"
            >
              Renombrar
            </button>
          </form>
          {strategyTitle && (
            <p className="text-sm text-gray-500 mt-1">Vinculada a la estrategia &quot;{strategyTitle}&quot;</p>
          )}
        </div>

        {/* Editor */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <TacticBoardEditor boardId={id} initialData={boardData} />
        </div>

        {/* Delete */}
        <div className="pt-2 max-w-xs">
          <DeleteBoardButton id={id} title={board.title} />
        </div>

      </main>
    </div>
  )
}
