'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Bold, Italic, Link as LinkIcon, List, Heading2, Undo, Redo } from 'lucide-react'
import { Button } from './button'

export interface RichTextEditorProps {
  content: string
  onChange?: (content: string) => void
  className?: string
  editable?: boolean
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-1 p-1 mb-1 border-b">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn('h-8 w-8 p-0', { 'bg-muted': editor.isActive('bold') })}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn('h-8 w-8 p-0', { 'bg-muted': editor.isActive('italic') })}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn('h-8 w-8 p-0', { 'bg-muted': editor.isActive('heading', { level: 2 }) })}
        aria-label="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn('h-8 w-8 p-0', { 'bg-muted': editor.isActive('bulletList') })}
        aria-label="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt('URL')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={cn('h-8 w-8 p-0', { 'bg-muted': editor.isActive('link') })}
        aria-label="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <div className="h-8 w-px mx-1 bg-muted" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="h-8 w-8 p-0"
        aria-label="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="h-8 w-8 p-0"
        aria-label="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function RichTextEditor({
  content,
  onChange,
  className,
  editable = true,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  // Handle server-side rendering
  if (!isMounted) {
    return (
      <div
        className={cn(
          'rounded-md border border-input bg-background min-h-[200px] text-sm',
          className
        )}
      >
        <div className="p-4 text-foreground leading-relaxed">
          <div 
            dangerouslySetInnerHTML={{ __html: content }} 
            className="prose prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-p:my-2 prose-li:text-foreground max-w-none"
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-md border border-input bg-background overflow-hidden',
        className
      )}
    >
      {editable && <MenuBar editor={editor} />}
      <EditorContent
        editor={editor}
        className={cn(
          'prose prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-p:my-2 prose-li:text-foreground max-w-none p-4 text-base leading-relaxed', 
          {
            'cursor-not-allowed opacity-60': !editable,
          }
        )}
      />
    </div>
  )
} 