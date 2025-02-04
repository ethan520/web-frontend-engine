import { ArgsTable, Description, Heading, PRIMARY_STORY, Stories, Title } from "@storybook/addon-docs";
import { Meta } from "@storybook/react/types-6-0";
import { ISelectSchema } from "../../../components/fields";
import { CommonFieldStoryProps, DefaultStoryTemplate, ResetStoryTemplate } from "../../common";

export default {
	title: "Field/Select",
	parameters: {
		docs: {
			page: () => (
				<>
					<Title>Select</Title>
					<Description>This component provides a set of options for user to select</Description>
					<Heading>Props</Heading>
					<ArgsTable story={PRIMARY_STORY} />
					<Stories includePrimary={true} title="Examples" />
				</>
			),
		},
	},
	argTypes: {
		...CommonFieldStoryProps("select"),
		disabled: {
			description: "Specifies if the input should be disabled",
			table: {
				type: {
					summary: "boolean",
				},
				defaultValue: { summary: false },
			},
			options: [true, false],
			control: {
				type: "boolean",
			},
		},
		options: {
			description: "A list of options that a user can choose from",
			table: {
				type: {
					summary: "{ label: string, value: string }[]",
				},
			},
			type: { name: "object", value: {} },
		},
		placeholder: {
			description: "Specifies the placeholder text",
			table: {
				type: {
					summary: "string",
				},
			},
		},
		listStyleWidth: {
			description: "Style option: The width of the options. You can specify e.g. 100% or 12rem",
			table: {
				type: {
					summary: "string",
				},
			},
		},
	},
} as Meta;

export const Default = DefaultStoryTemplate<ISelectSchema>("select-default").bind({});
Default.args = {
	uiType: "select",
	label: "Fruits",
	options: [
		{ label: "Apple", value: "apple" },
		{ label: "Berry", value: "berry" },
		{ label: "Cherry", value: "cherry" },
	],
};

export const DefaultValue = DefaultStoryTemplate<ISelectSchema>("select-default-value").bind({});
DefaultValue.args = {
	uiType: "select",
	label: "Fruits",
	options: [
		{ label: "Apple", value: "apple" },
		{ label: "Berry", value: "berry" },
		{ label: "Cherry", value: "cherry" },
	],
	defaultValues: "apple",
};
DefaultValue.argTypes = {
	defaultValues: {
		description: "Default value for the field, this is declared outside `sections`",
		table: {
			type: {
				summary: "string",
			},
		},
	},
};

export const Disabled = DefaultStoryTemplate<ISelectSchema>("select-disabled").bind({});
Disabled.args = {
	uiType: "select",
	label: "Fruits",
	options: [
		{ label: "Apple", value: "apple" },
		{ label: "Berry", value: "berry" },
		{ label: "Cherry", value: "cherry" },
	],
	disabled: true,
};

export const CustomWidth = DefaultStoryTemplate<ISelectSchema>("select-custom-width").bind({});
CustomWidth.args = {
	uiType: "select",
	label: "Fruits",
	options: [
		{ label: "Apple", value: "apple" },
		{ label: "Berry", value: "berry" },
		{ label: "Cherry", value: "cherry" },
	],
	listStyleWidth: "12rem",
};

export const Placeholder = DefaultStoryTemplate<ISelectSchema>("select-placeholder").bind({});
Placeholder.args = {
	uiType: "select",
	label: "Fruits",
	options: [
		{ label: "Apple", value: "apple" },
		{ label: "Berry", value: "berry" },
		{ label: "Cherry", value: "cherry" },
	],
	placeholder: "Select your fruit",
};

export const WithValidation = DefaultStoryTemplate<ISelectSchema>("select-with-validation").bind({});
WithValidation.args = {
	uiType: "select",
	label: "Fruits",
	options: [
		{ label: "Apple", value: "apple" },
		{ label: "Berry", value: "berry" },
		{ label: "Cherry", value: "cherry" },
	],
	validation: [{ required: true }],
};

export const Reset = ResetStoryTemplate<ISelectSchema>("select-reset").bind({});
Reset.args = {
	uiType: "select",
	label: "Fruits",
	options: [
		{ label: "Apple", value: "Apple" },
		{ label: "Berry", value: "Berry" },
		{ label: "Cherry", value: "Cherry" },
	],
};

export const ResetWithDefaultValues = ResetStoryTemplate<ISelectSchema>("select-reset-default-values").bind({});
ResetWithDefaultValues.args = {
	uiType: "select",
	label: "Fruits",
	options: [
		{ label: "Apple", value: "Apple" },
		{ label: "Berry", value: "Berry" },
		{ label: "Cherry", value: "Cherry" },
	],
	defaultValues: "Apple",
};
ResetWithDefaultValues.argTypes = {
	defaultValues: {
		description: "Default value for the field, this is declared outside `sections`",
		table: {
			type: {
				summary: "string",
			},
		},
	},
};
