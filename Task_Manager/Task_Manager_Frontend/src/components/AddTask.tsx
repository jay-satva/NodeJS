import { useState } from 'react'
import type {FormEvent} from 'react'
import axios from 'axios'
import type { Task, CreateTaskPayload, TaskStatus, TaskPriority, ApiResponse } from '../types'

interface Props {
  onClose: () => void
  onCreated: (task: Task) => void
}

export default function AddTask({ onClose, onCreated }: Props) {
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus]           = useState<TaskStatus>('To_Do')
  const [priority, setPriority]       = useState<TaskPriority>('Medium')
  const [dueDate, setDueDate]         = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Task title is required.')
      return
    }

    const payload: CreateTaskPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      due_date: dueDate || undefined,
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const { data } = await axios.post<ApiResponse<Task>>('/api/tasks', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.responseStatus === 1 && data.result) {
        onCreated(data.result)
        onClose()
      } else {
        setError(data.message)
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Failed to create task.')
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
          <h2>New Task</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="add-title">Title *</label>
            <input
              id="add-title"
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="add-desc">Description</label>
            <textarea
              id="add-desc"
              placeholder="Optional details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Row: Status + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label htmlFor="add-status">Status</label>
              <select
                id="add-status"
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
              >
                <option value="To_Do">To Do</option>
                <option value="In_Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="add-priority">Priority</label>
              <select
                id="add-priority"
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
            <label htmlFor="add-due">Due Date</label>
            <input
              id="add-due"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating...</> : '+ Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}