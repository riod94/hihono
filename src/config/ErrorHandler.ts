import { errors } from "@vinejs/vine";
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import validationRules from "../lang/validation";
import { __ } from "../lang";

const ErrorHandler = (err: any, c: Context) => {
    const localization = c.req.header('x-localization') || 'en';

    // Handle syntax errors
    if (err instanceof SyntaxError) {
        return c.json({ message: err.message, title: err.name }, 400);
    }

    // Handle HTTP exceptions
    if (err instanceof HTTPException) {
        // Handle Invalid HTTP headers
        if (err.status === 400 && err.message.includes('Invalid HTTP header:')) {
            const headerName = err.message.split(':')[1].trim();
            return c.json({ message: `Invalid HTTP header: ${headerName}` }, 400);
        }

        // Handle Malformed JSON
        if (err.status === 400 && err.message.includes('Malformed JSON in request body')) {
            return c.json({ message: 'Malformed JSON in request body' }, 400);
        }

        return c.json({ error: err.message }, err.status);
    }

    // Handle Vine validation errors
    if (err instanceof errors.E_VALIDATION_ERROR) {
        // Parse validation errors
        const parseErrors = err.messages.map((error: any) => {
            // Extract error details
            const { field, rule, meta } = error;
            // Get validation error message
            const msgValRule: string = validationRules[rule];
            let params: { [key: string]: any } = {
                field
            }

            if (meta) {
                params = {
                    ...params,
                    ...meta
                }
            }

            const message = __(msgValRule, params, localization);

            return {
                field,
                message,
                rule
            }
        })
        // Handle validation errors
        return c.json({ message: __('The given data was invalid', {}, localization), errors: parseErrors }, 422);
    }

    console.error('Error handler', err)
    // Handle other errors
    return c.json({ error: 'Something went wrong. Please try again later' }, 500);
}

export default ErrorHandler