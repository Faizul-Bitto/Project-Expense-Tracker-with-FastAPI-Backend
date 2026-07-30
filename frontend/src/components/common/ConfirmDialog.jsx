import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, confirmText = 'Confirm', variant = 'destructive' }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-base text-slate-800 dark:text-slate-200">{title || 'Confirm Action'}</DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {description || 'Are you sure you want to proceed?'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">
            Cancel
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="rounded-lg glossy-btn"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}