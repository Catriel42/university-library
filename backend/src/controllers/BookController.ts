import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { BookService } from '../services/BookService.js';

const searchQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(200).optional(),
    title: z.string().trim().min(1).max(200).optional(),
    author: z.string().trim().min(1).max(200).optional(),
    subject: z.string().trim().min(1).max(200).optional(),
    lang: z.string().trim().max(10).optional(),
    sort: z.string().trim().max(30).optional(),
    page: z.coerce.number().int().min(1).max(1000).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .refine((query) => Boolean(query.q ?? query.title ?? query.author ?? query.subject), {
    message: 'At least one of q, title, author or subject is required',
  });

async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = searchQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_QUERY',
        message: 'Invalid search parameters',
        details: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) params[key] = String(value);
  }

  try {
    const result = await BookService.searchBooks(params);
    
    // Map to the shared SearchResponseDTO contract
    const response = {
      numFound: result.numFound,
      start: result.start,
      docs: result.docs.map(doc => ({
        id: doc.cleanKey,
        title: doc.title,
        firstAuthor: doc.author_name?.[0],
        coverId: doc.cover_i,
        totalCopies: doc.totalCopies,
        availableCopies: doc.availableCopies
      }))
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

export const BookController = { search };
