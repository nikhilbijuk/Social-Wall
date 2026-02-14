import { createRouteHandler, createUploadthing, type FileRouter } from "uploadthing/server";

export const runtime = "edge";

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

export default createRouteHandler({
    router: appFileRouter,
});
