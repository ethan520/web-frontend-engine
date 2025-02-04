import isEmpty from "lodash/isEmpty";
import React, { Fragment, useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import * as FrontendEngineElements from "..";
import * as FrontendEngineCustomComponents from "../../custom";
import { TestHelper } from "../../../utils";
import * as FrontendEngineFields from "../../fields";
import {
	ECustomElementType,
	ECustomFieldType,
	EElementType,
	EFieldType,
	IGenericFieldProps,
	TFrontendEngineFieldSchema,
} from "../../frontend-engine/types";
import { ERROR_MESSAGES } from "../../shared";
import { ConditionalRenderer } from "./conditional-renderer";
import { IWrapperProps } from "./types";
import { DSAlert } from "./wrapper.styles";
import { IFilterItemSchema } from "../../custom/filter/filter-item/types";
import { IFilterCheckboxSchema } from "../../custom/filter/filter-checkbox/types";

const fieldTypeKeys = Object.keys(EFieldType);
const elementTypeKeys = Object.keys(EElementType);
type TComponentRenderType = {
	fieldType?: React.ElementType | undefined;
	elementType?: React.ElementType | undefined;
	fragment?: React.ReactElement | undefined;
};

const renderField = (
	Field: React.ElementType,
	id: string,
	schema: TFrontendEngineFieldSchema,
	control,
	warnings: Record<string, string>
) => {
	return (
		<ConditionalRenderer
			id={id}
			key={id}
			{...(schema && "showIf" in schema && { renderRules: schema.showIf })}
			schema={schema}
		>
			<Controller
				control={control}
				name={id}
				shouldUnregister={true}
				render={({ field, fieldState }) => {
					const fieldProps = { ...field, id, ref: undefined }; // not passing ref because not all components have fields to be manipulated
					const warning = warnings?.[id];

					if (!warning) {
						return <Field schema={schema} {...fieldProps} {...fieldState} />;
					}
					return (
						<>
							<Field schema={schema} {...fieldProps} {...fieldState} />
							<DSAlert type="warning">{warning}</DSAlert>
						</>
					);
				}}
			/>
		</ConditionalRenderer>
	);
};

const renderElement = (
	Element: React.ElementType,
	id: string,
	schema: TFrontendEngineFieldSchema | IFilterCheckboxSchema | IFilterItemSchema
) => {
	return (
		<ConditionalRenderer
			id={id}
			key={id}
			{...(schema && "showIf" in schema && { renderRules: schema.showIf })}
			schema={schema}
		>
			<Element schema={schema} id={id} />
		</ConditionalRenderer>
	);
};

const getCustomComponentType = (referenceKey: string) => {
	const refKey = referenceKey?.toUpperCase();
	// Should check if CustomElement
	if (FrontendEngineCustomComponents[ECustomFieldType[refKey]]) {
		const fieldType = FrontendEngineCustomComponents[ECustomFieldType[refKey]];
		return { fieldType };
	} else if (FrontendEngineCustomComponents[ECustomElementType[refKey]]) {
		const elementType = FrontendEngineCustomComponents[ECustomElementType[refKey]];
		return { elementType };
	}
};

const getComponentTypeOrFragment = (uiType: string, id: string) => {
	// TODO: Refactor to fucntion
	const UIType = uiType?.toUpperCase();
	const frontendEngineComponents = { ...FrontendEngineFields, ...FrontendEngineElements };

	if (fieldTypeKeys.includes(UIType)) {
		// render fields with controller to register them into react-hook-form
		const fieldType = frontendEngineComponents[EFieldType[UIType]];
		return { fieldType };
	} else if (elementTypeKeys.includes(UIType)) {
		// render other elements as normal components
		const elementType = (frontendEngineComponents[EElementType[UIType]] ||
			Wrapper) as React.ForwardRefExoticComponent<IGenericFieldProps<TFrontendEngineFieldSchema>>;
		return { elementType };
	} else {
		// need uiType check to ignore other storybook args
		const fragment = <Fragment key={id}>{ERROR_MESSAGES.GENERIC.UNSUPPORTED}</Fragment>;
		return { fragment };
	}
};

export const Wrapper = (props: IWrapperProps): JSX.Element | null => {
	// =============================================================================
	// CONST, STATE, REF
	// =============================================================================
	const { id, schema, children, warnings } = props;
	const { showIf, uiType, children: schemaChildren, ...otherSchema } = schema || {};
	const [components, setComponents] = useState<React.ReactNode>(null);
	const { control } = useFormContext();

	// =============================================================================
	// EFFECTS
	// =============================================================================
	/**
	 * render direct descendants according to the type of children
	 * - conditionally render components through Controller
	 * - render strings directly
	 * - otherwise show field not supported error
	 */
	useEffect(() => {
		const wrapperChildren = schemaChildren || children;
		if (typeof wrapperChildren === "object") {
			const renderComponents: JSX.Element[] = [];

			Object.entries(wrapperChildren).forEach(([id, child]) => {
				if (isEmpty(child) || typeof child !== "object") return;
				const compType: TComponentRenderType = child.referenceKey
					? getCustomComponentType(child.referenceKey)
					: getComponentTypeOrFragment(child.uiType, id);
				if (!compType) return;
				if (compType.fragment) {
					renderComponents.push(compType.fragment);
				} else {
					compType.fieldType
						? renderComponents.push(renderField(compType.fieldType, id, child, control, warnings))
						: renderComponents.push(renderElement(compType.elementType, id, child));
				}
			});
			setComponents(renderComponents);
		} else if (typeof wrapperChildren === "string") {
			setComponents(wrapperChildren);
		} else {
			setComponents(ERROR_MESSAGES.GENERIC.UNSUPPORTED);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [schemaChildren || children, control, warnings]);

	// =============================================================================
	// RENDER FUNCTIONS
	// =============================================================================
	const Component = uiType as string | React.FunctionComponent;

	if (!Component) {
		return <>{components}</>;
	}
	return (
		<Component {...otherSchema} {...{ id, "data-testid": TestHelper.generateId(id, uiType) }}>
			{components}
		</Component>
	);
};
