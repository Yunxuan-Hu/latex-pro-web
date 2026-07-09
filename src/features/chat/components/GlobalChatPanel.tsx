import { useEffect, useMemo, useRef, useState } from 'react';
import { getStoredDemoAccessCode, verifyAndStoreDemoAccessCode, clearStoredDemoAccessCode } from '../../../domain/ai/openaiClient';
import { scheduleCompilePreviewCommand } from '../../preview/commands/compilePreviewCommand';
import { routeGlobalAICommand } from '../commands/routeGlobalAICommand';
import { useAppStore } from '../../../store/useAppStore';

export function GlobalChatPanel() {
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [accessUnlocked, setAccessUnlocked] = useState(Boolean(getStoredDemoAccessCode()));
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);
  const globalMessageIds = useAppStore((state) => state.chat.globalMessageIds);
  const messagesById = useAppStore((state) => state.chat.messagesById);
  const filesById = useAppStore((state) => state.files.byId);
  const previewStatus = useAppStore((state) => state.ui.preview.status);
  const previewNeedsRefresh = useAppStore((state) => state.ui.preview.needsRefresh);

  const messages = useMemo(
    () => globalMessageIds.map((messageId) => messagesById[messageId]).filter(Boolean),
    [globalMessageIds, messagesById],
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });

    bottomAnchorRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages.length]);

  const handleUnlock = async () => {
    const code = window.prompt('Enter demo access code')?.trim();
    if (!code) {
      return;
    }

    try {
      await verifyAndStoreDemoAccessCode(code);
      setAccessUnlocked(true);
      window.alert('Full demo access unlocked.');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to unlock demo access.');
    }
  };

  const handleGenerate = async () => {
    const prompt = input.trim();
    if (!prompt || submitting) {
      return;
    }

    if (!accessUnlocked) {
      window.alert('Full AI features are locked in the public demo. Use your access code to continue.');
      return;
    }

    setSubmitting(true);
    try {
      await routeGlobalAICommand(prompt);
      setInput('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 flex h-[560px] min-h-[560px] max-h-[560px] flex-col rounded-3xl border-[4px] border-slate-900 bg-white p-5 text-slate-900 shadow-lg pointer-events-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-slate-900">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-base font-semibold text-white">
            AI
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-900">AI COMMAND INPUT</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
            {accessUnlocked ? 'Full demo unlocked' : 'Public demo mode'}
          </div>
          <button
            type="button"
            onClick={() => {
              if (accessUnlocked) {
                clearStoredDemoAccessCode();
                setAccessUnlocked(false);
                return;
              }

              void handleUnlock();
            }}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
              accessUnlocked
                ? 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                : 'border-green-300 bg-green-100 text-green-950 hover:bg-green-200'
            }`}
          >
            {accessUnlocked ? 'Lock' : 'Unlock'}
          </button>
          <span className="text-xs font-medium text-slate-900">{previewStatus}</span>
        </div>
      </div>

      <div ref={scrollContainerRef} className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-center text-sm leading-7 text-slate-500">
            Ask for a report, a rewrite, or a section edit.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={`rounded-2xl border px-4 py-3 text-sm leading-7 ${
                    isUser
                      ? 'ml-auto max-w-[80%] border-slate-900 bg-slate-900 text-white'
                      : message.status === 'error'
                        ? 'max-w-[84%] border-slate-300 bg-slate-100 text-slate-800'
                        : 'max-w-[84%] border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-60">
                    {isUser ? 'User' : 'AI'}
                  </div>
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>

                  {message.referencedFileIds && message.referencedFileIds.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-current/10 pt-3">
                      {message.referencedFileIds
                        .map((fileId) => filesById[fileId])
                        .filter(Boolean)
                        .map((file) => (
                          <span
                            key={`${message.id}_${file.id}`}
                            className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                              isUser ? 'bg-white/10 text-white/80' : 'border border-slate-200 bg-slate-50 text-slate-500'
                            }`}
                          >
                            {file.bucket} / {file.name}
                          </span>
                        ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <div ref={bottomAnchorRef} />
          </div>
        )}
      </div>

      <div className="mt-4 flex shrink-0 flex-col gap-3 pointer-events-auto">
        {!accessUnlocked ? (
          <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
            Unlock full AI generation.
          </div>
        ) : null}
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={accessUnlocked ? 'Example: Generate a complete report from the uploaded requirement, evidence, and style files.' : 'Unlock to use AI generation.'}
          className="h-[112px] min-h-[112px] w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-800 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void scheduleCompilePreviewCommand()}
            disabled={previewStatus === 'compiling'}
            className="rounded-2xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {previewStatus === 'compiling' ? 'Compiling...' : previewNeedsRefresh ? 'Recompile Preview' : 'Compile Preview'}
          </button>

          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={submitting || !input.trim()}
            className={`rounded-2xl border px-6 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              accessUnlocked
                ? 'border-green-300 bg-green-100 text-green-950 hover:bg-green-200'
                : 'border-slate-900 text-slate-900 hover:bg-slate-50'
            }`}
          >
            {submitting ? 'Applying...' : accessUnlocked ? 'Apply Instruction' : 'Unlock to Use AI'}
          </button>
        </div>
      </div>
    </div>
  );
}

