import { createUploadthing } from "uploadthing/server";
import { createRouteHandler } from "uploadthing/next";

const f = createUploadthing();

export const fileRouter = {
    mediaUploader: f({
        image: { maxFileSize: "8MB", maxFileCount: 1 },
        // Free tier maximum is 32MB for video! Overriding this to 64MB breaks the entire endpoint.
        video: { maxFileSize: "32MB", maxFileCount: 1 },
    }).onUploadComplete(async ({ file }) => {
        const fileUrl = file.ufsUrl || file.url;
        console.log("Uploaded:", fileUrl);
        return { url: fileUrl };
    }),
};

export type OurFileRouter = typeof fileRouter;

export const { GET, POST } = createRouteHandler({
    router: fileRouter,
});
