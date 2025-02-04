import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FrontendEngine } from "../../../../components";
import { ITextareaSchema } from "../../../../components/fields";
import { IFrontendEngineData } from "../../../../components/types";
import {
	ERROR_MESSAGE,
	FRONTEND_ENGINE_ID,
	TOverrideField,
	TOverrideSchema,
	getErrorMessage,
	getField,
	getResetButton,
	getResetButtonProps,
	getSubmitButton,
	getSubmitButtonProps,
} from "../../../common";

const SUBMIT_FN = jest.fn();
const COMPONENT_ID = "field";
const UI_TYPE = "textarea";
const COMPONENT_LABEL = "Textarea";

const renderComponent = (overrideField?: TOverrideField<ITextareaSchema>, overrideSchema?: TOverrideSchema) => {
	const json: IFrontendEngineData = {
		id: FRONTEND_ENGINE_ID,
		sections: {
			section: {
				uiType: "section",
				children: {
					[COMPONENT_ID]: {
						label: COMPONENT_LABEL,
						uiType: "textarea",
						...overrideField,
					},
					...getSubmitButtonProps(),
					...getResetButtonProps(),
				},
			},
		},
		...overrideSchema,
	};
	return render(<FrontendEngine data={json} onSubmit={SUBMIT_FN} />);
};

const getTextarea = (): HTMLElement => {
	return getField("textbox", COMPONENT_LABEL);
};

describe(UI_TYPE, () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it("should be able to render the field", () => {
		renderComponent();

		expect(getTextarea()).toBeInTheDocument();
	});

	it("should support validation schema", async () => {
		renderComponent({ validation: [{ required: true, errorMessage: ERROR_MESSAGE }] });

		await waitFor(() => fireEvent.click(getSubmitButton()));

		expect(getErrorMessage()).toBeInTheDocument();
	});

	it("should support default value", async () => {
		const defaultValue = "hello";
		renderComponent(undefined, { defaultValues: { [COMPONENT_ID]: defaultValue } });

		expect(screen.getByText(defaultValue)).toBeInTheDocument();

		await waitFor(() => fireEvent.click(getSubmitButton()));
		expect(SUBMIT_FN).toBeCalledWith(expect.objectContaining({ [COMPONENT_ID]: defaultValue }));
	});

	it("should apply maxLength attribute if max validation is specified", () => {
		renderComponent({ validation: [{ max: 100 }] });

		expect(getTextarea()).toHaveAttribute("maxLength", "100");
	});

	it("should apply maxLength attribute if length validation is specified", () => {
		renderComponent({ validation: [{ length: 100 }] });

		expect(getTextarea()).toHaveAttribute("maxLength", "100");
	});

	it("should be able to show character counter if max validation is defined", () => {
		renderComponent({ validation: [{ max: 100 }] });

		expect(screen.getByText("100 characters left")).toBeInTheDocument();
	});

	it("should show pills as defined in chipTexts", () => {
		renderComponent({ chipTexts: ["Pill 1", "Pill 2", "Pill 3"] });

		expect(screen.getByText("Pill 1")).toBeInTheDocument();
		expect(screen.getByText("Pill 2")).toBeInTheDocument();
		expect(screen.getByText("Pill 3")).toBeInTheDocument();
	});

	it("should append text upon clicking a pill", () => {
		renderComponent({ chipTexts: ["Pill 1", "Pill 2", "Pill 3"] });

		fireEvent.change(getTextarea(), {
			target: { value: "Hello" },
		});
		fireEvent.click(screen.getByText("Pill 1"));

		expect(screen.getByText("Hello Pill 1")).toBeInTheDocument();
	});

	it("should pass other props into the field", () => {
		renderComponent({
			rows: 5,
			placeholder: "placeholder",
			readOnly: true,
			disabled: true,
		});

		expect(getTextarea()).toHaveAttribute("rows", "5");
		expect(getTextarea()).toHaveAttribute("placeholder", "placeholder");
		expect(getTextarea()).toHaveAttribute("readonly");
		expect(getTextarea()).toBeDisabled();
	});

	describe("reset", () => {
		it("should clear selection on reset", async () => {
			renderComponent();

			fireEvent.change(getTextarea(), { target: { value: "hello" } });
			fireEvent.click(getResetButton());
			await waitFor(() => fireEvent.click(getSubmitButton()));

			expect(getTextarea()).toHaveValue("");
			expect(SUBMIT_FN).toBeCalledWith(expect.objectContaining({ [COMPONENT_ID]: undefined }));
		});

		it("should revert to default value on reset", async () => {
			const defaultValue = "hello";
			renderComponent(undefined, { defaultValues: { [COMPONENT_ID]: defaultValue } });

			fireEvent.change(getTextarea(), { target: { value: "world" } });
			fireEvent.click(getResetButton());
			await waitFor(() => fireEvent.click(getSubmitButton()));

			expect(getTextarea()).toHaveValue(defaultValue);
			expect(SUBMIT_FN).toBeCalledWith(expect.objectContaining({ [COMPONENT_ID]: defaultValue }));
		});
	});
});
