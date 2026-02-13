import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const appFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
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

export type AppFileRouter = typeof appFileRouter;
