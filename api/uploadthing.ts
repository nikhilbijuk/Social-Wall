import { createNextPageApiHandler } from "uploadthing/next-legacy";
import { appFileRouter } from "../src/server/uploadthing";

const handler = createNextPageApiHandler({
    router: appFileRouter,
});

export const config = {
    api: {
        bodyParser: false,
    },
};

export default handler;
