'use client'

import { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'

interface SignaturePadProps {
  onSave: (signature: string) => void
  disabled?: boolean
}

export default function SignaturePad({ onSave, disabled = false }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null)

  const clear = () => {
    sigCanvas.current?.clear()
  }

  const save = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.toDataURL()
      onSave(dataUrl)
    }
  }

  return (
    <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          חתימה דיגיטלית
        </label>
        <div className="border border-gray-400 rounded">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: 'w-full h-40',
              style: { width: '100%', height: '160px' }
            }}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={clear}
          disabled={disabled}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          נקה
        </button>
        <button
          type="button"
          onClick={save}
          disabled={disabled}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          שמור חתימה
        </button>
      </div>
    </div>
  )
}