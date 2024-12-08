import type { RouteConfig, RouteConfigEntry } from "@react-router/dev/routes";

export default async function mapRoutes(
  routes: RouteConfig,
  callback: (route: RouteConfigEntry) => RouteConfigEntry
) {
  return (await routes).map(function recur(route): RouteConfigEntry {
    return callback({
      ...route,
      children: route.children?.map(recur),
    });
  });
}
