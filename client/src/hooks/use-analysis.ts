import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

type AnalyzeFitInput = z.infer<typeof api.analysis.analyze.input>;
type GenerateCoverLetterInput = z.infer<typeof api.analysis.generateCoverLetter.input>;

// POST /api/analysis/fit
export function useAnalyzeFit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AnalyzeFitInput) => {
      const res = await fetch(api.analysis.analyze.path, {
        method: api.analysis.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to analyze job fit");
      }
      
      return api.analysis.analyze.responses[200].parse(await res.json());
    },
    // Optional: if we were storing these in a list, we'd invalidate here
    onSuccess: (data) => {
      if (data.applicationId) {
        queryClient.invalidateQueries({ queryKey: ["/api/applications", data.applicationId] });
      }
    }
  });
}

// POST /api/analysis/cover-letter
export function useGenerateCoverLetter() {
  return useMutation({
    mutationFn: async (data: GenerateCoverLetterInput) => {
      const res = await fetch(api.analysis.generateCoverLetter.path, {
        method: api.analysis.generateCoverLetter.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to generate cover letter");
      }
      
      return api.analysis.generateCoverLetter.responses[200].parse(await res.json());
    },
  });
}
