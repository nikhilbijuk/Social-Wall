import { createRouteHandler } from "uploadthing/server";
import { appFileRouter } from "../src/server/uploadthing";

export default createRouteHandler({
    router: appFileRouter,
});
