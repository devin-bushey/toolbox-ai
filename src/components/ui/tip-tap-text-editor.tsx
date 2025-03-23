'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useEffect } from 'react'
import { cn } from '@//tools/utils'
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Heading2, 
  Undo, 
  Redo,
  Quote,
  Code,
  Pilcrow
} from 'lucide-react'
import { Button } from './button'

export interface TipTapEditorProps {
  content: string
  onChange?: (content: string) => void
  className?: string
  editable?: boolean
  placeholder?: string
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
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn('h-8 w-8 p-0', { 'bg-muted': editor.isActive('orderedList') })}
        aria-label="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn('h-8 w-8 p-0', { 'bg-muted': editor.isActive('blockquote') })}
        aria-label="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn('h-8 w-8 p-0', { 'bg-muted': editor.isActive('codeBlock') })}
        aria-label="Code Block"
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={cn('h-8 w-8 p-0', { 'bg-muted': editor.isActive('paragraph') })}
        aria-label="Paragraph"
      >
        <Pilcrow className="h-4 w-4" />
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

export function TipTapEditor({
  content,
  onChange,
  className,
  editable = true,
  placeholder = 'Write something...',
}: TipTapEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-md bg-muted/50 p-2 font-mono',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-muted pl-4 italic',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
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
        <div className="p-4">
          <div 
            dangerouslySetInnerHTML={{ __html: content }} 
            className="prose prose-sm dark:prose-invert prose-neutral max-w-none"
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
          'prose-sm dark:prose-invert prose-neutral max-w-none p-4', 
          'prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg',
          'prose-p:my-2 prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          'prose-strong:font-bold prose-pre:rounded-md prose-pre:bg-muted/50 prose-pre:p-2',
          'prose-ul:pl-5 prose-ol:pl-5 prose-li:my-0.5',
          {
            'cursor-not-allowed opacity-60': !editable,
            'min-h-[200px]': editable,
            'tiptap-editor': true,
          }
        )}
      />
    </div>
  )
} 