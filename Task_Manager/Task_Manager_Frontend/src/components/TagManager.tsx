import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import type { Tag, TaskTag, ApiResponse } from '../types'

interface Props {
  taskId: number
  token: string
  assignedTags: TaskTag[]
  onTagsChanged: (tags: TaskTag[]) => void
}

export default function TagManager({ taskId, token, assignedTags, onTagsChanged }: Props) {
  const [allTags, setAllTags]     = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [creating, setCreating]   = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError]         = useState('')

  // ─── Fetch all global tags ─────────────────────────────────────────────────

  const fetchAllTags = useCallback(async () => {
    try {
      const { data } = await axios.get<ApiResponse<Tag[]>>('/api/tags', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (data.responseStatus === 1) setAllTags(data.result ?? [])
    } catch {
      setError('Failed to load tags.')
    }
  }, [token])

  useEffect(() => { fetchAllTags() }, [fetchAllTags])

  // ─── Create new global tag ─────────────────────────────────────────────────

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    setCreating(true)
    setError('')
    try {
      const { data } = await axios.post<ApiResponse<Tag>>(
        '/api/tags',
        { name: newTagName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.responseStatus === 1 && data.result) {
        setAllTags(prev => [...prev, data.result!].sort((a, b) => a.name.localeCompare(b.name)))
        setNewTagName('')
      } else {
        setError(data.message)
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Failed to create tag.')
      }
    } finally {
      setCreating(false)
    }
  }

  // ─── Assign tag to task ────────────────────────────────────────────────────

  const handleAssign = async (tag: Tag) => {
    setAssigning(true)
    setError('')
    try {
      const { data } = await axios.post<ApiResponse<{ count: number }>>(
        `/api/tasks/${taskId}/tags`,
        { tagIds: [tag.id] },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.responseStatus === 1) {
        const newTaskTag: TaskTag = { taskId, tagId: tag.id, tag }
        onTagsChanged([...assignedTags, newTaskTag])
      }
    } catch {
      setError('Failed to assign tag.')
    } finally {
      setAssigning(false)
    }
  }

  // ─── Remove tag from task ──────────────────────────────────────────────────

  const handleRemove = async (tagId: number) => {
    try {
      await axios.delete(
        `/api/tasks/${taskId}/tags/${tagId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onTagsChanged(assignedTags.filter(tt => tt.tagId !== tagId))
    } catch {
      setError('Failed to remove tag.')
    }
  }

  const assignedTagIds = new Set(assignedTags.map(tt => tt.tagId))
  const unassignedTags = allTags.filter(t => !assignedTagIds.has(t.id))

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
        Tags
      </h3>

      {error && <div className="error-msg" style={{ marginBottom: '10px' }}>{error}</div>}

      {/* ── Assigned tags ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px', minHeight: '28px' }}>
        {assignedTags.length === 0 ? (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No tags assigned.</span>
        ) : (
          assignedTags.map(tt => (
            <span
              key={tt.tagId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'var(--accent-glow)',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                borderRadius: '20px',
                padding: '3px 10px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              #{tt.tag.name}
              <button
                onClick={() => handleRemove(tt.tagId)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '12px',
                  lineHeight: 1,
                  opacity: 0.7,
                }}
                title="Remove tag"
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>

      {/* ── Add from existing tags ────────────────────────────────────────── */}
      {unassignedTags.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Add existing tag
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {unassignedTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleAssign(tag)}
                disabled={assigning}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  borderRadius: '20px',
                  padding: '3px 10px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.color = 'var(--accent)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                + #{tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Create new tag ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Create new tag..."
          value={newTagName}
          onChange={e => setNewTagName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCreateTag() }}
          style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
        />
        <button
          className="btn-secondary"
          onClick={handleCreateTag}
          disabled={creating || !newTagName.trim()}
          style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
        >
          {creating ? <span className="spinner" /> : '+ Create'}
        </button>
      </div>
    </div>
  )
}