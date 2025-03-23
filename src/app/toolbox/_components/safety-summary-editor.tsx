'use client'

import { useState, useEffect } from 'react'
import { TipTapEditor } from '@/components/ui/tip-tap-text-editor'
import { createClient } from '@/database/utils/supabase/client'

interface SafetySummaryEditorProps {
  meetingId: string
  initialContent: string
}

export default function SafetySummaryEditor({ meetingId, initialContent }: SafetySummaryEditorProps) {
  const [content, setContent] = useState(initialContent)
  const supabase = createClient()

  // Auto-save changes when content changes
  useEffect(() => {
    // Skip auto-saving when component first mounts with initial content
    if (content === initialContent) return
    
    // Debounce the save operation
    const saveTimeout = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('toolbox_meetings')
          .update({ ai_safety_summary: content })
          .eq('id', meetingId)
        
        if (error) throw error
        
      } catch (error) {
        console.error('Error saving safety summary:', error)
      }
    }, 1500) // 1.5 second delay before saving

    // Cleanup timeout on changes
    return () => clearTimeout(saveTimeout)
  }, [content, meetingId, supabase, initialContent])

  return (
    <div className="space-y-2">
      <TipTapEditor
        content={content}
        onChange={setContent}
        editable={true}
        className="min-h-[300px]"
      />
    </div>
  )
} 