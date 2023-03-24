import isEmpty from "lodash/isEmpty";
import React, { Fragment, useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import * as FrontendEngineElements from "..";
import { TestHelper } from "../../../utils";
import * as FrontendEngineFields from "../../fields";
import { EElementType, EFieldType, IGenericFieldProps, TFrontendEngineFieldSchema } from "../../frontend-engine/types";
import { ERROR_MESSAGES } from "../../shared";
import { ConditionalRenderer } from "./conditional-renderer";
import { IWrapperSchema } from "./types";
import { DSAlert } from "./wrapper.styles";

interface IWrapperProps {
	id?: string | undefined;
	schema?: IWrapperSchema | undefined;
	/** only used internally by FrontendEngine */
	children?: Record<string, TFrontendEngineFieldSchema> | undefined;
	warnings?: Record<string, string> | undefined;
}

export const Wrapper = (props: IWrapperProps): JSX.Element | null => {
	// =============================================================================
	// CONST, STATE, REF
	// =============================================================================
	const { id, schema, children, warnings } = props;
	const { uiType, children: schemaChildren, ...otherSchema } = schema || {};
	const [fields, setFields] = useState<React.ReactNode>(null);
	const { control } = useFormContext();

	// =============================================================================
	// EFFECTS
	// =============================================================================
	/**
	 * render direct descendants according to the type of children
	 * - conditionally render fields through Controller
	 * - render strings directly
	 * - otherwise show field not supported error
	 */
	useEffect(() => {
		const wrapperChildren = schemaChildren || children;
		if (typeof wrapperChildren === "object") {
			const fieldTypeKeys = Object.keys(EFieldType);
			const elementTypeKeys = Object.keys(EElementType);
			const fieldComponents: JSX.Element[] = [];

			Object.entries(wrapperChildren).forEach(([id, child]) => {
				if (isEmpty(child) || typeof child !== "object") return;
				const uiType = child.uiType?.toUpperCase();
				const frontendEngineComponents = { ...FrontendEngineFields, ...FrontendEngineElements };

				if (fieldTypeKeys.includes(uiType)) {
					// render fields with controller to register them into react-hook-form
					const Field = frontendEngineComponents[EFieldType[uiType]];
					fieldComponents.push(
						<ConditionalRenderer id={id} key={id} renderRules={child.showIf}>
							<Controller
								control={control}
								name={id}
								shouldUnregister={true}
								render={({ field, fieldState }) => {
									const fieldProps = { ...field, id, ref: undefined }; // not passing ref because not all components have fields to be manipulated
									const warning = warnings ? warnings[id] : "";

									if (!warning) {
										return <Field schema={child} {...fieldProps} {...fieldState} />;
									}
									return (
										<>
											<Field schema={child} {...fieldProps} {...fieldState} />
											<DSAlert type="warning">{warning}</DSAlert>
										</>
									);
								}}
							/>
						</ConditionalRenderer>
					);
				} else if (elementTypeKeys.includes(uiType)) {
					// render other elements as normal components
					const Element = (frontendEngineComponents[EElementType[uiType]] ||
						Wrapper) as React.ForwardRefExoticComponent<IGenericFieldProps<TFrontendEngineFieldSchema>>;
					fieldComponents.push(
						<ConditionalRenderer id={id} key={id} renderRules={child.showIf}>
							<Element schema={child} id={id} />
						</ConditionalRenderer>
					);
				} else {
					// need uiType check to ignore other storybook args
					fieldComponents.push(<Fragment key={id}>{ERROR_MESSAGES.GENERIC.UNSUPPORTED}</Fragment>);
				}
			});
			setFields(fieldComponents);
		} else if (typeof wrapperChildren === "string") {
			setFields(wrapperChildren);
		} else {
			setFields(ERROR_MESSAGES.GENERIC.UNSUPPORTED);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [schemaChildren || children, control, warnings]);

	// =============================================================================
	// RENDER FUNCTIONS
	// =============================================================================
	const Element = uiType as string | React.FunctionComponent;

	if (!Element) {
		return <>{fields}</>;
	}
	return (
		<Element {...otherSchema} {...{ id, "data-testid": TestHelper.generateId(id, uiType) }}>
			{fields}
		</Element>
	);
};
