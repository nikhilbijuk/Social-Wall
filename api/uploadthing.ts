import { createRouteHandler } from "uploadthing/server";
import { appFileRouter } from "../src/server/uploadthing.js";

export const runtime = "edge";

export const { GET, POST } = createRouteHandler({
    router: appFileRouter,
});
