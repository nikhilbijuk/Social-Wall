import { createUploadthing } from "uploadthing/server";
import { createRouteHandler } from "uploadthing/next";

const f = createUploadthing();

export const fileRouter = {
    mediaUploader: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
        video: { maxFileSize: "16MB", maxFileCount: 1 },
    }).onUploadComplete(async ({ file }) => {
        console.log("Uploaded:", file.url);
        return { url: file.url };
    }),
};

export type OurFileRouter = typeof fileRouter;

export const { GET, POST } = createRouteHandler({
    router: fileRouter,
    config: {
        uploadthingSecret: process.env.UPLOADTHING_SECRET,
        uploadthingId: process.env.UPLOADTHING_APP_ID,
    },
});
