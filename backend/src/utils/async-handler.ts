import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Wraps an async handler so rejections reach the error middleware; responds `{ data }`. */
export const handle =
  <T>(fn: (req: Request, res: Response) => Promise<T>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res)
      .then((data) => {
        if (!res.headersSent) res.json({ data });
      })
      .catch(next);
  };
