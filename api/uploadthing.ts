import { createUploadthing, createRouteHandler } from "uploadthing/server";
import type { FileRouter } from "uploadthing/server";

export const config = {
    runtime: "nodejs",
};

const f = createUploadthing();

export const uploadRouter = {
    mediaUploader: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
        video: { maxFileSize: "16MB", maxFileCount: 1 },
    }).onUploadComplete(async ({ file }) => {
        console.log("Media upload complete:", file.url);
        return { uploadedBy: "user", url: file.url };
    }),
} satisfies FileRouter;

export default createRouteHandler({
    router: uploadRouter,
});
