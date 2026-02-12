import { generateUploadButton, generateReactHelpers } from "@uploadthing/react";
import type { AppFileRouter } from "../server/uploadthing";

export const UploadButton = generateUploadButton<AppFileRouter>();

export const { useUploadThing, uploadFiles } = generateReactHelpers<AppFileRouter>();
