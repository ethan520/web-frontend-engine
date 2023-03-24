import { Button } from "@lifesg/react-design-system/button";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { FrontendEngine } from "../../../../components";
import { IMultiSelectSchema } from "../../../../components/fields";
import { IFrontendEngineData } from "../../../../components/frontend-engine";
import {
	ERROR_MESSAGE,
	FRONTEND_ENGINE_ID,
	TOverrideField,
	TOverrideSchema,
	getErrorMessage,
	getField,
	getSubmitButton,
	getSubmitButtonProps,
} from "../../../common";

const submitFn = jest.fn();
const componentId = "field";
const uiType = "multi-select";

const renderComponent = (overrideField?: TOverrideField<IMultiSelectSchema>, overrideSchema?: TOverrideSchema) => {
	const json: IFrontendEngineData = {
		id: FRONTEND_ENGINE_ID,
		fields: {
			[componentId]: {
				label: "Multiselect",
				uiType,
				options: [
					{ label: "A", value: "Apple" },
					{ label: "B", value: "Berry" },
				],
				...overrideField,
			},
			...getSubmitButtonProps(),
		},
		...overrideSchema,
	};
	return render(<FrontendEngine data={json} onSubmit={submitFn} />);
};

const getComponent = (): HTMLElement => {
	return getField("button", "Select");
};

const getCheckboxA = (): HTMLElement => {
	return getField("button", "A");
};

const getCheckboxB = (): HTMLElement => {
	return getField("button", "B");
};

describe(uiType, () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it("should be able to render the field", () => {
		renderComponent();

		expect(getComponent()).toBeInTheDocument();
	});

	it("should be able to support default values", async () => {
		const defaultValues = ["Apple"];
		renderComponent(undefined, { defaultValues: { [componentId]: defaultValues } });

		const toggle = getField("button", "1 selected");
		await waitFor(() => fireEvent.click(toggle));
		expect(getCheckboxA().querySelector("svg")).toBeInTheDocument();

		await waitFor(() => fireEvent.click(getSubmitButton()));
		expect(submitFn).toBeCalledWith(expect.objectContaining({ [componentId]: defaultValues }));
	});

	it("should be able to support validation schema", async () => {
		renderComponent({ validation: [{ required: true, errorMessage: ERROR_MESSAGE }] });

		await waitFor(() => fireEvent.click(getSubmitButton()));

		expect(getErrorMessage()).toBeInTheDocument();
	});

	it("should be disabled if configured", async () => {
		renderComponent({ disabled: true });

		expect(getComponent().parentElement).toHaveAttribute("disabled");
	});

	it("should be able to support custom list style width", () => {
		const width = "24rem";
		renderComponent({ listStyleWidth: width });

		expect(getField("list")).toHaveStyle({ width });
	});

	it("should be able to support custom placeholder", () => {
		const placeholder = "select item";
		renderComponent({ placeholder });

		expect(screen.getByText(placeholder)).toBeInTheDocument();
	});

	it("should be able to toggle the checkboxes", async () => {
		renderComponent();

		await waitFor(() => fireEvent.click(getComponent()));
		const apple = getCheckboxA();
		const berry = getCheckboxB();

		await waitFor(() => fireEvent.click(apple));
		await waitFor(() => fireEvent.click(berry));
		await waitFor(() => fireEvent.click(getSubmitButton()));
		expect(submitFn).toBeCalledWith(expect.objectContaining({ [componentId]: ["Apple", "Berry"] }));

		await waitFor(() => fireEvent.click(apple));
		await waitFor(() => fireEvent.click(getSubmitButton()));
		expect(submitFn).toBeCalledWith(expect.objectContaining({ [componentId]: ["Berry"] }));

		await waitFor(() => fireEvent.click(berry));
		await waitFor(() => fireEvent.click(getSubmitButton()));
		expect(submitFn).toBeCalledWith(expect.objectContaining({ [componentId]: [] }));
	});

	it("should be able to toggle all the checkboxes at once", async () => {
		renderComponent();

		await waitFor(() => fireEvent.click(getComponent()));
		const selectAllButton = getField("button", "Select all");

		await waitFor(() => fireEvent.click(selectAllButton));
		expect(submitFn).toBeCalledWith(expect.objectContaining({ [componentId]: ["Apple", "Berry"] }));

		await waitFor(() => fireEvent.click(selectAllButton));
		expect(submitFn).toBeCalledWith(expect.objectContaining({ [componentId]: [] }));
	});

	describe("update options schema", () => {
		const CustomComponent = () => {
			const [options, setOptions] = useState([
				{ label: "A", value: "Apple" },
				{ label: "B", value: "Berry" },
				{ label: "C", value: "Cherry" },
				{ label: "D", value: "Durian" },
			]);
			return (
				<>
					<FrontendEngine
						data={{
							id: FRONTEND_ENGINE_ID,
							fields: {
								[componentId]: { label: "Multiselect", uiType, options },
								...getSubmitButtonProps(),
							},
						}}
						onSubmit={submitFn}
					/>
					<Button.Default
						onClick={() =>
							setOptions([
								{ label: "A", value: "Apple" },
								{ label: "B", value: "Berry" },
								{ label: "C", value: "C" },
								{ label: "E", value: "Eggplant" },
							])
						}
					>
						Update options
					</Button.Default>
				</>
			);
		};
		it.each`
			scenario                                                                             | selected      | expectedValueBeforeUpdate | expectedValueAfterUpdate
			${"should retain field values if option is not removed on schema update"}            | ${["A", "B"]} | ${["Apple", "Berry"]}     | ${["Apple", "Berry"]}
			${"should clear field values if option is removed on schema update"}                 | ${["C", "D"]} | ${["Cherry", "Durian"]}   | ${[]}
			${"should retain the field values of options that are not removed on schema update"} | ${["A", "D"]} | ${["Apple", "Durian"]}    | ${["Apple"]}
		`(
			"$scenario",
			async ({ selected, expectedValueBeforeUpdate, expectedValueAfterUpdate }: Record<string, string[]>) => {
				render(<CustomComponent />);

				selected.forEach((name) => fireEvent.click(screen.getByRole("button", { name })));
				await waitFor(() => fireEvent.click(getSubmitButton()));
				expect(submitFn).toBeCalledWith(expect.objectContaining({ [componentId]: expectedValueBeforeUpdate }));

				fireEvent.click(screen.getByRole("button", { name: "Update options" }));
				await waitFor(() => fireEvent.click(getSubmitButton()));
				expect(submitFn).toBeCalledWith(expect.objectContaining({ [componentId]: expectedValueAfterUpdate }));
			}
		);
	});
});
