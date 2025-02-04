import {
	ControllerFieldState,
	ControllerRenderProps,
	UseFormReset,
	UseFormSetValue,
	ValidationMode,
} from "react-hook-form";
import { IFilterSchema } from "../custom/filter/filter/types";
import { IAlertSchema, ITextSchema } from "../elements";
import { ISectionSchema } from "../elements/section";
import { IWrapperSchema } from "../elements/wrapper";
import {
	ICheckboxGroupSchema,
	IChipsSchema,
	IContactFieldSchema,
	IDateFieldSchema,
	IEmailFieldSchema,
	IImageUploadSchema,
	IMultiSelectSchema,
	INumericFieldSchema,
	IRadioButtonGroupSchema,
	IRangeSelectSchema,
	IResetButtonSchema,
	ISelectSchema,
	ISubmitButtonSchema,
	ISwitchSchema,
	ITextFieldSchema,
	ITextareaSchema,
	ITimeFieldSchema,
	IUnitNumberFieldSchema,
} from "../fields";
import { IYupValidationRule, TRenderRules, TYupSchemaType } from "./yup";

// =============================================================================
// YUP SCHEMA
// =============================================================================
export type { IYupValidationRule } from "./yup";

// =============================================================================
// FRONTEND ENGINE
// =============================================================================
export interface IFrontendEngineProps<V = undefined> {
	/** HTML class attribute that is applied on the `<form>` element */
	className?: string;
	/** JSON configuration to define the components and functionalities of the form */
	data?: IFrontendEngineData<V> | undefined;
	/** Fires every time a value changes in any fields */
	onChange?: ((values: TFrontendEngineValues, isValid?: boolean | undefined) => unknown) | undefined;
	/** Submit event handler, will receive the form data if form validation is successful */
	onSubmit?: (values: TFrontendEngineValues) => unknown | undefined;
	/** Submit error event handler, invoked when form fails validation on submissiohn. Will receive validation errors */
	onSubmitError?: (errors: TFrontendEngineValues) => unknown | undefined;
}

export interface IFrontendEngineData<V = undefined> {
	/** HTML class attribute */
	className?: string | undefined;
	/** Fields' initial values on mount. The key of each field needs to match the id used in the field */
	defaultValues?: TFrontendEngineValues | undefined;
	/**
	 * Specifies the components to be rendered
	 *
	 * All components within the form are in key-value format, key refers to the id of the components while value refers to its JSON schema
	 *
	 * Note: sections accept only section `uiType`, the subsequent children accepts uiType other than section
	 * */
	sections: Record<string, ISectionSchema<V>>;
	/** Unique HTML id attribute that is applied on the `<form>` element */
	id?: string | undefined;
	/** Validation strategy when inputs with errors get re-validated after a user submits the form (onSubmit event) */
	revalidationMode?: TRevalidationMode | undefined;
	/** Validation strategy before a user submits the form (onSubmit event) */
	validationMode?: TValidationMode | undefined;
}

// NOTE: add all possible schema types here except section schema
export type TFrontendEngineFieldSchema<V = undefined> =
	| IAlertSchema
	| ICheckboxGroupSchema<V>
	| IChipsSchema<V>
	| IContactFieldSchema<V>
	| ICustomComponentJsonSchema<V>
	| IDateFieldSchema<V>
	| IEmailFieldSchema<V>
	| IFilterSchema
	| IImageUploadSchema<V>
	| IMultiSelectSchema<V>
	| IRangeSelectSchema<V>
	| INumericFieldSchema<V>
	| IRadioButtonGroupSchema<V>
	| IResetButtonSchema
	| ISelectSchema<V>
	| ISubmitButtonSchema
	| ISwitchSchema<V>
	| ITextSchema
	| ITextareaSchema<V>
	| ITextFieldSchema<V>
	| ITimeFieldSchema<V>
	| IUnitNumberFieldSchema<V>
	| IWrapperSchema;

export type TFrontendEngineValues<T = any> = Record<keyof T, T[keyof T]>;
export type TRevalidationMode = Exclude<keyof ValidationMode, "onTouched" | "all">;
export type TValidationMode = keyof ValidationMode;

export type TErrorMessage = string | string[] | Record<string, string | string[]>;
export type TErrorPayload = Record<string, TErrorMessage>;
export interface IFrontendEngineRef extends HTMLFormElement {
	addCustomValidation: (
		type: TYupSchemaType | "mixed",
		name: string,
		fn: (value: unknown, arg: unknown) => boolean
	) => void;
	addFieldEventListener: (
		type: string,
		id: string,
		listener: (ev: Event) => any,
		options?: boolean | AddEventListenerOptions
	) => void;
	dispatchFieldEvent: (type: string, id: string, detail?: any) => boolean;
	/** gets form values */
	getValues: () => TFrontendEngineValues;
	/** checks if form is valid */
	isValid: () => boolean;
	/** adds custom validation rule */
	removeFieldEventListener: (
		type: string,
		id: string,
		listener: (ev: Event) => any,
		options?: boolean | EventListenerOptions
	) => void;
	/** resets the form to the default state */
	reset: UseFormReset<TFrontendEngineValues>;
	/** allows setting of custom errors thrown by endpoints */
	setErrors: (errors: TErrorPayload) => void;
	/** sets field value by id */
	setValue: UseFormSetValue<TFrontendEngineValues>;
	/** triggers form submission */
	submit: () => void;
}

// =============================================================================
// JSON SCHEMA
// =============================================================================
// NOTE: U generic is for internal use, prevents getting overwritten by custom validation types
export interface IFrontendEngineBaseFieldJsonSchema<T, V = undefined, U = undefined> {
	/** defines what kind of component to be rendered */
	uiType: T;
	/** caption for the field */
	label: string;
	/** render conditions
	 * - need to fulfil at least 1 object in array (OR condition)
	 * - in order for an object to be valid, need to fulfil all conditions in that object (AND condition) */
	showIf?: TRenderRules[] | undefined;
	/** validation config, can be customised by passing generics */
	validation?: (V | U | IYupValidationRule)[];
	/** escape hatch for other form / frontend engines to have unsupported attributes */
	customOptions?: Record<string, unknown> | undefined;
}

/**
 * to support custom components from other form / frontend engines
 */
export interface ICustomComponentJsonSchema<T> {
	referenceKey: T;
	uiType?: never | undefined;
}

export interface ICustomFieldJsonSchema<T, V = undefined, U = undefined> extends ICustomComponentJsonSchema<T> {
	validation?: (V | U | IYupValidationRule)[];
	/** render conditions
	 * - need to fulfil at least 1 object in array (OR condition)
	 * - in order for an object to be valid, need to fulfil all conditions in that object (AND condition) */
	showIf?: TRenderRules[] | undefined;
}

/**
 * JSON keys to omit from field schema when extending from other interfaces
 * - keys already defined in `IFrontendEngineBaseFieldJsonSchema` to prevent collision
 * - some inherited HTML attributes
 */
export type TFrontendEngineFieldJsonSchemaOmitKeys =
	| "id"
	| "label"
	| "validation"
	| "uiType"
	| "showIf"
	| "children"
	| "value";

// NOTE: Elements should not support validation nor contain labels
export interface IFrontendEngineElementJsonSchema<T>
	extends Omit<IFrontendEngineBaseFieldJsonSchema<T>, "label" | "validation"> {}

// NOTE: undefined allows aggregation of keys if exists
type UnionOptionalKeys<T = undefined> = T extends string | number | symbol
	? TFrontendEngineFieldJsonSchemaOmitKeys | T
	: TFrontendEngineFieldJsonSchemaOmitKeys;

/**
 * Omits clashing keys between native props and frontend engine
 */
export type TComponentOmitProps<T, V = undefined> = Omit<T, UnionOptionalKeys<V>>;

/**
 * Field types
 * - components that can contain values that can get submitted
 */
export enum EFieldType {
	CHECKBOX = "CheckboxGroup",
	CHIPS = "Chips",
	"CONTACT-FIELD" = "ContactField",
	"DATE-FIELD" = "DateField",
	"EMAIL-FIELD" = "TextField",
	"IMAGE-UPLOAD" = "ImageUpload",
	"MULTI-SELECT" = "MultiSelect",
	"RANGE-SELECT" = "RangeSelect",
	"NUMERIC-FIELD" = "TextField",
	RADIO = "RadioButtonGroup",
	RESET = "ResetButton",
	SELECT = "Select",
	SUBMIT = "SubmitButton",
	SWITCH = "Switch",
	TEXTAREA = "Textarea",
	"TEXT-FIELD" = "TextField",
	"TIME-FIELD" = "TimeField",
	"UNIT-NUMBER-FIELD" = "UnitNumberField",
}

/**
 * Non-field types
 * - components that do not have values
 * - typically used for layouts and messages
 */
export enum EElementType {
	ALERT = "Alert",
	"TEXT-D1" = "Text",
	"TEXT-D2" = "Text",
	"TEXT-DBODY" = "Text",
	"TEXT-H1" = "Text",
	"TEXT-H2" = "Text",
	"TEXT-H3" = "Text",
	"TEXT-H4" = "Text",
	"TEXT-H5" = "Text",
	"TEXT-H6" = "Text",
	"TEXT-BODY" = "Text",
	"TEXT-BODYSMALL" = "Text",
	"TEXT-XSMALL" = "Text",
	DIV = "Wrapper",
	SPAN = "Wrapper",
	HEADER = "Wrapper",
	FOOTER = "Wrapper",
	H1 = "Wrapper",
	H2 = "Wrapper",
	H3 = "Wrapper",
	H4 = "Wrapper",
	H5 = "Wrapper",
	H6 = "Wrapper",
	P = "Wrapper",
}

/**
 * Custom element types
 * - components that do not have uiType and have specific schema to render
 */
export enum ECustomElementType {
	FILTER = "Filter",
	"FILTER-ITEM" = "FilterItem",
}

export enum ECustomFieldType {
	"FILTER-CHECKBOX" = "FilterCheckbox",
}

// =============================================================================
// FIELD PROPS
// =============================================================================
export interface IGenericFieldProps<T = TFrontendEngineFieldSchema>
	extends Partial<ControllerFieldState>,
		Partial<ControllerRenderProps> {
	id: string;
	schema: T;
}

// =============================================================================
// HELPERS
// =============================================================================
/**
 * prevents inferrence
 * https://stackoverflow.com/questions/56687668/a-way-to-disable-type-argument-inference-in-generics
 */
export type TNoInfer<T, U> = [T][T extends U ? 0 : never];
