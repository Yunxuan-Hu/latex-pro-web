import { getSupabaseClient } from '../auth/supabaseClient';
import type { WorkspaceRecord, WorkspaceSnapshot } from '../../store/types';

export interface CloudProjectSummary {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

interface ProjectRow {
  id: string;
  name: string;
  snapshot: WorkspaceSnapshot;
  created_at: string;
  updated_at: string;
}

function requireSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }
  return supabase;
}

function toTimestamp(value: string): number {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : Date.now();
}

function toWorkspaceRecord(row: ProjectRow): WorkspaceRecord {
  return {
    id: row.id,
    name: row.name,
    createdAt: toTimestamp(row.created_at),
    updatedAt: toTimestamp(row.updated_at),
    snapshot: row.snapshot,
  };
}

export async function listCloudProjects(): Promise<CloudProjectSummary[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('projects')
    .select('id,name,created_at,updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: toTimestamp(row.created_at),
    updatedAt: toTimestamp(row.updated_at),
  }));
}

export async function saveCloudProject(workspace: WorkspaceRecord): Promise<CloudProjectSummary> {
  const supabase = requireSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('Sign in before saving projects.');
  }

  const { data, error } = await supabase
    .from('projects')
    .upsert(
      {
        id: workspace.id,
        owner_id: user.id,
        name: workspace.name,
        snapshot: workspace.snapshot,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select('id,name,created_at,updated_at')
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    createdAt: toTimestamp(data.created_at),
    updatedAt: toTimestamp(data.updated_at),
  };
}

export async function loadCloudProject(projectId: string): Promise<WorkspaceRecord> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('projects')
    .select('id,name,snapshot,created_at,updated_at')
    .eq('id', projectId)
    .single<ProjectRow>();

  if (error) {
    throw error;
  }

  return toWorkspaceRecord(data);
}

export async function renameCloudProject(projectId: string, name: string): Promise<CloudProjectSummary> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('projects')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .select('id,name,created_at,updated_at')
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    createdAt: toTimestamp(data.created_at),
    updatedAt: toTimestamp(data.updated_at),
  };
}

export async function deleteCloudProject(projectId: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from('projects').delete().eq('id', projectId);

  if (error) {
    throw error;
  }
}
