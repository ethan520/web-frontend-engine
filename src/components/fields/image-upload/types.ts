import { IFrontendEngineBaseFieldJsonSchema } from "../../frontend-engine";
import { IYupValidationRule } from "../../frontend-engine/yup/types";

export type TUploadMethod = "post" | "put" | "patch";
export const ACCEPTED_FILE_TYPES = ["jpg", "gif", "png", "heic", "heif", "webp"] as const;
export type TImageUploadAcceptedFileType = (typeof ACCEPTED_FILE_TYPES)[number];
export type TImageUploadOutputFileType = "jpg" | "png";

export interface IImageUploadValidationRule extends IYupValidationRule {
	/** accepted file types */
	fileType?: TImageUploadAcceptedFileType[] | undefined;
	/** max acceptable file size in kb */
	maxSizeInKb?: number | undefined;
}

export interface IImageUploadSchema<V = IImageUploadValidationRule>
	extends IFrontendEngineBaseFieldJsonSchema<"image-upload", V> {
	buttonLabel?: string | undefined;
	description?: string | undefined;
	editImage?: boolean | undefined;
	outputType?: TImageUploadOutputFileType | undefined;
	uploadOnAddingFile?: { method: TUploadMethod; url: string } | undefined;
	compress?: boolean | undefined;
	dimensions?: IImageDimensions | undefined;
}

export interface ISharedImageProps {
	id?: string | undefined;
	accepts: TImageUploadAcceptedFileType[];
	maxSizeInKb: number;
	maxFiles: number;
}

export enum EImageStatus {
	INJECTED = -99,
	ERROR_FORMAT = -3,
	ERROR_GENERIC = -2,
	ERROR_SIZE = -1,
	NONE = 0,
	TO_RECOMPRESS = 1,
	// compressed / recompressed / converted refer to the same step
	// got different steps due to different configs
	// recompressed wont fire some events
	COMPRESSED = 2,
	RECOMPRESSED = 2,
	CONVERTED = 2,
	EDITED = 3,
	UPLOAD_READY = 4,
	UPLOADING = 5,
	UPLOADED = 6,
}

export interface IImage {
	file: File;
	name: string;
	type?: string;
	/** refers to preview dimensions and eventual output dimensions */
	dimensions: IImageDimensions;
	dataURL?: string;
	thumbnailDataURL?: string;
	drawingDataURL?: string;
	drawing?: fabric.Object[];
	status: EImageStatus;
	addedFrom?: "dragInput" | "reviewModal" | "schema";
	uploadProgress: number;
	uploadResponse?: any;
	slot: number;
}

export interface IImageDimensions {
	width: number;
	height: number;
}
