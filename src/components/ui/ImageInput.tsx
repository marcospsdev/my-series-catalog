import { useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { uploadImage } from '../../lib/storage'
import { useAuth } from '../../contexts/AuthContext'

type Bucket = 'covers' | 'characters' | 'groups'

interface ImageInputProps {
  bucket: Bucket
  value: string
  onChange: (url: string) => void
  aspect?: 'portrait' | 'landscape' | 'square'
  multiple?: false
}

interface MultiImageInputProps {
  bucket: Bucket
  value: string[]
  onChange: (urls: string[]) => void
  aspect?: 'portrait' | 'landscape' | 'square'
  multiple: true
}

type Props = ImageInputProps | MultiImageInputProps

const ASPECT = {
  portrait:  'w-20 h-28',
  landscape: 'w-32 h-20',
  square:    'w-20 h-20',
}

export default function ImageInput(props: Props) {
  const { isGuest } = useAuth()
  const [tab, setTab] = useState<'upload' | 'url'>(isGuest ? 'url' : 'upload')
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const aspect = props.aspect ?? 'portrait'
  const isMulti = props.multiple === true

  const previews: string[] = isMulti
    ? (props as MultiImageInputProps).value
    : (props as ImageInputProps).value
    ? [(props as ImageInputProps).value]
    : []

  function removeImage(index: number) {
    if (isMulti) {
      const next = [...(props as MultiImageInputProps).value]
      next.splice(index, 1)
      ;(props as MultiImageInputProps).onChange(next)
    } else {
      ;(props as ImageInputProps).onChange('')
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    if (!isMulti) return
    const arr = [...(props as MultiImageInputProps).value]
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= arr.length) return
    ;[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]]
    ;(props as MultiImageInputProps).onChange(arr)
  }

  function applyUrl() {
    const url = urlInput.trim()
    if (!url) return
    if (isMulti) {
      ;(props as MultiImageInputProps).onChange([...(props as MultiImageInputProps).value, url])
    } else {
      ;(props as ImageInputProps).onChange(url)
    }
    setUrlInput('')
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setError(null)
    try {
      const urls = await Promise.all(Array.from(files).map((f) => uploadImage(props.bucket, f)))
      if (isMulti) {
        ;(props as MultiImageInputProps).onChange([...(props as MultiImageInputProps).value, ...urls])
      } else {
        ;(props as ImageInputProps).onChange(urls[0])
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro no upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Tabs — upload hidden in guest mode */}
      {!isGuest && (
        <div className="flex rounded-lg overflow-hidden border border-white/10 w-fit">
          {(['upload', 'url'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                tab === t
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon icon={t === 'upload' ? 'mdi:upload' : 'mdi:link-variant'} className="w-3.5 h-3.5" />
              {t === 'upload' ? 'Upload' : 'URL'}
            </button>
          ))}
        </div>
      )}

      {/* URL only label in guest mode */}
      {isGuest && (
        <div className="flex items-center gap-1.5 text-white/30 text-xs">
          <Icon icon="mdi:link-variant" className="w-3.5 h-3.5" />
          URL da imagem
        </div>
      )}

      {/* Upload tab */}
      {!isGuest && tab === 'upload' && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-colors"
        >
          {uploading ? (
            <Icon icon="mdi:loading" className="w-7 h-7 mx-auto text-violet-500 animate-spin" />
          ) : (
            <>
              <Icon icon="mdi:cloud-upload-outline" className="w-7 h-7 mx-auto text-white/30 mb-1" />
              <p className="text-white/40 text-sm">Clique para fazer upload</p>
              <p className="text-white/25 text-xs mt-0.5">PNG, JPG, WEBP</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple={isMulti}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* URL tab */}
      {(isGuest || tab === 'url') && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyUrl() } }}
            placeholder="https://..."
            className="flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-white/30"
          />
          <button
            type="button"
            onClick={applyUrl}
            disabled={!urlInput.trim()}
            className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Icon icon="mdi:check" className="w-4 h-4" />
            OK
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <Icon icon="mdi:alert-circle-outline" className="w-3.5 h-3.5" />
          {error}
        </p>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((url, i) => (
            <div key={i} className="relative group/thumb flex-shrink-0">
              <img
                src={url}
                alt=""
                className={`${ASPECT[aspect]} object-cover rounded-xl border-2 transition-colors ${
                  isMulti && i === 0 ? 'border-violet-500/60' : 'border-white/10'
                }`}
              />
              {isMulti && i === 0 && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                  Principal
                </span>
              )}
              {isMulti && previews.length > 1 && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    className="w-5 h-5 rounded bg-black/70 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-20 hover:bg-violet-600/80 transition-colors cursor-pointer"
                  >
                    <Icon icon="mdi:chevron-left" className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    disabled={i === previews.length - 1}
                    className="w-5 h-5 rounded bg-black/70 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-20 hover:bg-violet-600/80 transition-colors cursor-pointer"
                  >
                    <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-400 rounded-full w-5 h-5 items-center justify-center hidden group-hover/thumb:flex shadow-lg transition-colors cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isMulti && previews.length > 1 && (
        <p className="text-white/25 text-xs flex items-center gap-1">
          <Icon icon="mdi:information-outline" className="w-3.5 h-3.5" />
          Use as setas para reordenar. A primeira imagem é a capa do personagem.
        </p>
      )}
    </div>
  )
}
