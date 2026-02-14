import { createRouteHandler, createUploadthing, type FileRouter } from "uploadthing/server";

export const config = {
    runtime: "nodejs",
};

const f = createUploadthing();

const appFileRouter = {
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

export const { GET, POST } = createRouteHandler({
    router: appFileRouter,
});

export default async function handler(req: any, res: any) {
    if (req.method === "GET") return await GET(req, res);
    if (req.method === "POST") return await POST(req, res);
}
