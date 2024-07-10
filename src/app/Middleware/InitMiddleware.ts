import { createMiddleware } from "hono/factory";
import { dbConfig } from "../../config/database";
import Storage from "../../utils/Storage";
import { setLocale, unsetLocale } from "../../lang";

export default function InitMiddleware() {
    return createMiddleware(async (c, next) => {
        // Set company connection to database
        const companyName = c.req.path.split('/')[1]
        console.log(c.req.raw)

        if (!companyName) {
            throw new Error('Company not specified', { cause: 401 });
        }

        // Get database connection
        const knex = dbConfig(companyName)

        // Set storage driver
        Storage.setSelectTenant(companyName)

        // Set locale
        const locale = c.req.header('x-localization') || 'en';
        setLocale(locale);

        // next middleware

        await next()

        // before response

        // close database connection
        knex.destroy().catch((err) => {
            console.error('Database connection error', err)
        })

        // close storage connection
        Storage.resetSelectTenant()

        // Clear locale
        unsetLocale();
    })
}