import { createRouteHandler } from "uploadthing/server";
import { appFileRouter } from "../src/server/uploadthing.js";

const handler = createRouteHandler({
    router: appFileRouter,
});

export default async function apiHandler(req: Request) {
    try {
        // Vercel standalone functions with standard 'Request' input
        return await handler(req);
    } catch (err: any) {
        console.error("UploadThing handler error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error", details: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
