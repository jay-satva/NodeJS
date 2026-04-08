import { useEffect, useRef } from 'react'
import type { Task, TaskTag, TaskStatus, TaskPriority } from '../types'
import CommentSection from '../components/CommentSection'
import AttachmentSection from '../components/AttachmentSection'
import TagManager from '../components/TagManager'

interface Props {
  task: Task
  token: string
  currentUserId: number
  onClose: () => void
  onTagsChanged: (taskId: number, tags: TaskTag[]) => void
  onEdit: (task: Task) => void
}

// ─── Badge helpers (duplicated here to avoid prop drilling) ───────────────────

function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; color: string; bg: string }> = {
    To_Do:       { label: 'To Do',       color: 'var(--text-secondary)', bg: 'rgba(139,152,168,0.12)' },
    In_Progress: { label: 'In Progress', color: 'var(--info)',           bg: 'rgba(56,139,253,0.12)' },
    Done:        { label: 'Done',        color: 'var(--success)',        bg: 'rgba(63,185,80,0.12)' },
  }
  const { label, color, bg } = map[status]
  return (
    <span style={{
      background: bg, color, border: `1px solid ${color}33`,
      borderRadius: '20px', padding: '3px 12px',
      fontSize: '12px', fontFamily: 'var(--font-mono)',
    }}>
      {label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const map: Record<TaskPriority, { label: string; color: string; bg: string }> = {
    Low:    { label: '↓ Low',    color: 'var(--success)', bg: 'rgba(63,185,80,0.12)' },
    Medium: { label: '→ Medium', color: 'var(--warning)', bg: 'rgba(210,153,34,0.12)' },
    High:   { label: '↑ High',  color: 'var(--danger)',  bg: 'rgba(248,81,73,0.12)' },
  }
  const { label, color, bg } = map[priority]
  return (
    <span style={{
      background: bg, color, border: `1px solid ${color}33`,
      borderRadius: '20px', padding: '3px 12px',
      fontSize: '12px', fontFamily: 'var(--font-mono)',
    }}>
      {label}
    </span>
  )
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export default function TaskDetailPanel({
  task, token, currentUserId, onClose, onTagsChanged, onEdit,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 200,
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* ── Panel ─────────────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: '520px',
          maxWidth: '100vw',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 201,
          overflowY: 'auto',
          animation: 'slideInRight 0.22s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Panel Header ──────────────────────────────────────────────── */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-surface)',
          zIndex: 10,
        }}>
          <div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
            }}>
              #TASK-{String(task.id).padStart(4, '0')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-icon" onClick={() => onEdit(task)} style={{ fontSize: '12px' }}>
              ✎ Edit
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-muted)', fontSize: '18px',
                cursor: 'pointer', padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Panel Body ────────────────────────────────────────────────── */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Title + Description */}
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '8px', lineHeight: 1.3 }}>
              {task.title}
            </h2>
            {task.description && (
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '14px',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>
                {task.description}
              </p>
            )}
          </div>

          {/* Meta row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            {[
              { label: 'Status',   value: <StatusBadge status={task.status} /> },
              { label: 'Priority', value: <PriorityBadge priority={task.priority} /> },
              { label: 'Due Date', value: <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{formatDate(task.due_date)}</span> },
              { label: 'Created',  value: <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{formatDate(task.createdAt)}</span> },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
              }}>
                <div style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                }}>
                  {label}
                </div>
                {value}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* Tags */}
          <TagManager
            taskId={task.id}
            token={token}
            assignedTags={task.tag ?? []}
            onTagsChanged={(tags) => onTagsChanged(task.id, tags)}
          />

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* Attachments */}
          <AttachmentSection
            taskId={task.id}
            token={token}
            currentUserId={currentUserId}
            taskOwnerId={task.userId}
          />

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* Comments */}
          <CommentSection
            taskId={task.id}
            token={token}
            currentUserId={currentUserId}
          />

        </div>
      </div>

      {/* Panel slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </>
  )
}