import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import type { Comment, ApiResponse } from '../types'

interface Props {
  taskId: number
  token: string
  currentUserId: number
}

export default function CommentSection({ taskId, token, currentUserId }: Props) {
  const [comments, setComments]   = useState<Comment[]>([])
  const [loading, setLoading]     = useState(true)
  const [content, setContent]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [error, setError]         = useState('')

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get<ApiResponse<Comment[]>>(
        `/api/tasks/${taskId}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.responseStatus === 1) setComments(data.result ?? [])
    } catch {
      setError('Failed to load comments.')
    } finally {
      setLoading(false)
    }
  }, [taskId, token])

  useEffect(() => { fetchComments() }, [fetchComments])

  // ─── Add ───────────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const { data } = await axios.post<ApiResponse<Comment>>(
        `/api/tasks/${taskId}/comments`,
        { content: content.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.responseStatus === 1 && data.result) {
        setComments(prev => [data.result!, ...prev])
        setContent('')
      }
    } catch {
      setError('Failed to add comment.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Edit ──────────────────────────────────────────────────────────────────

  const handleEdit = async (commentId: number) => {
    if (!editContent.trim()) return
    try {
      const { data } = await axios.put<ApiResponse<Comment>>(
        `/api/tasks/${taskId}/comments/${commentId}`,
        { content: editContent.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.responseStatus === 1 && data.result) {
        setComments(prev => prev.map(c => c.id === commentId ? data.result! : c))
        setEditingId(null)
        setEditContent('')
      }
    } catch {
      setError('Failed to update comment.')
    }
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await axios.delete(
        `/api/tasks/${taskId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch {
      setError('Failed to delete comment.')
    }
  }

  // ─── Format time ───────────────────────────────────────────────────────────

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div>
      <h3 style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
        marginBottom: '14px',
      }}>
        Comments ({comments.length})
      </h3>

      {/* ── Add comment ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <textarea
          placeholder="Write a comment..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          style={{ resize: 'vertical', marginBottom: '8px' }}
          onKeyDown={e => {
            if (e.key === 'Enter' && e.ctrlKey) handleAdd()
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Ctrl+Enter to submit
          </span>
          <button
            className="btn-primary"
            onClick={handleAdd}
            disabled={submitting || !content.trim()}
            style={{ padding: '7px 16px', fontSize: '13px' }}
          >
            {submitting ? <><span className="spinner" /> Posting...</> : 'Post'}
          </button>
        </div>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: '12px' }}>{error}</div>}

      {/* ── Comment list ─────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
          <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} />
        </div>
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
          No comments yet. Be the first.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.map(comment => (
            <div key={comment.id} style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Avatar initial */}
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: '#0d1117',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {comment.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{comment.user.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>

                {/* Edit/Delete — only for author */}
                {comment.userId === currentUserId && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn-icon"
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                      onClick={() => {
                        setEditingId(comment.id)
                        setEditContent(comment.content)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                      onClick={() => handleDelete(comment.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Content or edit form */}
              {editingId === comment.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={3}
                    style={{ resize: 'vertical', marginBottom: '8px' }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '12px', padding: '5px 12px' }}
                      onClick={() => { setEditingId(null); setEditContent('') }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-primary"
                      style={{ fontSize: '12px', padding: '5px 12px' }}
                      onClick={() => handleEdit(comment.id)}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                }}>
                  {comment.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}