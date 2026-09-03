"use client";

import { CommentItem } from "./comment-item";
import { CommentSection } from "./comment-section";
import { ReplyInput } from "./reply-input";

interface Comment {
  id: string;
  author: string;
  text: string;
  likes: number;
  user_id: string | null;
  parent_id: string | null;
  created_at: string;
}

export function CommentThread({ comments, postId }: { comments: Comment[]; postId: string }) {
  const rootComments = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => c.parent_id);
  const getReplies = (parentId: string) => replies.filter((c) => c.parent_id === parentId);

  return (
    <div className="px-4 py-3">
      <p className="text-sm font-bold">댓글 {comments.length}</p>

      {comments.length === 0 ? (
        <p className="mt-4 text-center text-xs text-zinc-300">아직 댓글이 없습니다.</p>
      ) : (
        <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
          {rootComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem comment={comment} />
              {getReplies(comment.id).length > 0 && (
                <div className="ml-10 border-l border-zinc-100 dark:border-zinc-800">
                  {getReplies(comment.id).map((reply) => (
                    <CommentItem key={reply.id} comment={reply} isReply />
                  ))}
                </div>
              )}
              <ReplyInput postId={postId} parentId={comment.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentInput({ postId }: { postId: string }) {
  return <CommentSection postId={postId} />;
}
