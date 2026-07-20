import type { Env, ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { BusinessError } from "../lib/errors";

export function createErrorHandler<E extends Env>(): ErrorHandler<E> {
  return (err, c) => {
    const method = c.req.method;
    const path = c.req.path;

    if (err instanceof BusinessError) {
      console.error(
        "[BusinessError]",
        {
          kind: "BusinessError",
          method,
          path,
          code: err.code,
          msg: err.message,
        },
        err,
      );
      return c.json(
        { code: err.code, message: err.message, data: null },
        err.code as ContentfulStatusCode,
      );
    }

    console.error(
      "[InternalError]",
      {
        kind: "InternalError",
        method,
        path,
        msg: err instanceof Error ? err.message : String(err),
      },
      err,
    );
    return c.json(
      { code: 500, message: "服务器错误", data: null },
      500,
    );
  };
}
