import { useCallback, useEffect, useRef, useState } from 'react'

import { AlertCircle, Loader2, Send, Sparkles } from 'lucide-react'

import type { ChatMessage, WorkspaceId } from '@/types/chat'

import { resolveChatIntent } from '@/lib/chat-intents'

import { useWorkspace } from '@/context/WorkspaceContext'

import { useAuth } from '@/context/AuthContext'

import { useAppConfig } from '@/context/AppConfigContext'

import { chatWithOllama, OllamaError, type OllamaChatMessage } from '@/lib/ollama/client'

import { buildCopilotSystemPrompt } from '@/lib/ollama/copilot-prompt'

import { parseCopilotResponse } from '@/lib/ollama/parse-action'

import { ollamaConfig } from '@/lib/ollama/config'

import { useOllamaStatus } from '@/hooks/useOllamaStatus'

import { ChatMessageBubble } from './ChatMessageBubble'

import { ChatWelcomeSummary } from './ChatWelcomeSummary'

import { QuickActions } from './QuickActions'



const workspaceLabels: Record<Exclude<WorkspaceId, null>, string> = {

  video: 'Open video',

  dashboard: 'Open dashboard',

  tracking: 'Open tracking',

  agents: 'Open agents',

  config: 'Open configuration',

  onboarding: 'Open configuration',

  forensic: 'Open video timeline',

  faces: 'Open face recognition',

  map: 'Open map',

  'camera-web': 'Open camera web UI',

  settings: 'Open settings',

}



function id() {

  return crypto.randomUUID()

}



function statusLabel(status: 'checking' | 'online' | 'offline', model: string, modelOk: boolean) {

  if (status === 'checking') return 'Connecting to Ollama…'

  if (status === 'offline') return 'Ollama offline — run ollama serve'

  if (!modelOk) return `${model} missing — ollama pull ${model}`

  return `${model} · Ollama`

}



export function ChatPanel() {

  const { openWorkspace } = useWorkspace()

  const { user, activitySince } = useAuth()

  const { cameras, alarms, incidents, storageSettings, faceProfiles, faceSettings } = useAppConfig()

  const { status, modelAvailable, model } = useOllamaStatus()

  const ollamaNote =
    status === 'online' && modelAvailable
      ? `\n\n_AI via Ollama (${model})._`
      : '\n\n_Ollama offline — intent matching still works._'

  const [messages, setMessages] = useState<ChatMessage[]>([])

  const [input, setInput] = useState('')

  const [loading, setLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {

    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

  }, [messages, loading])



  const fallbackReply = useCallback(

    (trimmed: string): ChatMessage => {

      const action = resolveChatIntent(trimmed)

      if (action) {
        if (action.workspace) openWorkspace(action.workspace, action.params)
        return {
          id: id(),
          role: 'assistant',
          content: `${action.reply}\n\n_(Ollama unavailable — simple intent matching.)_`,
          createdAt: new Date().toISOString(),
          workspaceHint: action.workspace,
          workspaceParams: action.params,
          actionLabel: action.workspace ? workspaceLabels[action.workspace] : undefined,
        }
      }

      return {

        id: id(),

        role: 'assistant',

        content:

          'Ollama did not respond. Check that `ollama serve` is running and the model exists (`ollama list`). You can try the quick actions below.',

        createdAt: new Date().toISOString(),

      }

    },

    [openWorkspace],

  )



  const send = useCallback(

    async (text: string) => {

      const trimmed = text.trim()

      if (!trimmed || loading) return



      const userMsg: ChatMessage = {

        id: id(),

        role: 'user',

        content: trimmed,

        createdAt: new Date().toISOString(),

      }



      setMessages((m) => [...m, userMsg])

      setInput('')

      setLoading(true)

      abortRef.current?.abort()

      abortRef.current = new AbortController()



      const useOllama = status === 'online' && modelAvailable



      if (!useOllama) {

        setMessages((m) => [...m, fallbackReply(trimmed)])

        setLoading(false)

        return

      }



      try {

        const history: OllamaChatMessage[] = [

          { role: 'system', content: buildCopilotSystemPrompt(cameras, alarms, storageSettings) },

          ...messages.map((m) => ({

              role: m.role as 'user' | 'assistant',

              content: m.content,

            })),

          { role: 'user', content: trimmed },

        ]



        const raw = await chatWithOllama(history, { signal: abortRef.current.signal })

        const { content, action } = parseCopilotResponse(raw)



        let workspaceHint: WorkspaceId | undefined
        let workspaceParams: Record<string, string> | undefined
        let actionLabel: string | undefined
        const finalContent = content || 'Done.'

        if (action) {
          if (action.workspace) {
            openWorkspace(action.workspace, action.params)
            workspaceHint = action.workspace
            workspaceParams = action.params
            actionLabel = workspaceLabels[action.workspace]
          }
        } else {
          const fallback = resolveChatIntent(trimmed)
          if (fallback) {
            if (fallback.workspace) {
              openWorkspace(fallback.workspace, fallback.params)
              workspaceHint = fallback.workspace
              workspaceParams = fallback.params
              actionLabel = workspaceLabels[fallback.workspace]
            }
          }
        }

        const assistantMsg: ChatMessage = {
          id: id(),
          role: 'assistant',
          content: finalContent,
          createdAt: new Date().toISOString(),
          workspaceHint,
          workspaceParams,
          actionLabel,
        }

        setMessages((m) => [...m, assistantMsg])

      } catch (err) {

        if (err instanceof DOMException && err.name === 'AbortError') return

        const hint =

          err instanceof OllamaError

            ? err.message

            : 'Could not reach Ollama.'

        setMessages((m) => [

          ...m,

          {

            id: id(),

            role: 'assistant',

            content: `${hint}\n\nTrying simple matching instead.`,

            createdAt: new Date().toISOString(),

          },

          fallbackReply(trimmed),

        ])

      } finally {

        setLoading(false)

      }

    },

    [loading, status, modelAvailable, messages, cameras, alarms, storageSettings, openWorkspace, fallbackReply],

  )



  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault()

    void send(input)

  }



  return (

    <div className="flex h-full min-h-0 flex-col">

      <div className="flex items-center gap-2 border-b border-slate-800/80 px-4 py-3">

        <Sparkles className="h-5 w-5 text-blue-400" />

        <div className="min-w-0 flex-1">

          <p className="text-sm font-semibold text-white">Smart Chat</p>

          <p

            className={`truncate text-xs ${

              status === 'online' && modelAvailable ? 'text-emerald-500' : 'text-amber-500'

            }`}

          >

            {statusLabel(status, model, modelAvailable)}

          </p>

        </div>

        {status === 'offline' && (

          <span title="Ollama offline">

            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />

          </span>

        )}

      </div>



      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {user ? (
          <ChatWelcomeSummary
            displayName={user.displayName}
            sinceLastLogin={activitySince}
            incidents={incidents}
            cameras={cameras}
            faceProfiles={faceProfiles}
            faceSettings={faceSettings}
            ollamaNote={ollamaNote}
            onOpenVideo={() => openWorkspace('video', { range: '48h', t: '50' })}
          />
        ) : (
          <ChatMessageBubble
            message={{
              id: 'welcome-guest',
              role: 'assistant',
              content: 'Sign in to see your activity summary.',
              createdAt: new Date().toISOString(),
            }}
          />
        )}

        {messages.map((msg) => (

          <ChatMessageBubble

            key={msg.id}

            message={msg}

            onOpenWorkspace={
              msg.workspaceHint
                ? () => openWorkspace(msg.workspaceHint!, msg.workspaceParams)
                : undefined
            }

          />

        ))}

        {loading && (

          <div className="flex items-center gap-2 text-sm text-slate-500">

            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />

            {ollamaConfig.model} is thinking…

          </div>

        )}

        <div ref={bottomRef} />

      </div>



      <div className="border-t border-slate-800/80 px-4 py-3">

        {messages.length === 0 && !loading && (

          <div className="mb-3">

            <QuickActions onSelect={(t) => void send(t)} />

          </div>

        )}

        <form onSubmit={handleSubmit} className="flex gap-2">

          <input

            type="text"

            value={input}

            onChange={(e) => setInput(e.target.value)}

            disabled={loading}

            placeholder="Ask Smart Chat (Qwen via Ollama)…"

            className="min-w-0 flex-1 rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 disabled:opacity-60"

          />

          <button

            type="submit"

            disabled={!input.trim() || loading}

            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40"

            aria-label="Send"

          >

            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}

          </button>

        </form>

      </div>

    </div>

  )

}

