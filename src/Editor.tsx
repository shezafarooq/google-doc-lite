import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

type Props = { content: any; onChange: (content: any) => void }
export default function Editor({ content, onChange }: Props) {
  const editor = useEditor({ extensions: [StarterKit, Underline], content, onUpdate: ({editor}) => onChange(editor.getJSON()) })
  useEffect(() => { if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) editor.commands.setContent(content) }, [editor, content])
  if (!editor) return null
  const button = (label: string, active: boolean, action: () => void, title: string) => <button className={active ? 'active' : ''} aria-pressed={active} onClick={action} title={title} type="button">{label}</button>
  return <>
    <div className="toolbar" role="toolbar" aria-label="Text formatting">
      <div className="toolbar-group">
        <select aria-label="Text style" title="Change text style" value={editor.isActive('heading', {level: 1}) ? 'h1' : editor.isActive('heading', {level: 2}) ? 'h2' : 'p'} onChange={e => e.target.value === 'h1' ? editor.chain().focus().setHeading({level: 1}).run() : e.target.value === 'h2' ? editor.chain().focus().setHeading({level: 2}).run() : editor.chain().focus().setParagraph().run()}>
          <option value="p">Normal text</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option>
        </select>
      </div>
      <div className="toolbar-group">
        {button('B', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Bold (Ctrl+B)')}
        {button('I', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Italic (Ctrl+I)')}
        {button('U', editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'Underline (Ctrl+U)')}
      </div>
      <div className="toolbar-group">
        {button('• List', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'Bullet list')}
        {button('1. List', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Numbered list')}
      </div>
      <div className="toolbar-group subtle">
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">↶</button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">↷</button>
      </div>
    </div>
    <div className="paper"><EditorContent editor={editor} /></div>
  </>
}
