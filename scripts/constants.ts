interface ObjectStringInterface { [key: string]: string }
interface TemplateInterface { [key: string]: (name: string) => string }
interface MakeCommandInterface { name: string; description: string; }

const makeCommands: MakeCommandInterface[] = [
    {
        name: 'cache:clear',
        description: 'Clear application cache',
    },
    {
        name: 'key:generate',
        description: 'Set the application key',
    },
    {
        name: 'make:controller',
        description: 'Create a new controller class',
    },
    {
        name: 'make:middleware',
        description: 'Create a new middleware class',
    },
    {
        name: 'make:model',
        description: 'Create a new Eloquent model class',
    },
    {
        name: 'make:request',
        description: 'Create a new form request class',
    },
    {
        name: 'make:resource',
        description: 'Create a new resource',
    },
    {
        name: 'make:test',
        description: 'Create a new test class',
    },
];

const Templates: TemplateInterface = {
    // generate encryption key and save to .env as APP_KEY
    key: (key: string) => `APP_KEY=${key}`,
    controller: (name: string) => `import { Context } from "hono"

export default class ${name} {
    static async index(c: Context) {
        // Your logic here
        const data = {}

        return c.json({ data: data })
    }

    static async show(c: Context) {
        // Get ID from request param
        const id = c.req.param('id')
        // Your logic here
        const data = {}

        return c.json({ data: data })
    }

    static async store(c: Context) {
        // Get data from request body
        const body = await c.req.json()
        // Your logic here
        const data = {};

        return c.json({ data: data })
    }

    static async update(c: Context) {
        // Get ID from request param
        const id = c.req.param('id')
        // Get data from Parse Request body of type multipart/form-data or application/x-www-form-urlencoded
        const body = await c.req.parseBody()
        // Your logic here
        const data = {}

        return c.json({ data: data })
    }

    static async destroy(c: Context) {
        // Get ID from request param
        const id = c.req.param('id')

        // Your logic here
        // 

        // Mengirimkan respons ke client
        return c.json({ message: 'Data deleted successfully' })
    }
}
`,
    middleware: (name: string) => `import { createMiddleware } from "hono/factory"

export default function ${name}() {
    return createMiddleware(async (c, next) => {
        try {
            // Your Code before next here
            // 

            // run next middleware
            await next()

            // Your Code after next here (optional)
            // 
        } catch (error) {
            // handle error
            console.error('Database middleware error', error)
            throw error
        }
    })
}
`,
    model: (name: string) => `import { Model } from "objection";

export default class ${name} extends Model {
    // Table name is the only required property.
    static tableName: string = '${pluralizeAndSnakeCase(name)}';

    // Each model must have a column (or a set of columns) that uniquely
    // identifies the rows. The column(s) can be specified using the 'idColumn'
    // property. 'idColumn' returns 'id' by default and doesn't need to be
    // specified unless the model's primary key is something else.
    static idColumn: string | string[] = 'id';

    // Declare columns in the table.
    declare id: number;
    
    // Relations can be defined here. refer to https://vincit.github.io/objection.js/guide/relations.html#examples

}`,
    request: (name: string) => `import BaseRequest from "./BaseRequest"
import vine from "@vinejs/vine"
import { Context } from "hono"

interface get {}
interface post {}

export default class ${name} extends BaseRequest {
    // Add validation rules
    static schema = {
        get: vine.object({
            // Get validation rules
        }),
        post: vine.object({
            // Post validation rules
        }),
    }

    // Parse request data
    static parse = {
        get: async (c: Context): Promise<get> => {
            return await this.validate(c, this.schema.get)
        },
        post: async (c: Context): Promise<post> => {
            return await this.validate(c, this.schema.post)
        }
    }
}`,
    resource: (name: string) => `import BaseResource from "./BaseReource";

interface ${name}Interface {
    id: number;
    //
}

export default class ${name} extends BaseResource {
    static transform(data: any): ${name}Interface {
        return {
            id: data?.id,
            //
        }
    }
}`,
    test: (name: string, type?: string) => `import { describe, expect, test } from 'bun:test'

describe('${name}${type ? `_${type}` : ''}', () => {
    test("add", () => {
        expect(2 + 2).toEqual(4);
    });

    test("multiply", () => {
        expect(2 * 2).toEqual(4);
    });
});`,
}

const dirname: ObjectStringInterface = {
    key: 'key',
    controller: 'Controllers',
    middleware: 'Middleware',
    model: 'Models',
    request: 'Requests',
    resource: 'Resources',
    test: 'Tests',
}

const CONST = {
    DIR_NAME: dirname,
    MAKE_COMMANDS: makeCommands,
    TEMPLATES: Templates
}

const pluralizeAndSnakeCase = (word: string): string => {
    // Memisahkan kata menjadi bagian-bagian berdasarkan huruf besar
    const parts = word.match(/[A-Z][^A-Z]*|[a-z]+/g) || [];

    // Menggabungkan bagian-bagian kata dengan underscore
    let snakeCase = parts.join('_');

    // Mengubah kata menjadi huruf kecil
    snakeCase = snakeCase.toLowerCase();

    // Mengubah kata menjadi bentuk plural
    if (snakeCase.endsWith('y')) {
        return snakeCase.slice(0, -1) + 'ies';
    } else if (snakeCase.endsWith('f') || snakeCase.endsWith('fe')) {
        return snakeCase.slice(0, -1) + 'ves';
    } else if (['s', 'o', 'x', 'z', 'sh', 'ch'].some(suffix => snakeCase.endsWith(suffix))) {
        return snakeCase + 'es';
    } else {
        return snakeCase + 's';
    }
}

export {
    CONST,
    MakeCommandInterface
}