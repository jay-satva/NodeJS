import type { Task, TaskStatus, TaskPriority } from '../types'

interface Props {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onView: (task: Task) => void
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; cls: string }> = {
    To_Do:       { label: 'To Do',       cls: 'badge-todo' },
    In_Progress: { label: 'In Progress', cls: 'badge-inprogress' },
    Done:        { label: 'Done',        cls: 'badge-done' },
  }
  const { label, cls } = map[status]
  return <span className={`badge ${cls}`}>{label}</span>
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const map: Record<TaskPriority, { label: string; cls: string }> = {
    Low:    { label: '↓ Low',    cls: 'badge-low' },
    Medium: { label: '→ Medium', cls: 'badge-medium' },
    High:   { label: '↑ High',  cls: 'badge-high' },
  }
  const { label, cls } = map[priority]
  return <span className={`badge ${cls}`}>{label}</span>
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function TaskTable({ tasks, onEdit, onDelete, onView }: Props) {
  if (tasks.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        color: 'var(--text-muted)', border: '1px dashed var(--border)',
        borderRadius: 'var(--radius-md)', marginTop: '16px',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>◻</div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          No tasks found. Create one to get started.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      overflowX: 'auto', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)', marginTop: '16px',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
            {['#', 'Title & Tags', 'Status', 'Priority', 'Due Date', 'Activity', 'Actions'].map(col => (
              <th key={col} style={{
                padding: '12px 16px', textAlign: 'left',
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap',
              }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, idx) => (
            <tr
              key={task.id}
              style={{
                borderBottom: idx < tasks.length - 1 ? '1px solid var(--border)' : 'none',
                background: 'var(--bg-surface)', transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
            >
              {/* ID */}
              <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                #{String(task.id).padStart(4, '0')}
              </td>

              {/* Title + tags */}
              <td style={{ padding: '14px 16px', maxWidth: '280px' }}>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {task.title}
                </div>
                {task.description && (
                  <div style={{
                    color: 'var(--text-muted)', fontSize: '12px',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', maxWidth: '260px', marginBottom: '4px',
                  }}>
                    {task.description}
                  </div>
                )}
                {task.tag && task.tag.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {task.tag.map(tt => (
                      <span key={tt.tagId} style={{
                        background: 'var(--accent-glow)',
                        border: '1px solid rgba(240,165,0,0.3)',
                        color: 'var(--accent)', borderRadius: '20px',
                        padding: '1px 8px', fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        #{tt.tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </td>

              {/* Status */}
              <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                <StatusBadge status={task.status} />
              </td>

              {/* Priority */}
              <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                <PriorityBadge priority={task.priority} />
              </td>

              {/* Due Date */}
              <td style={{
                padding: '14px 16px', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-mono)', fontSize: '12px',
                color: task.due_date ? 'var(--text-secondary)' : 'var(--text-muted)',
              }}>
                {formatDate(task.due_date)}
              </td>

              {/* Activity */}
              <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} title="Comments">
                    💬 {task._count?.comments ?? 0}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} title="Attachments">
                    📎 {task._count?.attachments ?? 0}
                  </span>
                </div>
              </td>

              {/* Actions */}
              <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-icon" onClick={() => onView(task)} title="View details">⊞ View</button>
                  <button className="btn-icon" onClick={() => onEdit(task)} title="Edit task">✎ Edit</button>
                  <button className="btn-danger" onClick={() => onDelete(task.id)} title="Delete task">✕</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}