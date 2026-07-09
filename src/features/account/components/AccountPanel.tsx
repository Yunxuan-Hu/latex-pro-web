import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useShallow } from 'zustand/react/shallow';
import { getSupabaseClient, isSupabaseConfigured } from '../../../domain/auth/supabaseClient';
import {
  deleteCloudProject,
  listCloudProjects,
  loadCloudProject,
  saveCloudProject,
  type CloudProjectSummary,
} from '../../../domain/cloud/projectRepository';
import { useAppStore } from '../../../store/useAppStore';
import type { RootState, UIState, WorkspaceRecord, WorkspaceSnapshot } from '../../../store/types';

type AccountStatus = 'idle' | 'working' | 'error' | 'saved';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}

function createWorkspaceSnapshot(state: Pick<RootState, 'files' | 'document' | 'chat' | 'snapshots' | 'ui'>): WorkspaceSnapshot {
  const sanitizedUi: UIState = {
    ...state.ui,
    preview: {
      ...state.ui.preview,
      status: state.ui.preview.status === 'ready' ? 'ready' : 'idle',
    },
  };

  return {
    files: {
      byId: Object.fromEntries(
        Object.entries(state.files.byId).map(([fileId, file]) => [
          fileId,
          {
            ...file,
            objectUrl: undefined,
          },
        ]),
      ),
      idsByBucket: state.files.idsByBucket,
    },
    document: state.document,
    chat: state.chat,
    snapshots: state.snapshots,
    ui: sanitizedUi,
  };
}

function getCurrentWorkspaceRecord(state: RootState): WorkspaceRecord {
  const current = state.workspaces.byId[state.workspaces.currentWorkspaceId];
  const timestamp = Date.now();

  return {
    id: current?.id || `workspace_${timestamp}`,
    name: current?.name || state.document.meta.title || 'Untitled project',
    createdAt: current?.createdAt || timestamp,
    updatedAt: timestamp,
    snapshot: createWorkspaceSnapshot(state),
  };
}

function getUserLabel(user: User): string {
  return user.user_metadata?.full_name || user.email || 'Signed in';
}

export function AccountPanel() {
  const configured = isSupabaseConfigured();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { currentWorkspaceName, actions } = useAppStore(
    useShallow((state) => ({
      currentWorkspaceName: state.workspaces.byId[state.workspaces.currentWorkspaceId]?.name || 'Workspace',
      actions: state.actions,
    })),
  );
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState<CloudProjectSummary[]>([]);
  const [status, setStatus] = useState<AccountStatus>('idle');
  const [message, setMessage] = useState('');

  const refreshProjects = async () => {
    if (!supabase || !user) {
      return;
    }

    setStatus('working');
    setMessage('');

    try {
      setProjects(await listCloudProjects());
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setMessage(getErrorMessage(error, 'Could not load cloud projects.'));
    }
  };

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(data.user ?? null);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (user) {
      void refreshProjects();
    } else {
      setProjects([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleGoogleLogin = async () => {
    if (!supabase) {
      return;
    }

    setStatus('working');
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  const handleEmailLogin = async (mode: 'sign-in' | 'sign-up') => {
    if (!supabase || !email.trim() || password.length < 6) {
      setStatus('error');
      setMessage('Use an email and a password with at least 6 characters.');
      return;
    }

    setStatus('working');
    setMessage('');

    const result =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });

    if (result.error) {
      setStatus('error');
      setMessage(result.error.message);
      return;
    }

    setStatus('idle');
    setMessage(mode === 'sign-up' ? 'Check your email if confirmation is enabled.' : '');
  };

  const handleSave = async () => {
    setStatus('working');
    setMessage('');

    try {
      await saveCloudProject(getCurrentWorkspaceRecord(useAppStore.getState()));
      setProjects(await listCloudProjects());
      setStatus('saved');
      setMessage('Saved to your account.');
    } catch (error) {
      setStatus('error');
      setMessage(getErrorMessage(error, 'Could not save project.'));
    }
  };

  const handleOpenProject = async (projectId: string) => {
    setStatus('working');
    setMessage('');

    try {
      actions.importWorkspaceSnapshot(await loadCloudProject(projectId));
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setMessage(getErrorMessage(error, 'Could not open project.'));
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Delete this cloud project?')) {
      return;
    }

    setStatus('working');
    setMessage('');

    try {
      await deleteCloudProject(projectId);
      setProjects(await listCloudProjects());
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setMessage(getErrorMessage(error, 'Could not delete project.'));
    }
  };

  if (!configured) {
    return (
      <section className="rounded-3xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Account
        </div>
        <div className="mt-3 text-xs leading-5 text-slate-500">
          Add Supabase env vars to enable login and cloud projects.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-950 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Account
        </div>
        {user ? (
          <button
            type="button"
            onClick={() => void supabase?.auth.signOut()}
            className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            Sign out
          </button>
        ) : null}
      </div>

      {!user ? (
        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={status === 'working'}
            className="w-full rounded-2xl border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            Continue with Google
          </button>

          <div className="space-y-2">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void handleEmailLogin('sign-in')}
                disabled={status === 'working'}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => void handleEmailLogin('sign-up')}
                disabled={status === 'working'}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="truncate text-sm font-semibold text-slate-900">{getUserLabel(user)}</div>
          <button
            type="button"
            onClick={handleSave}
            disabled={status === 'working'}
            className="w-full rounded-2xl border border-green-300 bg-green-100 px-4 py-2 text-left text-xs font-semibold text-green-950 shadow-sm transition hover:bg-green-200 disabled:opacity-60"
          >
            Save current: {currentWorkspaceName}
          </button>

          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Cloud projects</div>
            <button
              type="button"
              onClick={() => void refreshProjects()}
              disabled={status === 'working'}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-2">
            {projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-400">
                No cloud projects yet.
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <button
                    type="button"
                    onClick={() => void handleOpenProject(project.id)}
                    className="w-full text-left"
                  >
                    <div className="truncate text-sm font-semibold text-slate-800">{project.name}</div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      {new Date(project.updatedAt).toLocaleString()}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteProject(project.id)}
                    className="mt-2 text-[11px] font-semibold text-slate-400 hover:text-slate-700"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {message ? (
        <div className={`mt-3 rounded-2xl border px-3 py-2 text-xs ${status === 'error' ? 'border-slate-300 bg-slate-50 text-slate-700' : 'border-green-300 bg-green-100 text-green-950'}`}>
          {message}
        </div>
      ) : null}
    </section>
  );
}
