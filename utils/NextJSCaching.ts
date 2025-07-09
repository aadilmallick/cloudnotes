import { unstable_cacheTag as cacheTag } from "next/cache";
import { revalidateTag } from "next/cache";

export const notesCacher = {
  cache: (userId: string) => {
    cacheTag(`notes-${userId}`);
  },
  uncache: (userId: string) => {
    revalidateTag(`notes-${userId}`);
  },
};
