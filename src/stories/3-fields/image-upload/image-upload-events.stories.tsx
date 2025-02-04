import { action } from "@storybook/addon-actions";
import { Description, Stories, Title } from "@storybook/addon-docs";
import { Meta, Story } from "@storybook/react/types-6-0";
import { useCallback, useEffect, useRef, useState } from "react";
import { IImageUploadSchema } from "../../../components/fields";
import { IFrontendEngineRef } from "../../../components/frontend-engine";
import { FrontendEngine, SUBMIT_BUTTON_SCHEMA } from "../../common";
import DefaultImageUploadConfig from "./image-upload.stories";

export default {
	title: "Field/ImageUpload/Events",
	parameters: {
		docs: {
			page: () => (
				<>
					<Title>Events for Image Upload field</Title>
					<Description>
						Custom events unique to the image upload field, it allows adding of event listeners to it.
					</Description>
					<Stories includePrimary={true} title="Examples" />
				</>
			),
			source: {
				code: null,
			},
		},
	},
	argTypes: DefaultImageUploadConfig.argTypes,
} as Meta;

/* eslint-disable react-hooks/rules-of-hooks */
const Template = (eventName: string) =>
	((args) => {
		const id = `image-upload-${eventName}`;
		const formRef = useRef<IFrontendEngineRef>();
		const handleEvent = (e: unknown) => action(eventName)(e);
		useEffect(() => {
			const currentFormRef = formRef.current;
			currentFormRef.addFieldEventListener(eventName, id, handleEvent);
			return () => currentFormRef.removeFieldEventListener(eventName, id, handleEvent);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);
		return (
			<FrontendEngine
				ref={formRef}
				data={{
					sections: {
						section: {
							uiType: "section",
							children: {
								[id]: args,
								...SUBMIT_BUTTON_SCHEMA,
							},
						},
					},
				}}
			/>
		);
	}) as Story<IImageUploadSchema>;
/* eslint-enable react-hooks/rules-of-hooks */

export const Mount = Template("mount").bind({});
Mount.args = {
	label: "Provide images",
	description: "Listen for `mount` event",
	uiType: "image-upload",
};

export const ShowReviewModal = Template("show-review-modal").bind({});
ShowReviewModal.args = {
	label: "Provide images",
	description: "Listen for `show-review-modal` event",
	uiType: "image-upload",
	editImage: true,
};

export const HideReviewModal = Template("hide-review-modal").bind({});
HideReviewModal.args = {
	label: "Provide images",
	description: "Listen for `hide-review-modal` event",
	uiType: "image-upload",
	editImage: true,
};

export const FileDialog = Template("file-dialog").bind({});
FileDialog.args = {
	label: "Provide images",
	description: "Listen for `file-dialog` event",
	uiType: "image-upload",
	editImage: true,
};

/* eslint-disable react-hooks/rules-of-hooks */
const SaveReviewImagesTemplate = (eventName: string) =>
	((args) => {
		const id = `image-upload-${eventName}`;
		const formRef = useRef<IFrontendEngineRef>();
		const [attemptCount, setAttemptCount] = useState(1);

		const handleSaveReviewImages = useCallback(
			async (event: CustomEvent) => {
				action(eventName)(event, attemptCount);
				// event can be prevented and retried
				if (attemptCount < 2) {
					event.preventDefault();
					setAttemptCount((v) => v + 1);
					await new Promise((resolve) => setTimeout(resolve, 1000));
					event.detail.retry();
				}
			},
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[attemptCount]
		);

		useEffect(() => {
			const currentFormRef = formRef.current;
			currentFormRef.addFieldEventListener(eventName, id, handleSaveReviewImages);
			return () => currentFormRef.removeFieldEventListener(eventName, id, handleSaveReviewImages);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [handleSaveReviewImages]);

		return (
			<FrontendEngine
				ref={formRef}
				data={{
					sections: {
						section: {
							uiType: "section",
							children: {
								[id]: args,
								...SUBMIT_BUTTON_SCHEMA,
							},
						},
					},
				}}
			/>
		);
	}) as Story<IImageUploadSchema>;
/* eslint-enable react-hooks/rules-of-hooks */

export const SaveReviewImages = SaveReviewImagesTemplate("save-review-images").bind({});
SaveReviewImages.args = {
	label: "Provide images",
	description: "Listen for `save-review-images` event",
	uiType: "image-upload",
	editImage: true,
};
