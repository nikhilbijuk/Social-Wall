import { createUploadthing, createRouteHandler } from "uploadthing/server";

const f = createUploadthing();

export const appFileRouter = {
    mediaUploader: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
        video: { maxFileSize: "16MB", maxFileCount: 1 },
    }).onUploadComplete(async ({ file }) => {
        console.log("Media upload complete:", file.url);
        return { uploadedBy: "user", url: file.url };
    }),
};

export type AppFileRouter = typeof appFileRouter;

export default createRouteHandler({
    router: appFileRouter,
});
