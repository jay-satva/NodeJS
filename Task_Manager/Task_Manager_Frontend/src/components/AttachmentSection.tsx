import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import type{ Attachment, ApiResponse } from '../types'

interface Props {
  taskId: number
  token: string
  currentUserId: number
  taskOwnerId: number
}

// ─── Format file size ─────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── File icon by extension ───────────────────────────────────────────────────

function fileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    pdf: '📄', png: '🖼', jpg: '🖼', jpeg: '🖼', gif: '🖼', webp: '🖼',
    doc: '📝', docx: '📝', txt: '📝',
    xls: '📊', xlsx: '📊', csv: '📊',
    zip: '🗜', rar: '🗜', '7z': '🗜',
    mp4: '🎬', mov: '🎬', avi: '🎬',
    mp3: '🎵', wav: '🎵',
  }
  return map[ext ?? ''] ?? '📎'
}

export default function AttachmentSection({ taskId, token, currentUserId, taskOwnerId }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading]         = useState(true)
  const [uploading, setUploading]     = useState(false)
  const [error, setError]             = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  const fetchAttachments = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get<ApiResponse<Attachment[]>>(
        `/api/tasks/${taskId}/attachments`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.responseStatus === 1) setAttachments(data.result ?? [])
    } catch {
      setError('Failed to load attachments.')
    } finally {
      setLoading(false)
    }
  }, [taskId, token])

  useEffect(() => { fetchAttachments() }, [fetchAttachments])

  // ─── Upload (file → read as data URL, store URL + metadata) ───────────────
  // Since we have no file server, we store a local object URL as the URL.
  // In production this would upload to S3/Cloudinary first.

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      // Create a local object URL to simulate file storage
      const objectUrl = URL.createObjectURL(file)

      const { data } = await axios.post<ApiResponse<Attachment>>(
        `/api/tasks/${taskId}/attachments`,
        {
          url: objectUrl,
          fileName: file.name,
          size: file.size,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.responseStatus === 1 && data.result) {
        setAttachments(prev => [data.result!, ...prev])
      } else {
        setError(data.message)
      }
    } catch {
      setError('Failed to upload attachment.')
    } finally {
      setUploading(false)
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (attachmentId: number) => {
    if (!window.confirm('Delete this attachment?')) return
    try {
      await axios.delete(
        `/api/tasks/${taskId}/attachments/${attachmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAttachments(prev => prev.filter(a => a.id !== attachmentId))
    } catch {
      setError('Failed to delete attachment.')
    }
  }

  const canDelete = (attachment: Attachment) =>
    attachment.userId === currentUserId || taskOwnerId === currentUserId

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          margin: 0,
        }}>
          Attachments ({attachments.length})
        </h3>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          className="btn-icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{ fontSize: '12px' }}
        >
          {uploading
            ? <><span className="spinner" style={{ width: '12px', height: '12px' }} /> Uploading...</>
            : '+ Attach File'
          }
        </button>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: '12px' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
          <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} />
        </div>
      ) : attachments.length === 0 ? (
        <div style={{
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '13px',
        }}>
          No attachments yet. Click "Attach File" to add one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {attachments.map(att => (
            <div key={att.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              gap: '12px',
            }}>
              {/* Icon + info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>
                  {fileIcon(att.fileName)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                      maxWidth: '260px',
                    }}
                  >
                    {att.fileName}
                  </a>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '2px',
                  }}>
                    {formatSize(att.size)}
                    {att.user && ` · uploaded by ${att.user.name}`}
                  </div>
                </div>
              </div>

              {/* Delete */}
              {canDelete(att) && (
                <button
                  className="btn-danger"
                  style={{ fontSize: '11px', padding: '4px 10px', flexShrink: 0 }}
                  onClick={() => handleDelete(att.id)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}