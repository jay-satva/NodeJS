import * as CommentRepo from "../repository/comment.repository";
import * as TaskRepo from "../repository/task.repository";

// ─── Helper: throw typed error ────────────────────────────────────────────────

const fail = (message: string, statusCode = 400) => {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  throw err;
};

// ─── Create Comment ───────────────────────────────────────────────────────────

export const createComment = async (
  taskId: number,
  userId: number,
  content: string
) => {
  if (!content || content.trim() === "") fail("Comment content is required.");

  // Verify the task exists — any authenticated user can comment on a visible task
  // We use findFirst without userId so any user can comment on any task they can see
  const task = await TaskRepo.getTaskById(taskId, userId);
  if (!task) fail("Task not found or access denied.", 404);

  return CommentRepo.createComment(taskId, userId, { content: content.trim() });
};

// ─── Get Comments For Task ────────────────────────────────────────────────────

export const getComments = async (taskId: number, userId: number) => {
  const task = await TaskRepo.getTaskById(taskId, userId);
  if (!task) fail("Task not found or access denied.", 404);
  const comments = await CommentRepo.getCommentsByTask(taskId)
  return comments.map((comment)=>({
    ...comment, reactionCounts: buildReactionCounts(comment.reactions)
  }))
  // return CommentRepo.getCommentsByTask(taskId);
};

// ─── Update Comment ───────────────────────────────────────────────────────────

export const updateComment = async (
  commentId: number,
  userId: number,
  content: string
) => {
  if (!content || content.trim() === "") fail("Comment content is required.");

  const comment = await CommentRepo.getCommentById(commentId);
  if (!comment) fail("Comment not found.", 404);

  if (comment!.userId !== userId) fail("You can edit only your comment", 404)
  const updated = await CommentRepo.updateComment(commentId, {content: content.trim()})
  return {...updated, reactionCounts: buildReactionCounts(updated.reactions)}
  // return CommentRepo.updateComment(commentId, { content: content.trim() });
};

// ─── Delete Comment ───────────────────────────────────────────────────────────

export const deleteComment = async (commentId: number, userId: number) => {
  const comment = await CommentRepo.getCommentById(commentId);
  if (!comment) fail("Comment not found.", 404);

  if (comment?.userId !== userId) fail("You can only delete your own comments.", 403);
  
  // return CommentRepo.deleteComment(commentId);
};