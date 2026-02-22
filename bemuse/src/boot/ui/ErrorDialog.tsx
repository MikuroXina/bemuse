import './ErrorDialog.scss'

export interface ErrorDialogProps {
  onClose: () => void
  message: string
  url?: string
  line?: number
  col?: number
  err?: Error
}

export default function ErrorDialog({
  onClose,
  message,
  url,
  line,
  col,
  err,
}: ErrorDialogProps) {
  return (
    <div className='ErrorDialog'>
      <h1>An error has occured!</h1>
      <p>{message}</p>
      {url && <p className='ErrorDialogのwhere'>{`${url}:${line}:${col}`}</p>}
      <pre>{err ? err.stack : 'No stack trace available'}</pre>
      <div className='ErrorDialogのclose' onClick={onClose}>
        &times;
      </div>
    </div>
  )
}
