import type { Edge, Node } from "@xyflow/react";
import { supabase } from "./supabase";
import {
  hydrateCanvas,
  serializeEdges,
  serializeNodes,
  type CanvasData,
} from "./canvas-storage";

export interface ProjectSummary {
  id: string;
  name: string;
  updated_at: string;
}

interface ProjectRow extends ProjectSummary {
  data: CanvasData;
}

function client() {
  if (!supabase) throw new Error("Cloud projects require sign-in.");
  return supabase;
}

function toCanvasData(nodes: Node[], edges: Edge[]): CanvasData {
  return {
    version: 2,
    nodes: serializeNodes(nodes),
    edges: serializeEdges(edges),
  };
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const { data, error } = await client()
    .from("projects")
    .select("id, name, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveProject(
  name: string,
  nodes: Node[],
  edges: Edge[],
): Promise<ProjectSummary> {
  const { data, error } = await client()
    .from("projects")
    .insert({ name, data: toCanvasData(nodes, edges) })
    .select("id, name, updated_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProject(
  id: string,
  nodes: Node[],
  edges: Edge[],
): Promise<void> {
  const { error } = await client()
    .from("projects")
    .update({ data: toCanvasData(nodes, edges) })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function loadProject(
  id: string,
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const { data, error } = await client()
    .from("projects")
    .select("id, name, updated_at, data")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return hydrateCanvas((data as ProjectRow).data);
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await client().from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
