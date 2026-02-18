import { generateUploadButton, generateReactHelpers } from "@uploadthing/react";
import type { AppFileRouter } from "../../api/uploadthing";

export const UploadButton = generateUploadButton<AppFileRouter>();

export const { useUploadThing, uploadFiles } = generateReactHelpers<AppFileRouter>();
