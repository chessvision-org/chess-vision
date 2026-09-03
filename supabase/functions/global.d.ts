declare module 'https://esm.sh/*';

declare namespace Deno {
  function serve(handler: (req: Request) => Response | Promise<Response>): void;

  namespace env {
    function get(key: string): string | undefined;
  }
}
