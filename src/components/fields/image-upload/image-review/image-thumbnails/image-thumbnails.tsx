import { ChangeEvent, useRef } from "react";
import { TestHelper } from "../../../../../utils";
import { TFileCapture } from "../../../../shared";
import { EImageStatus, IImage, ISharedImageProps } from "../../types";
import {
	AddImageButton,
	BorderOverlay,
	HiddenFileSelect,
	LoadingBox,
	LoadingDot,
	ThumbnailItem,
	ThumbnailWarningIcon,
	ThumbnailsWrapper,
} from "./image-thumbnails.styles";

const ADD_PLACEHOLDER_ICON = "https://assets.life.gov.sg/web-frontend-engine/img/icons/photo-placeholder-add.svg";
const WARNING_ICON = "https://assets.life.gov.sg/web-frontend-engine/img/icons/warning-grey.svg";

interface IProps extends Omit<ISharedImageProps, "maxSizeInKb"> {
	activeFileIndex: number;
	capture?: TFileCapture;
	images: IImage[];
	onClickThumbnail: (index: number) => void;
	onSelectFile: (file: File) => void;
}

export const ImageThumbnails = (props: IProps) => {
	//  =============================================================================
	// CONST, STATE, REFS
	//  =============================================================================
	const {
		accepts,
		activeFileIndex,
		capture,
		id = "image-thumbnails",
		images,
		maxFiles,
		onClickThumbnail,
		onSelectFile,
	} = props;
	const fileInputRef = useRef<HTMLInputElement>(null);

	// =============================================================================
	// EVENT HANDLERS
	// =============================================================================
	const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			onSelectFile(event.target.files[0]);
		}
	};

	const handleButtonClick = () => fileInputRef?.current?.click();

	//  =============================================================================
	// RENDER FUNCTIONS
	//  =============================================================================
	const renderThumbnails = () =>
		images.map((image, index) => {
			if (image.status === EImageStatus.NONE) {
				return (
					<LoadingBox key={index}>
						{[...Array(4)].map((_x, index) => (
							<LoadingDot key={`dot-${index}`} />
						))}
					</LoadingBox>
				);
			} else if (image.status > EImageStatus.NONE) {
				return (
					<ThumbnailItem
						key={index}
						id={TestHelper.generateId(id, `item-${index + 1}`)}
						data-testid={TestHelper.generateId(id, `item-${index + 1}`)}
						src={image.thumbnailDataURL || image.dataURL || ADD_PLACEHOLDER_ICON}
						type="button"
						aria-label={`thumbnail of ${image.name}`}
						onClick={() => onClickThumbnail(index)}
					>
						<BorderOverlay isSelected={activeFileIndex === index} />
					</ThumbnailItem>
				);
			} else if (image.addedFrom === "reviewModal") {
				return (
					<ThumbnailItem
						key={index}
						id={TestHelper.generateId(id, `item-${index + 1}`)}
						data-testid={TestHelper.generateId(id, `item-${index + 1}`)}
						type="button"
						aria-label={`error with ${image.name}`}
						onClick={() => onClickThumbnail(index)}
						error
					>
						<BorderOverlay isSelected={activeFileIndex === index} />
						<ThumbnailWarningIcon src={WARNING_ICON} />
					</ThumbnailItem>
				);
			}
		});

	// render only when no. of added images is less than max count or if max count is zero
	const renderAddButton = () =>
		images.filter(({ status, addedFrom }) => status >= EImageStatus.NONE || addedFrom === "reviewModal").length <
			maxFiles ||
		(!maxFiles && (
			<>
				<HiddenFileSelect
					id={TestHelper.generateId(id, "file-input")}
					data-testid={TestHelper.generateId(id, "file-input")}
					type="file"
					aria-hidden="true"
					tabIndex={-1}
					capture={capture}
					ref={fileInputRef}
					accept={accepts.map((fileType) => `.${fileType}`).join(", ")}
					onChange={handleInputChange}
				/>
				<AddImageButton
					type="button"
					id={TestHelper.generateId(id, "add-image-button")}
					data-testid={TestHelper.generateId(id, "add-image-button")}
					aria-label="add image"
					onClick={handleButtonClick}
				>
					<img alt="add" src={ADD_PLACEHOLDER_ICON} />
				</AddImageButton>
			</>
		));

	return (
		<ThumbnailsWrapper id={TestHelper.generateId(id)}>
			{renderThumbnails()}
			{renderAddButton()}
		</ThumbnailsWrapper>
	);
};
