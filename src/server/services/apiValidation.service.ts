import { NextResponse } from "next/server";
import { z } from "zod";

type ValidationResult<T> =
  | {
      data: T;
      errorResponse?: never;
    }
  | {
      data?: never;
      errorResponse: NextResponse;
    };

export class ApiValidationService {
  static validate<T extends z.ZodType>(schema: T, data: unknown): ValidationResult<z.infer<T>> {
    const result = schema.safeParse(data);

    if (!result.success) {
      return {
        errorResponse: NextResponse.json(
          {
            error: "Validation failed",
            details: z.flattenError(result.error),
          },
          { status: 400 },
        ),
      };
    }

    return { data: result.data };
  }

  static async validateJson<T extends z.ZodType>(
    schema: T,
    request: Request,
  ): Promise<ValidationResult<z.infer<T>>> {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return {
        errorResponse: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
      };
    }

    return ApiValidationService.validate(schema, body);
  }
}
