import React, { createRef, useContext, useEffect, useState } from "react";
import { TestHelper } from "../../../../utils";
import { useFieldEvent, usePrevious } from "../../../../utils/hooks";
import { DragUpload, ERROR_MESSAGES, IDragUploadRef, Sanitize } from "../../../shared";
import { ImageContext } from "../image-context";
import { ImageUploadHelper } from "../image-upload-helper";
import { EImageStatus, IImage, IImageUploadValidationRule, ISharedImageProps } from "../types";
import { FileItem } from "./file-item";
import { AddButton, AlertContainer, Content, Subtitle, UploadWrapper, Wrapper } from "./image-input.styles";

interface IImageInputProps extends ISharedImageProps {
	label: string;
	buttonLabel?: string | undefined;
	description: string;
	dimensions: { width: number; height: number };
	validation: IImageUploadValidationRule[];
	errorMessage?: string | undefined;
}

/**
 * handles adding of image(s) through drag & drop or file dialog
 */
export const ImageInput = (props: IImageInputProps) => {
	// =============================================================================
	// CONST, STATE, REFS
	// =============================================================================
	const {
		id,
		label,
		buttonLabel = "Add photos",
		description,
		dimensions,
		maxFiles,
		accepts,
		maxSizeInKb,
		validation,
		errorMessage,
	} = props;
	const { images, setImages, setErrorCount } = useContext(ImageContext);
	const { dispatchFieldEvent } = useFieldEvent();
	const dragUploadRef = createRef<IDragUploadRef>();
	const [remainingPhotos, setRemainingPhotos] = useState<number>(0);
	const [exceededFiles, setExceedError] = useState<boolean>();
	// =============================================================================
	// EFFECTS
	// =============================================================================
	useEffect(() => {
		if (maxFiles > 0) setRemainingPhotos(maxFiles - images.length);
	}, [maxFiles, images.length]);

	const previousExceededFiles = usePrevious(exceededFiles);
	useEffect(() => {
		if (previousExceededFiles && !exceededFiles) {
			setErrorCount((prev) => Math.max(0, prev - 1));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [exceededFiles]);

	// ===========================================================================
	// EVENT HANDLERS
	// ===========================================================================
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
		event?.preventDefault();
		dispatchFieldEvent("file-dialog", id);
		dragUploadRef?.current?.fileDialog();
	};

	const handleDeleteFile = (index: number) => (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		setImages((prev) => prev.filter((f, i) => i !== index));
		setExceedError(false);
	};

	const handleInput = (inputFiles: File[]): void => {
		if (!inputFiles || !inputFiles.length) return;
		if (!maxFiles || inputFiles.length + images.length <= maxFiles) {
			const updatedImages: IImage[] = [...images];
			inputFiles.forEach((inputFile) => {
				updatedImages.push({
					file: inputFile,
					name: inputFile.name,
					dimensions,
					status: EImageStatus.NONE,
					uploadProgress: 0,
					addedFrom: "dragInput",
					slot: ImageUploadHelper.findAvailableSlot(updatedImages),
				});
			});
			setImages(updatedImages);
			setExceedError(false);
		} else if (maxFiles > 0) {
			setExceedError(true);
		}
	};

	// =============================================================================
	// RENDER FUNCTIONS
	// =============================================================================
	const renderFiles = () => {
		if (!images || !images.length) return null;
		return images.map((fileItem: IImage, i: number) => {
			return (
				<FileItem
					id={`${id}-file-item`}
					key={`${fileItem.name}_${i}`}
					index={i}
					fileItem={fileItem}
					maxSizeInKb={maxSizeInKb}
					accepts={accepts}
					validation={validation}
					onDelete={handleDeleteFile}
				/>
			);
		});
	};

	// render uploader as long as there are available slots or max is not defined
	const renderUploader = () => {
		if (maxFiles && remainingPhotos <= 0) return null;
		return (
			<UploadWrapper>
				<AddButton
					onClick={handleClick}
					styleType="secondary"
					id={TestHelper.generateId(id, "file-input-add-button")}
					data-testid={TestHelper.generateId(id, "file-input-add-button")}
				>
					{buttonLabel}
				</AddButton>
			</UploadWrapper>
		);
	};

	const renderFileExceededAlert = () => {
		const lengthRule = validation?.find((rule) => "length" in rule);
		const maxRule = validation?.find((rule) => "max" in rule);
		let errorMessage = lengthRule?.errorMessage || maxRule?.errorMessage;
		if (!errorMessage) {
			if (remainingPhotos < 1 || images.length) {
				errorMessage = ERROR_MESSAGES.UPLOAD("photo").MAX_FILES(maxFiles);
			} else {
				errorMessage = ERROR_MESSAGES.UPLOAD("photo").MAX_FILES_WITH_REMAINING(remainingPhotos);
			}
		}

		return (
			<AlertContainer type="error" data-testid={TestHelper.generateId(id, "error")}>
				{errorMessage}
			</AlertContainer>
		);
	};

	const renderCustomError = (errorMessage: string) => {
		return (
			<AlertContainer type="error" data-testid={TestHelper.generateId(id, "error")}>
				{errorMessage}
			</AlertContainer>
		);
	};

	return (
		<Wrapper
			id={TestHelper.generateId(id)}
			data-testid={TestHelper.generateId(id)}
			aria-invalid={!!errorMessage}
			aria-describedby={!!errorMessage && TestHelper.generateId(id, "error")}
		>
			<DragUpload id={`${id}-drag-upload`} accept={accepts} onInput={handleInput} ref={dragUploadRef}>
				<Subtitle as="label" htmlFor={TestHelper.generateId(id, "file-input-add-button")} weight="semibold">
					{label}
				</Subtitle>
				<Content>
					<Sanitize>{description}</Sanitize>
				</Content>
				{renderFiles()}
				{exceededFiles ? renderFileExceededAlert() : null}
				{errorMessage && renderCustomError(errorMessage)}
				{renderUploader()}
			</DragUpload>
		</Wrapper>
	);
};
