import { createUploadthing, createRouteHandler } from "uploadthing/server";

const f = createUploadthing();

const fileRouter = {
    mediaUploader: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
        video: { maxFileSize: "16MB", maxFileCount: 1 },
    }).onUploadComplete(async ({ file }) => {
        console.log("Media upload complete:", file.url);
        return { uploadedBy: "user", url: file.url };
    }),
};

export const { GET, POST } = createRouteHandler({
    router: fileRouter,
});
