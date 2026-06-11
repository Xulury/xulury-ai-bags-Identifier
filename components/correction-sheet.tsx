'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BRANDS } from '@/lib/catalogue'

interface CorrectionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    correctBrand: string
    correctModel: string
    note?: string
  }) => void
  submitting?: boolean
}

const selectClass =
  'h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function CorrectionSheet({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: CorrectionSheetProps) {
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [note, setNote] = useState('')

  const models = BRANDS.find((b) => b.name === brand)?.models ?? []

  function handleSubmit() {
    if (!brand || !model) return
    onSubmit({ correctBrand: brand, correctModel: model, note: note.trim() })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Bottom sheet on mobile, centered modal on desktop */}
      <DialogContent className="top-auto bottom-0 left-1/2 max-w-full -translate-y-0 rounded-b-none rounded-t-2xl data-closed:slide-out-to-bottom data-open:slide-in-from-bottom sm:top-1/2 sm:bottom-auto sm:max-w-md sm:-translate-y-1/2 sm:rounded-2xl sm:data-closed:slide-out-to-bottom-0 sm:data-open:slide-in-from-bottom-0">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">
            Manual Selection
          </DialogTitle>
          <DialogDescription>
            Select the correct bag manually to improve future results.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="correct-brand">Correct brand</Label>
            <select
              id="correct-brand"
              className={selectClass}
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value)
                setModel('')
              }}
            >
              <option value="" disabled>
                Select a brand
              </option>
              {BRANDS.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="correct-model">Correct model</Label>
            <select
              id="correct-model"
              className={selectClass}
              value={model}
              disabled={!brand}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="" disabled>
                {brand ? 'Select a model' : 'Choose a brand first'}
              </option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="correct-note">Optional note</Label>
            <Textarea
              id="correct-note"
              placeholder="Anything else that would help…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <Button
          size="lg"
          className="h-11 w-full rounded-full"
          disabled={!brand || !model || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Submitting…' : 'Submit Correction'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
