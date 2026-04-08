import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import type { Task, TaskTag, TaskStatus, TaskPriority, ApiResponse } from '../types'
import TaskTable from './TaskTable'
import AddTask from './AddTask'
import EditTask from './EditTask'
import TaskDetailPanel from './TaskDetailPanel'

type FilterStatus   = '' | TaskStatus
type FilterPriority = '' | TaskPriority

export default function TaskPage() {
  const navigate = useNavigate()

  const [tasks, setTasks]                   = useState<Task[]>([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState('')
  const [filterStatus, setFilterStatus]     = useState<FilterStatus>('')
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('')
  const [showAdd, setShowAdd]               = useState(false)
  const [editingTask, setEditingTask]       = useState<Task | null>(null)
  const [viewingTask, setViewingTask]       = useState<Task | null>(null)
  const [deletingId, setDeletingId]         = useState<number | null>(null)

  const userRaw  = localStorage.getItem('user') ?? '{}'
  const user     = JSON.parse(userRaw) as { id: number; name: string; email: string }
  const token    = localStorage.getItem('token') ?? ''

  // ─── Fetch Tasks ────────────────────────────────────────────────────────────

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {}
      if (filterStatus)   params.status   = filterStatus
      if (filterPriority) params.priority = filterPriority

      const { data } = await axios.get<ApiResponse<Task[]>>('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      })

      if (data.responseStatus === 1) {
        setTasks(data.result ?? [])
      } else {
        setError(data.message)
      }
    } catch {
      setError('Failed to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [token, filterStatus, filterPriority])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    }
  }

  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [task, ...prev])
  }

  const handleTaskUpdated = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
    // Keep detail panel in sync
    if (viewingTask?.id === updated.id) setViewingTask(prev => prev ? { ...prev, ...updated } : null)
  }

  const handleDelete = async (taskId: number) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return
    setDeletingId(taskId)
    try {
      await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTasks(prev => prev.filter(t => t.id !== taskId))
      if (viewingTask?.id === taskId) setViewingTask(null)
    } catch {
      alert('Failed to delete task.')
    } finally {
      setDeletingId(null)
    }
  }

  // When tags change inside the detail panel — update the task in the list too
  const handleTagsChanged = (taskId: number, tags: TaskTag[]) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, tag: tags } : t))
    setViewingTask(prev => prev && prev.id === taskId ? { ...prev, tag: tags } : prev)
  }

  // Open detail panel
  const handleView = (task: Task) => {
    setViewingTask(task)
  }

  // ─── Stats ──────────────────────────────────────────────────────────────────

  const stats = {
    total:      tasks.length,
    todo:       tasks.filter(t => t.status === 'To_Do').length,
    inProgress: tasks.filter(t => t.status === 'In_Progress').length,
    done:       tasks.filter(t => t.status === 'Done').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <header style={{
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
        padding: '0 32px', height: '60px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', background: 'var(--accent)',
            borderRadius: '5px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '14px',
          }}>✦</div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '15px' }}>
            TaskManager
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>{user.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {user.email}
            </div>
          </div>
          <button className="btn-secondary" onClick={handleLogout} style={{ padding: '7px 14px', fontSize: '13px' }}>
            Sign out
          </button>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>My Tasks</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            Manage and track your work
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total',       value: stats.total,      color: 'var(--text-primary)' },
            { label: 'To Do',       value: stats.todo,       color: 'var(--text-secondary)' },
            { label: 'In Progress', value: stats.inProgress, color: 'var(--info)' },
            { label: 'Done',        value: stats.done,       color: 'var(--success)' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '20px 24px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700,
                color: stat.color, lineHeight: 1, marginBottom: '6px',
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
              Status
            </label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)} style={{ width: 'auto', minWidth: '140px' }}>
              <option value="">All Statuses</option>
              <option value="To_Do">To Do</option>
              <option value="In_Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
              Priority
            </label>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as FilterPriority)} style={{ width: 'auto', minWidth: '140px' }}>
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {(filterStatus || filterPriority) && (
            <button className="btn-icon" onClick={() => { setFilterStatus(''); setFilterPriority('') }}>
              ✕ Clear filters
            </button>
          )}

          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-primary" onClick={() => setShowAdd(true)}>
              + New Task
            </button>
          </div>
        </div>

        {error && <div className="error-msg" style={{ marginTop: '16px' }}>{error}</div>}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', color: 'var(--text-muted)', gap: '12px' }}>
            <span className="spinner" style={{ width: '20px', height: '20px', borderTopColor: 'var(--accent)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>Loading tasks...</span>
          </div>
        ) : (
          <TaskTable
            tasks={tasks}
            onEdit={setEditingTask}
            onDelete={handleDelete}
            onView={handleView}
          />
        )}

        {deletingId !== null && (
          <div style={{
            position: 'fixed', bottom: '24px', right: '24px',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '12px 20px',
            display: 'flex', alignItems: 'center', gap: '10px',
            fontSize: '13px', color: 'var(--text-secondary)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 300,
          }}>
            <span className="spinner" style={{ borderTopColor: 'var(--danger)' }} />
            Deleting task...
          </div>
        )}
      </main>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showAdd && (
        <AddTask
          onClose={() => setShowAdd(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {editingTask && (
        <EditTask
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdated={handleTaskUpdated}
        />
      )}

      {/* ── Detail Panel ────────────────────────────────────────────────────── */}
      {viewingTask && (
        <TaskDetailPanel
          task={viewingTask}
          token={token}
          currentUserId={user.id}
          onClose={() => setViewingTask(null)}
          onTagsChanged={handleTagsChanged}
          onEdit={(task) => {
            setEditingTask(task)
            setViewingTask(null)
          }}
        />
      )}
    </div>
  )
}