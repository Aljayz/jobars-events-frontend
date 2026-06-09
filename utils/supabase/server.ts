import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function mockResolve(result: unknown) {
  return {
    then(resolve: (v: unknown) => void) { resolve(result); },
  };
}

const emptyResult = { data: null, error: null };
const emptyArray = { data: [], error: null };

function mockBuilder(): any {
  const chain = () => mockBuilder();
  chain.then = (resolve: (v: unknown) => void) => { resolve(emptyResult); };
  chain.select = () => mockBuilder();
  chain.insert = () => mockBuilder();
  chain.update = () => mockBuilder();
  chain.upsert = () => mockBuilder();
  chain.delete = () => mockBuilder();
  chain.eq = () => mockBuilder();
  chain.neq = () => mockBuilder();
  chain.gt = () => mockBuilder();
  chain.gte = () => mockBuilder();
  chain.lt = () => mockBuilder();
  chain.lte = () => mockBuilder();
  chain.like = () => mockBuilder();
  chain.ilike = () => mockBuilder();
  chain.is = () => mockBuilder();
  chain.in = () => mockBuilder();
  chain.not = () => mockBuilder();
  chain.or = () => mockBuilder();
  chain.contains = () => mockBuilder();
  chain.textSearch = () => mockBuilder();
  chain.filter = () => mockBuilder();
  chain.match = () => mockBuilder();
  chain.range = () => mockBuilder();
  chain.abortSignal = () => mockBuilder();
  chain.order = () => mockBuilder();
  chain.limit = () => mockResolve(emptyArray);
  chain.single = () => mockResolve(emptyResult);
  chain.maybeSingle = () => mockResolve(emptyResult);
  chain.rpc = () => mockResolve(emptyResult);
  return chain;
}

function createDummyClient(): ReturnType<typeof createSupabaseClient> {
  return {
    from: () => mockBuilder(),
    channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) }),
    removeChannel: () => {},
    removeAllChannels: () => {},
    rpc: () => mockResolve(emptyResult),
  } as unknown as ReturnType<typeof createSupabaseClient>;
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
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
