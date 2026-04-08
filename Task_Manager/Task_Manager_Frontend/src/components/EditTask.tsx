import { useState, FormEvent } from 'react'
import axios from 'axios'
import type { Task, UpdateTaskPayload, TaskStatus, TaskPriority, ApiResponse } from '../types'

interface Props {
  task: Task
  onClose: () => void
  onUpdated: (task: Task) => void
}

export default function EditTask({ task, onClose, onUpdated }: Props) {
  const [title, setTitle]             = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [status, setStatus]           = useState<TaskStatus>(task.status)
  const [priority, setPriority]       = useState<TaskPriority>(task.priority)
  const [dueDate, setDueDate]         = useState(
    task.due_date ? task.due_date.slice(0, 10) : '' // Format as YYYY-MM-DD for input
  )
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Task title cannot be empty.')
      return
    }

    const payload: UpdateTaskPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      due_date: dueDate || undefined,
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const { data } = await axios.put<ApiResponse<Task>>(
        `/api/tasks/${task.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.responseStatus === 1 && data.result) {
        onUpdated(data.result)
        onClose()
      } else {
        setError(data.message)
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Failed to update task.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>Edit Task</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Task ID reference */}
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginBottom: '20px',
        }}>
          #TASK-{String(task.id).padStart(4, '0')}
        </p>

        {error && <div className="error-msg" style={{ marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="edit-title">Title *</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-desc">Description</label>
            <textarea
              id="edit-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label htmlFor="edit-status">Status</label>
              <select
                id="edit-status"
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
              >
                <option value="To_Do">To Do</option>
                <option value="In_Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-priority">Priority</label>
              <select
                id="edit-priority"
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-due">Due Date</label>
            <input
              id="edit-due"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}