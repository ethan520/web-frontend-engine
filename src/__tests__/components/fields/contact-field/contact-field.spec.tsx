import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FrontendEngine } from "../../../../components";
import { IContactFieldSchema, TSingaporeNumberRule } from "../../../../components/fields";
import { IFrontendEngineData } from "../../../../components/frontend-engine";
import { ERROR_MESSAGES } from "../../../../components/shared";
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
const UI_TYPE = "contact-field";
const COMPONENT_LABEL = "Contact Number";

jest.setTimeout(10000);

const renderComponent = (overrideField?: TOverrideField<IContactFieldSchema>, overrideSchema?: TOverrideSchema) => {
	const json: IFrontendEngineData = {
		id: FRONTEND_ENGINE_ID,
		sections: {
			section: {
				uiType: "section",
				children: {
					[COMPONENT_ID]: {
						label: COMPONENT_LABEL,
						uiType: UI_TYPE,
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

const getContactField = (): HTMLElement => {
	return getField("textbox", COMPONENT_LABEL);
};

const getDefaultDropdownToggle = (): HTMLElement => {
	return screen.getByTestId("addon-selector");
};

describe(UI_TYPE, () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it("should be able to render the field", () => {
		renderComponent();

		expect(getContactField()).toBeInTheDocument();
	});

	it("should be able to support default country", async () => {
		renderComponent({ defaultCountry: "Japan" });
		expect(screen.getByText("+81")).toBeInTheDocument();
	});

	it("should be able to support validation schema", async () => {
		renderComponent({
			validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
		});

		await waitFor(() => fireEvent.click(getSubmitButton()));

		expect(getErrorMessage()).toBeInTheDocument();
	});

	it("should be able to select another country code", async () => {
		renderComponent();

		await waitFor(() => fireEvent.click(getDefaultDropdownToggle()));

		const afghanCode = getField("button", "Afghanistan+93");
		await waitFor(() => fireEvent.click(afghanCode));

		expect(screen.getByText("+93")).toBeInTheDocument();
	});

	it("should be able to support custom placeholder", async () => {
		const placeholder = "custom placeholder";
		renderComponent({ placeholder });

		expect(getContactField()).toHaveAttribute("placeholder", placeholder);
	});

	it("should be able to support search bar", async () => {
		renderComponent({ enableSearch: true });

		await waitFor(() => fireEvent.click(getDefaultDropdownToggle()));

		expect(getField("textbox", "search-input")).toBeInTheDocument();
	});

	describe("it should be able to verify Singapore numbers", () => {
		it("+65 98123456 should be a valid number", async () => {
			const contactNumber = "98123456";
			renderComponent({ validation: [{ contactNumber: { singaporeNumber: "default" } }] });
			fireEvent.change(getContactField(), { target: { value: contactNumber } });
			await waitFor(() => fireEvent.click(getSubmitButton()));
			expect(SUBMIT_FN).toBeCalledWith(expect.objectContaining({ [COMPONENT_ID]: `+65 ${contactNumber}` }));
		});
		it("+65 12345678 should be an invalid number", async () => {
			const contactNumber = "12345678";
			renderComponent({ validation: [{ contactNumber: { singaporeNumber: "default" } }] });
			fireEvent.change(getContactField(), { target: { value: contactNumber } });
			await waitFor(() => fireEvent.click(getSubmitButton()));
			expect(screen.getByText(ERROR_MESSAGES.CONTACT.INVALID_SINGAPORE_NUMBER)).toBeInTheDocument();
		});
		it.each`
			validationType | contactNumber | expected
			${"house"}     | ${"67661234"} | ${"+65 67661234"}
			${"house"}     | ${"98123456"} | ${"error"}
			${"mobile"}    | ${"98123456"} | ${"+65 98123456"}
			${"mobile"}    | ${"67661234"} | ${"error"}
		`(
			"$contactNumber ($validationType number) should return $expected",
			async ({ validationType, contactNumber, expected }) => {
				const isHouseValidation = validationType === "house";
				const singaporeRule: TSingaporeNumberRule = isHouseValidation ? "house" : "mobile";
				renderComponent({
					validation: [{ contactNumber: { singaporeNumber: singaporeRule } }],
				});
				fireEvent.change(getContactField(), { target: { value: contactNumber } });
				await waitFor(() => fireEvent.click(getSubmitButton()));
				if (expected === "error") {
					expect(screen.getByText(ERROR_MESSAGES.CONTACT.INVALID_SINGAPORE_NUMBER)).toBeInTheDocument();
				} else {
					expect(SUBMIT_FN).toBeCalledWith(
						expect.objectContaining({ [COMPONENT_ID]: `+65 ${contactNumber}` })
					);
				}
			}
		);
	});

	describe("it should be able to verify International numbers", () => {
		it("+81 979584362 should be a valid number", async () => {
			const contactNumber = "979584362";
			renderComponent({ validation: [{ contactNumber: { internationalNumber: true } }] });

			await waitFor(() => fireEvent.click(getDefaultDropdownToggle()));

			const japanCode = getField("button", "Japan+81");

			await waitFor(() => fireEvent.click(japanCode));
			fireEvent.change(getContactField(), { target: { value: contactNumber } });
			await waitFor(() => fireEvent.click(getSubmitButton()));

			expect(SUBMIT_FN).toBeCalledWith(expect.objectContaining({ [COMPONENT_ID]: `+81 ${contactNumber}` }));
		});

		it("+81 12-345-678 should be an invalid number", async () => {
			const contactNumber = "12-345-678";
			renderComponent({ validation: [{ contactNumber: { internationalNumber: true } }] });

			await waitFor(() => fireEvent.click(getDefaultDropdownToggle()));

			const japanCode = getField("button", "Japan+81");

			await waitFor(() => fireEvent.click(japanCode));
			fireEvent.change(getContactField(), { target: { value: contactNumber } });
			await waitFor(() => fireEvent.click(getSubmitButton()));

			expect(screen.getByText(ERROR_MESSAGES.CONTACT.INVALID_INTERNATIONAL_NUMBER)).toBeInTheDocument();
		});

		it("should validate against specific country when specified", async () => {
			const contactNumber = "512345678";
			const country = "France";

			renderComponent({
				validation: [
					{
						contactNumber: {
							internationalNumber: country,
						},
					},
				],
			});

			fireEvent.change(getContactField(), { target: { value: contactNumber } });
			await waitFor(() => fireEvent.click(getSubmitButton()));

			expect(SUBMIT_FN).toBeCalledWith(expect.objectContaining({ [COMPONENT_ID]: `+33 ${contactNumber}` }));
		});

		it("should fix the country selection if there is singaporeNumber validation", async () => {
			renderComponent({
				validation: [
					{
						contactNumber: {
							singaporeNumber: "mobile",
						},
					},
				],
			});

			expect(screen.queryByTestId("addon-selector")).not.toBeInTheDocument();
			expect(screen.getByTestId("addon")).toBeInTheDocument();
		});

		it("should fix the specific country if internationalNumber validation has a specific country", async () => {
			const country = "Denmark";

			renderComponent({
				validation: [
					{
						contactNumber: {
							internationalNumber: country,
						},
					},
				],
			});

			expect(screen.queryByTestId("addon-selector")).not.toBeInTheDocument();
			expect(screen.getByTestId("addon")).toBeInTheDocument();
		});

		it("should not fix the country selection if internationalNumber validation does not have a specific country", async () => {
			renderComponent({
				validation: [
					{
						contactNumber: {
							internationalNumber: true,
						},
					},
				],
			});

			expect(screen.getByTestId("addon-selector")).toBeInTheDocument();
			expect(screen.queryByTestId("addon")).not.toBeInTheDocument();
		});

		it("should reject if number format does not match specified country", async () => {
			const contactNumber = "012345678";
			const country = "France";

			renderComponent({
				validation: [
					{
						contactNumber: {
							internationalNumber: country,
						},
					},
				],
			});

			fireEvent.change(getContactField(), { target: { value: contactNumber } });
			await waitFor(() => fireEvent.click(getSubmitButton()));

			expect(screen.getByText(ERROR_MESSAGES.CONTACT.INVALID_INTERNATIONAL_NUMBER)).toBeInTheDocument();
		});
	});

	describe("reset", () => {
		it("should clear selection on reset", async () => {
			renderComponent();

			fireEvent.change(getContactField(), { target: { value: "91234567" } });
			fireEvent.click(getResetButton());
			await waitFor(() => fireEvent.click(getSubmitButton()));

			expect(getContactField()).toHaveValue("");
			expect(SUBMIT_FN).toBeCalledWith(expect.objectContaining({ [COMPONENT_ID]: undefined }));
		});

		it("should revert to default value on reset", async () => {
			const defaultValues = "91234567";
			renderComponent(undefined, { defaultValues: { [COMPONENT_ID]: defaultValues } });

			fireEvent.change(getContactField(), { target: { value: "987654321" } });
			fireEvent.click(getResetButton());
			await waitFor(() => fireEvent.click(getSubmitButton()));

			expect(getContactField()).toHaveValue("9123 4567");
			expect(SUBMIT_FN).toBeCalledWith(expect.objectContaining({ [COMPONENT_ID]: defaultValues }));
		});
	});
});
