export default function PostLoading() {
  return (
    <div className="flex h-full flex-col">
      <header className="relative flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 px-4 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <div className="absolute left-4 h-5 w-5 rounded bg-zinc-100 dark:bg-zinc-800" />
        <h1 className="text-base font-semibold">게시글</h1>
      </header>

      <main className="flex-1 animate-pulse overflow-y-auto p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800" />
          <div>
            <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="mt-1 h-3 w-16 rounded bg-zinc-50 dark:bg-zinc-800/50" />
          </div>
        </div>
        <div className="mt-4 h-5 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="mt-3 h-4 w-full rounded bg-zinc-50 dark:bg-zinc-800/50" />
        <div className="mt-2 h-4 w-2/3 rounded bg-zinc-50 dark:bg-zinc-800/50" />
      </main>
    </div>
  );
}
