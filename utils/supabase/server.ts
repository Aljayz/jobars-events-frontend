import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const empty = { data: null, error: null };
const emptyArr = { data: [], error: null };

function dummyChain(): any {
  return new Proxy(() => Promise.resolve(empty), {
    get(_t, prop: string) {
      if (prop === "then") return undefined;
      if (prop === "select") return () => dummyChain();
      if (prop === "limit") return () => Promise.resolve(emptyArr);
      if (prop === "maybeSingle" || prop === "single") return () => Promise.resolve(empty);
      if (prop === "order" || prop === "eq" || prop === "neq" || prop === "in" || prop === "filter" || prop === "or" || prop === "contains" || prop === "textSearch" || prop === "not" || prop === "gte" || prop === "lte" || prop === "gt" || prop === "lt" || prop === "is" || prop === "ilike" || prop === "like" || prop === "match" || prop === "range" || prop === "abortSignal") return () => dummyChain();
      if (prop === "upsert" || prop === "insert" || prop === "update" || prop === "delete") return () => dummyChain();
      return dummyChain();
    },
    apply() {
      return Promise.resolve(empty);
    },
  });
}

function createDummyClient() {
  return new Proxy({}, {
    get(_t, prop: string) {
      if (prop === "from") return () => dummyChain();
      if (prop === "channel") return () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) });
      if (prop === "removeChannel" || prop === "removeAllChannels") return () => {};
      if (prop === "rpc") return () => Promise.resolve(empty);
      return () => dummyChain();
    },
  }) as ReturnType<typeof createSupabaseClient>;
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
      // Vercel build — env vars unavailable during prerender
      return createDummyClient();
    }
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set");
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
      return createDummyClient();
    }
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}
