import { createRouteHandler } from "uploadthing/server";
import { appFileRouter } from "../src/server/uploadthing.js";

export default createRouteHandler({
    router: appFileRouter,
});
