import { createRouteHandler } from "uploadthing/server";
import { appFileRouter } from "../src/server/uploadthing.js";

export const runtime = "edge";

export default createRouteHandler({
    router: appFileRouter,
});
