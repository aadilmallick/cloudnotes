import { redirect } from "next/navigation";
import { z } from "zod";

export class NextJSSearchParams<T extends Record<string, any>> {
  redirectWithPayload(url: string, payload: T) {
    redirect(`${url}?payload=${encodeURIComponent(JSON.stringify(payload))}`);
  }

  getSearchParams(searchParams: T) {
    return searchParams;
  }
}

export type ParamsInferType<T extends Record<string, any>> = {
  payload: T;
};

export type SearchParamsType = Promise<{
  payload: string;
}>;

export class NextJSSearchParamsZod<T extends z.ZodObject<any>> {
  constructor(private schema: T) {}
  redirectWithPayload(url: string, payload: z.infer<T>) {
    redirect(`${url}?payload=${encodeURIComponent(JSON.stringify(payload))}`);
  }

  getSearchParams(searchParams: { payload: string }) {
    try {
      const data = JSON.parse(searchParams.payload) as z.infer<T>;
      return this.schema.safeParse(data).data as z.infer<T>;
    } catch (e) {
      return undefined;
    }
  }

  isValidSearchParams(searchParams: { payload: string }) {
    try {
      const data = JSON.parse(searchParams.payload);
      return this.schema.safeParse(data).success;
    } catch (e) {
      return false;
    }
  }

  createRouteGuard(
    searchParams: {
      payload: string;
    },
    fallbackUrl: string
  ) {
    if (!this.isValidSearchParams(searchParams)) {
      redirect(fallbackUrl);
    }
  }
}
