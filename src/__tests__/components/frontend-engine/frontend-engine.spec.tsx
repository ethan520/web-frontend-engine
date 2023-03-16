import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { FrontendEngine } from "../../../components";
import { IYupValidationRule } from "../../../components/frontend-engine/yup";
import { IFrontendEngineData, IFrontendEngineProps, IFrontendEngineRef } from "../../../components/types";
import { TestHelper } from "../../../utils";
import {
	ERROR_MESSAGE,
	FRONTEND_ENGINE_ID,
	getErrorMessage,
	getField,
	getSubmitButton,
	getSubmitButtonProps,
} from "../../common";

const fieldType = "text";
const fieldOneId = "field1";
const fieldOneLabel = "Field 1";
const fieldTwoId = "field2";
const fieldTwoLabel = "Field 2";
const customButtonLabel = "custom button";
const componentTestId = TestHelper.generateId(FRONTEND_ENGINE_ID, "frontend-engine");

const JSON_SCHEMA: IFrontendEngineData = {
	id: FRONTEND_ENGINE_ID,
	fields: {
		[fieldOneId]: {
			label: fieldOneLabel,
			fieldType,
			validation: [
				{ required: true, errorMessage: ERROR_MESSAGE },
				{ min: 2, errorMessage: ERROR_MESSAGE },
			],
		},
		...getSubmitButtonProps(),
	},
};

const NESTED_JSON_SCHEMA: IFrontendEngineData = {
	id: FRONTEND_ENGINE_ID,
	fields: {
		[fieldOneId]: {
			fieldType: "div",
			children: {
				header: {
					fieldType: "h6",
					children: "Fill in your name below",
				},
				[fieldTwoId]: {
					label: fieldTwoLabel,
					fieldType,
					validation: [{ required: true }],
				},
				...getSubmitButtonProps(),
			},
		},
	},
};

const getFieldOne = (): HTMLElement => {
	return getField("textbox", fieldOneLabel);
};

const getFieldTwo = (): HTMLElement => {
	return getField("textbox", fieldTwoLabel);
};

const getCustomButton = (): HTMLElement => {
	return screen.getByRole("button", { name: customButtonLabel });
};

const FrontendEngineWithCustomButton = (props: {
	onSubmit?: () => void;
	onClick: (ref: React.MutableRefObject<IFrontendEngineRef>) => void;
	isNested?: boolean;
}) => {
	const { onSubmit, onClick, isNested } = props;
	const ref = useRef<IFrontendEngineRef>();

	return (
		<>
			<FrontendEngine data={isNested ? NESTED_JSON_SCHEMA : JSON_SCHEMA} ref={ref} onSubmit={onSubmit} />
			<button type="button" onClick={() => onClick(ref)}>
				{customButtonLabel}
			</button>
		</>
	);
};

const renderComponent = (
	overrideProps?: Partial<IFrontendEngineProps>,
	overrideData?: Partial<IFrontendEngineData>
) => {
	const json: IFrontendEngineData = {
		...JSON_SCHEMA,
		...overrideData,
		fields: {
			...JSON_SCHEMA.fields,
			...overrideData?.fields,
		},
	};
	return render(<FrontendEngine {...overrideProps} data={json} />);
};

describe("frontend-engine", () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it("should render a form with JSON provided", () => {
		renderComponent();

		expect(screen.getByTestId(componentTestId)).toBeInTheDocument();
		expect(getFieldOne()).toBeInTheDocument();
	});

	it("should call onChange prop on change", async () => {
		const onChange = jest.fn();
		renderComponent({
			onChange,
		});

		fireEvent.change(getFieldOne(), { target: { value: "hello" } });
		await waitFor(() => fireEvent.click(getSubmitButton()));

		expect(onChange).toBeCalledWith(expect.objectContaining({ [fieldOneId]: "hello" }), true);
	});

	it("should call onSubmit prop on submit", async () => {
		const onSubmit = jest.fn();
		renderComponent({
			onSubmit,
		});

		fireEvent.change(getFieldOne(), { target: { value: "hello" } });
		await waitFor(() => fireEvent.click(getSubmitButton()));

		expect(onSubmit).toBeCalled();
	});

	it("should return form values through getValues method", () => {
		let formValues: Record<string, any> = {};
		const handleClick = (ref: React.MutableRefObject<IFrontendEngineRef>) => {
			formValues = ref.current.getValues();
		};
		render(<FrontendEngineWithCustomButton onClick={handleClick} />);

		fireEvent.change(getFieldOne(), { target: { value: "hello" } });
		fireEvent.click(getCustomButton());

		expect(formValues?.[fieldOneId]).toBe("hello");
	});

	it("should update field value through setValue method", async () => {
		const onSubmit = jest.fn();
		const handleClick = (ref: React.MutableRefObject<IFrontendEngineRef>) => {
			ref.current.setValue(fieldOneId, "hello");
		};
		render(<FrontendEngineWithCustomButton onClick={handleClick} onSubmit={onSubmit} />);

		fireEvent.click(getCustomButton());
		await waitFor(() => fireEvent.click(getSubmitButton()));

		expect(onSubmit).toBeCalledWith(expect.objectContaining({ [fieldOneId]: "hello" }));
	});

	it("should return form validity through checkValid method", async () => {
		let isValid = false;
		const handleClick = (ref: React.MutableRefObject<IFrontendEngineRef>) => {
			isValid = ref.current.isValid();
		};
		render(<FrontendEngineWithCustomButton onClick={handleClick} />);

		fireEvent.click(getCustomButton());
		expect(isValid).toBe(false);

		fireEvent.change(getFieldOne(), { target: { value: "hello" } });
		fireEvent.click(getCustomButton());
		expect(isValid).toBe(true);
	});

	it("should submit through submit method", async () => {
		const submitFn = jest.fn();
		const handleClick = (ref: React.MutableRefObject<IFrontendEngineRef>) => ref.current.submit();
		render(<FrontendEngineWithCustomButton onSubmit={submitFn} onClick={handleClick} />);

		fireEvent.change(getFieldOne(), { target: { value: "hello" } });
		await waitFor(() => fireEvent.click(getCustomButton()));

		expect(submitFn).toBeCalled();
	});

	it("should support custom validation", async () => {
		interface IYupCustomValidationRule extends IYupValidationRule {
			mustBeHello?: boolean | undefined;
		}

		const FrontendEngineWithCustomRule = () => {
			const ref = useRef<IFrontendEngineRef>();
			useEffect(() => {
				ref.current?.addCustomValidation("string", "mustBeHello", (value) => value === "hello");
			}, [ref]);

			return (
				<FrontendEngine<IYupCustomValidationRule>
					ref={ref}
					data={{
						...JSON_SCHEMA,
						fields: {
							...JSON_SCHEMA.fields,
							[fieldOneId]: {
								label: fieldOneLabel,
								fieldType,
								validation: [{ mustBeHello: true, errorMessage: ERROR_MESSAGE }],
							},
						},
					}}
				/>
			);
		};
		render(<FrontendEngineWithCustomRule />);

		fireEvent.change(getFieldOne(), { target: { value: "hi" } });
		await waitFor(() => fireEvent.click(getSubmitButton()));
		expect(getErrorMessage()).toBeInTheDocument();

		fireEvent.change(getFieldOne(), { target: { value: "hello" } });
		await waitFor(() => fireEvent.click(getSubmitButton()));
		expect(getErrorMessage(true)).not.toBeInTheDocument();
	});

	describe("setErrors", () => {
		const handleClickDefault = async (ref: React.MutableRefObject<IFrontendEngineRef>) => {
			try {
				throw new Error("API error");
			} catch (error) {
				ref.current.setErrors({
					[fieldOneId]: ERROR_MESSAGE,
				});
			}
		};

		const handleClickArray = async (ref: React.MutableRefObject<IFrontendEngineRef>) => {
			try {
				throw new Error("API error");
			} catch (error) {
				ref.current.setErrors({
					[fieldOneId]: [ERROR_MESSAGE],
				});
			}
		};

		const handleClickNested = async (ref: React.MutableRefObject<IFrontendEngineRef>) => {
			try {
				throw new Error("API error");
			} catch (error) {
				ref.current.setErrors({
					[fieldOneId]: {
						[fieldTwoId]: ERROR_MESSAGE,
					},
				});
			}
		};

		it("should support setting of custom errors", async () => {
			render(<FrontendEngineWithCustomButton onClick={handleClickDefault} />);
			await waitFor(() => fireEvent.click(getCustomButton()));

			expect(getFieldOne().nextSibling.textContent).toMatch(ERROR_MESSAGE);
		});

		it("should support setting of custom errors for nested fields", async () => {
			render(<FrontendEngineWithCustomButton onClick={handleClickNested} isNested />);
			await waitFor(() => fireEvent.click(getCustomButton()));

			expect(getFieldTwo().nextSibling.textContent).toMatch(ERROR_MESSAGE);
		});

		it("should clear the error message related to API when the user edits the field", async () => {
			render(<FrontendEngineWithCustomButton onClick={handleClickDefault} />);
			await waitFor(() => fireEvent.click(getCustomButton()));

			fireEvent.change(getFieldOne(), { target: { value: "hello" } });

			expect(getErrorMessage(true)).not.toBeInTheDocument();
		});

		describe("errorMessage type", () => {
			it.each`
				type        | onClick
				${"string"} | ${handleClickDefault}
				${"array"}  | ${handleClickArray}
			`("should suppport error message of $type type", async ({ type, onClick }) => {
				switch (type) {
					case "string":
						render(<FrontendEngineWithCustomButton onClick={onClick} />);
						break;
					case "array":
						render(<FrontendEngineWithCustomButton onClick={onClick} />);
						break;
				}
				await waitFor(() => fireEvent.click(getCustomButton()));

				fireEvent.change(getFieldOne(), { target: { value: "hello" } });

				expect(getErrorMessage(true)).not.toBeInTheDocument();
			});
		});
	});

	describe("validationMode", () => {
		it("should validate on submit by default", async () => {
			renderComponent();

			fireEvent.change(getFieldOne(), { target: { value: "h" } });
			expect(getErrorMessage(true)).not.toBeInTheDocument();

			await waitFor(() => fireEvent.click(getSubmitButton()));
			expect(getErrorMessage()).toBeInTheDocument();
		});

		it("should support onBlur validationMode", async () => {
			renderComponent(undefined, { validationMode: "onBlur" });

			fireEvent.change(getFieldOne(), { target: { value: "h" } });
			expect(getErrorMessage(true)).not.toBeInTheDocument();

			await waitFor(() => fireEvent.blur(getFieldOne()));
			expect(getErrorMessage()).toBeInTheDocument();
		});

		it("should support onChange validationMode", async () => {
			renderComponent(undefined, { validationMode: "onChange" });

			expect(getErrorMessage(true)).not.toBeInTheDocument();

			await waitFor(() => fireEvent.change(getFieldOne(), { target: { value: "h" } }));
			expect(getErrorMessage()).toBeInTheDocument();
		});
	});

	describe("revalidationMode", () => {
		it("should revalidate on change by default", async () => {
			renderComponent();

			fireEvent.change(getFieldOne(), { target: { value: "he" } });
			await waitFor(() => fireEvent.click(getSubmitButton()));
			expect(getErrorMessage(true)).not.toBeInTheDocument();

			await waitFor(() => fireEvent.change(getFieldOne(), { target: { value: "h" } }));
			expect(getErrorMessage()).toBeInTheDocument();
		});

		it("should support onBlur revalidationMode", async () => {
			renderComponent(undefined, { revalidationMode: "onBlur" });

			fireEvent.change(getFieldOne(), { target: { value: "he" } });
			await waitFor(() => fireEvent.click(getSubmitButton()));

			fireEvent.change(getFieldOne(), { target: { value: "h" } });
			expect(getErrorMessage(true)).not.toBeInTheDocument();

			await waitFor(() => fireEvent.blur(getFieldOne()));
			expect(getErrorMessage()).toBeInTheDocument();
		});

		it("should support onSubmit revalidationMode", async () => {
			renderComponent(undefined, { revalidationMode: "onSubmit" });

			fireEvent.change(getFieldOne(), { target: { value: "he" } });
			await waitFor(() => fireEvent.click(getSubmitButton()));

			fireEvent.change(getFieldOne(), { target: { value: "h" } });
			expect(getErrorMessage(true)).not.toBeInTheDocument();

			await waitFor(() => fireEvent.click(getSubmitButton()));
			expect(getErrorMessage()).toBeInTheDocument();
		});
	});
});
