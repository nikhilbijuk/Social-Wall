import { createRouteHandler } from "uploadthing/next-legacy";
import { appFileRouter } from "../src/server/uploadthing";

const handler = createRouteHandler({
    router: appFileRouter,
});

export default async function apiHandler(req: any, res: any) {
    try {
        return await handler(req, res);
    } catch (err: any) {
        console.error("UploadThing handler error:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
