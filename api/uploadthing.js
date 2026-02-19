import { createUploadthing, createRouteHandler } from "uploadthing/server";

export const config = {
    runtime: "nodejs",
};

const f = createUploadthing();

const uploadRouter = {
    mediaUploader: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
        video: { maxFileSize: "16MB", maxFileCount: 1 },
    }).onUploadComplete(async ({ file }) => {
        console.log("Media upload complete:", file.url);
        return { uploadedBy: "user", url: file.url };
    }),
};

export default createRouteHandler({
    router: uploadRouter,
});
