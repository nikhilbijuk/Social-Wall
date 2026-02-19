import { createUploadthing, createRouteHandler } from "uploadthing/server";

const f = createUploadthing();

const fileRouter = {
    mediaUploader: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
        video: { maxFileSize: "16MB", maxFileCount: 1 },
    }).onUploadComplete(async ({ file }) => {
        console.log("Upload complete:", file.url);
        return { url: file.url };
    }),
};

// ✅ Vercel Serverless requires default export
export default createRouteHandler({
    router: fileRouter,
});
