import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateApplicationRequest, type UpdateApplicationRequest } from "@shared/routes";

// GET /api/applications
export function useApplications() {
  return useQuery({
    queryKey: [api.applications.list.path],
    queryFn: async () => {
      const res = await fetch(api.applications.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return api.applications.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/applications/:id
export function useApplication(id: number) {
  return useQuery({
    queryKey: [api.applications.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.applications.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch application");
      return api.applications.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/applications
export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateApplicationRequest) => {
      const res = await fetch(api.applications.create.path, {
        method: api.applications.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.applications.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create application");
      }
      return api.applications.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.applications.list.path] }),
  });
}

// PUT /api/applications/:id
export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateApplicationRequest) => {
      const url = buildUrl(api.applications.update.path, { id });
      const res = await fetch(url, {
        method: api.applications.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update application");
      return api.applications.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.applications.get.path, data.id] });
    },
  });
}

// DELETE /api/applications/:id
export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.applications.delete.path, { id });
      const res = await fetch(url, { method: api.applications.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete application");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.applications.list.path] }),
  });
}
