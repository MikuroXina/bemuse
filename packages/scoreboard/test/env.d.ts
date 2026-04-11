declare module 'cloudflare:workers' {
  // ProvidedEnv controls the type of `import("cloudflare:workers").env`
  export type ProvidedEnv = Env
}

declare namespace Cloudflare {
  interface Env {
    score: D1Database
    TEST_MIGRATIONS: import('cloudflare:test').D1Migration[]
  }
}
