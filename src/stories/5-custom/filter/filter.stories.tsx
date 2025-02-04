import { ArgsTable, Description, Heading, PRIMARY_STORY, Stories, Title } from "@storybook/addon-docs";
import { Meta, Story } from "@storybook/react/types-6-0";
import { CommonCustomStoryProps, FrontendEngine } from "../../common";
import { IFilterSchema } from "../../../components/custom/filter/filter/types";
import { useRef } from "react";
import { IFrontendEngineRef } from "../../../components";

export default {
	title: "Custom/Filter",
	parameters: {
		docs: {
			page: () => (
				<>
					<Title>Filter</Title>
					<Description>Displays widgets under collapsible panels to filter data results</Description>
					<Heading>Props</Heading>
					<ArgsTable story={PRIMARY_STORY} />
					<Stories includePrimary={true} title="Examples" />
				</>
			),
		},
	},
	argTypes: {
		...CommonCustomStoryProps("filter"),
		label: {
			description: "A name/description of the purpose of the element used in desktop view",
			table: {
				type: {
					summary: "string",
				},
			},
		},
		toggleFilterButtonLabel: {
			description: "Filter button label used in mobile view.",
			defaultValue: "Filters Mobile",
		},
		clearButtonDisabled: {
			description: "Toggle to disable the clear filters button",
			control: {
				type: "boolean",
			},
			defaultValue: false,
		},
		children: {
			description:
				"Elements or string that is the descendant of this component. Only accepts FilterItem or FilterCheckbox.",
			table: {
				type: {
					summary:
						"IFilterItemSchema | IFilterItemCheckboxSchema | string | (string | IFilterItemSchema | IFilterItemCheckboxSchema)[]",
				},
			},
			type: { name: "object", value: {}, required: true },
		},
	},
} as Meta;
const Template = (id: string) =>
	((args) => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const formRef = useRef<IFrontendEngineRef>(null);
		return (
			<FrontendEngine
				ref={formRef}
				data={{
					sections: {
						section: {
							uiType: "section",
							children: {
								[id]: args,
							},
						},
					},
				}}
			/>
		);
	}) as Story<IFilterSchema>;

export const Default = Template("wrapper-default").bind({});
Default.args = {
	referenceKey: "filter",
	label: "Filters Desktop",
	toggleFilterButtonLabel: "Filters Mobile",
	children: {
		filterItem1: {
			label: "Search",
			referenceKey: "filter-item",
			children: {
				name: {
					label: "",
					uiType: "text-field",
					placeholder: "Enter keyword",
				},
			},
		},
	},
};

export const DisabledClearButton = Template("wrapper-default").bind({});
DisabledClearButton.args = {
	referenceKey: "filter",
	label: "Filters",
	toggleFilterButtonLabel: "Filters Mobile",
	clearButtonDisabled: true,
	children: {
		filterItem1: {
			label: "Search",
			referenceKey: "filter-item",
			children: {
				name: {
					label: "",
					uiType: "text-field",
					placeholder: "Enter keyword",
				},
			},
		},
	},
};
