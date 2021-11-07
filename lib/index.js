import { getServiceOptions, defaultServiceMethods } from "@feathersjs/feathers";
import { http } from "@feathersjs/transport-commons";

import { Router } from "itty-router";

export default function configure(app) {
  const router = Router();

  router.all("*", async (request, env) => {
    app.set("env", env);
    await app.setup();

    const { method: httpMethod, headers, cf } = request;
    const data = request.body ? await request.json() : {};
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams);

    const methodOverride = request.headers[http.METHOD_HEADER]
      ? request.headers[http.METHOD_HEADER]
      : null;

    const lookup = app.lookup(url.pathname);

    if (lookup !== null) {
      const { service, params: { __id: id = null, ...route } = {} } = lookup;
      const method = http.getServiceMethod(httpMethod, id, methodOverride);
      const { methods } = getServiceOptions(service);

      if (
        !methods.includes(method) ||
        defaultServiceMethods.includes(methodOverride)
      ) {
        return new Response(
          `Method \`${method}\` is not supported by this endpoint.`,
          { status: http.statusCodes.methodNotAllowed }
        );
      }

      const createArguments =
        http.argumentsFor[method] || http.argumentsFor.default;

      const params = {
        cf,
        query,
        route,
        headers,
        provider: "rest",
      };

      const args = createArguments({ id, data, params });

      const result = await service[method](...args);

      return new Response(JSON.stringify(result), {
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      });
    }
  });

  // router.all("/ws", (request, env) => {
  //   const id = env.SESSION.idFromName("SESSION");
  //   const stub = env.SESSION.get(id);
  //   return stub.fetch(request);
  // });

  app.handle = router.handle;
}
