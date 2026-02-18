import { createUploadthing, createRouteHandler } from "uploadthing/server";

const f = createUploadthing();

const fileRouter = {
    imageUploader: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
    }).onUploadComplete(async ({ file }) => {
        return { uploadedBy: "user", url: file.url };
    }),
};

export default createRouteHandler({
    router: fileRouter,
});
