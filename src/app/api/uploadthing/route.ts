import { createUploadthing } from "uploadthing/server";
import { createRouteHandler } from "uploadthing/next";

const f = createUploadthing();

export const fileRouter = {
    mediaUploader: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
        video: { maxFileSize: "16MB", maxFileCount: 1 },
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
