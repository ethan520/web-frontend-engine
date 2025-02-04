import { Form } from "@lifesg/react-design-system/form";
import { InputSelect } from "@lifesg/react-design-system/input-select";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import useDeepCompareEffect from "use-deep-compare-effect";
import * as Yup from "yup";
import { TestHelper } from "../../../utils";
import { useValidationConfig } from "../../../utils/hooks";
import { IGenericFieldProps } from "../../frontend-engine";
import { ISelectOption, ISelectSchema } from "./types";

export const Select = (props: IGenericFieldProps<ISelectSchema>) => {
	// =============================================================================
	// CONST, STATE, REFS
	// =============================================================================
	const {
		schema: { label, validation, options, ...otherSchema },
		id,
		name,
		value,
		error,
		onChange,
	} = props;

	const { setValue } = useFormContext();
	const [stateValue, setStateValue] = useState<string>(value || "");
	const { setFieldValidationConfig } = useValidationConfig();

	// =============================================================================
	// EFFECTS
	// =============================================================================
	useEffect(() => {
		setFieldValidationConfig(id, Yup.string(), validation);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [validation]);

	useDeepCompareEffect(() => {
		if (!options.find((option) => option.value === value)) {
			setValue(id, "");
		}
	}, [options]);

	useEffect(() => {
		setStateValue(value || "");
	}, [value]);

	// =============================================================================
	// HELPER FUNCTIONS
	// =============================================================================
	const getSelectOption = (): ISelectOption => options.find(({ value }) => value === stateValue);

	// =============================================================================
	// EVENT HANDLERS
	// =============================================================================
	const handleChange = (_, option: string): void => {
		onChange({ target: { value: option } });
	};

	// =============================================================================
	// RENDER FUNCTIONS
	// =============================================================================
	return (
		<Form.CustomField id={id} label={label} errorMessage={error?.message}>
			<InputSelect
				{...otherSchema}
				id={id}
				data-testid={TestHelper.generateId(id, "select")}
				name={name}
				error={!!error?.message}
				options={options}
				onSelectOption={handleChange}
				selectedOption={getSelectOption()}
				displayValueExtractor={(item: ISelectOption) => item.label}
				valueExtractor={(item: ISelectOption) => item.value}
				listExtractor={(item: ISelectOption) => item.label}
			/>
		</Form.CustomField>
	);
};
