import Link from "next/link";

interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  commentCount: number;
}

export function BoardList({ posts }: { posts: Post[] }) {
  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={`/board/${post.id}`}
            className="flex flex-col gap-1 px-4 py-3 active:bg-zinc-50 dark:active:bg-zinc-900"
          >
            <p className="text-sm font-medium leading-snug">{post.title}</p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>{post.author}</span>
              <span>·</span>
              <span>{post.date}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                {post.views}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                {post.likes}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" /></svg>
                {post.commentCount}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
