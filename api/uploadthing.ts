import { createRouteHandler } from "uploadthing/server";
import { appFileRouter } from "../src/server/uploadthing.js";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default createRouteHandler({
    router: appFileRouter,
});
