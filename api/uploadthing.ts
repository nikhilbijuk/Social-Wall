import { createRouteHandler, createUploadthing, type FileRouter } from "uploadthing/server";

export const config = {
    runtime: "nodejs",
};

const f = createUploadthing();

const appFileRouter = {
    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .onUploadComplete(async ({ file }) => {
            console.log("Upload complete:", file.url);
            return { uploadedBy: "user", url: file.url };
        }),

    videoUploader: f({ video: { maxFileSize: "16MB", maxFileCount: 1 } })
        .onUploadComplete(async ({ file }) => {
            console.log("Video upload complete:", file.url);
            return { uploadedBy: "user", url: file.url };
        }),
} satisfies FileRouter;

const handler = createRouteHandler({
    router: appFileRouter,
});

export default async function (req: Request) {
    console.log(`[UploadThing API] ${req.method} request received`);
    try {
        const response = await handler(req);
        console.log(`[UploadThing API] Response status: ${response.status}`);
        return response;
    } catch (error) {
        console.error(`[UploadThing API] Error:`, error);
        throw error;
    }
}
