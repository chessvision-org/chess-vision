export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const target = new URL(
      url.pathname + url.search,
      env.SUPABASE_FUNCTIONS_ORIGIN
    );

    const headers = new Headers(request.headers);
    headers.delete('x-forwarded-for');
    headers.set(
      'x-real-client-ip',
      request.headers.get('CF-Connecting-IP') ?? ''
    );
    headers.set('x-proxy-secret', env.PROXY_SHARED_SECRET);

    const init = {
      method: request.method,
      headers,
      body: (request.method === 'GET' || request.method === 'HEAD')
        ? undefined
        : request.body,
    };

    return fetch(target.toString(), init);
  }
};
