
import { z } from 'zod';
import { 
  insertApplicationSchema, 
  insertDocumentSchema, 
  applications, 
  documents, 
  analysisResults,
  generatedCoverLetters
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  applications: {
    list: {
      method: 'GET' as const,
      path: '/api/applications',
      responses: {
        200: z.array(z.custom<typeof applications.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/applications',
      input: insertApplicationSchema,
      responses: {
        201: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/applications/:id',
      input: insertApplicationSchema.partial(),
      responses: {
        200: z.custom<typeof applications.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/applications/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/applications/:id',
      responses: {
        200: z.custom<typeof applications.$inferSelect & { 
          analysis?: typeof analysisResults.$inferSelect,
          coverLetter?: typeof generatedCoverLetters.$inferSelect
        }>(),
        404: errorSchemas.notFound,
      }
    }
  },
  documents: {
    list: {
      method: 'GET' as const,
      path: '/api/documents',
      responses: {
        200: z.array(z.custom<typeof documents.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/documents',
      input: insertDocumentSchema,
      responses: {
        201: z.custom<typeof documents.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/documents/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  // AI Endpoints
  analysis: {
    analyze: {
      method: 'POST' as const,
      path: '/api/analysis/fit',
      input: z.object({
        jobDescription: z.string(),
        cvContent: z.string(),
        applicationId: z.number().optional()
      }),
      responses: {
        200: z.custom<typeof analysisResults.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    generateCoverLetter: {
      method: 'POST' as const,
      path: '/api/analysis/cover-letter',
      input: z.object({
        jobDescription: z.string(),
        cvContent: z.string(),
        company: z.string(),
        role: z.string(),
        applicationId: z.number().optional()
      }),
      responses: {
        200: z.object({ content: z.string() }),
        400: errorSchemas.validation,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
