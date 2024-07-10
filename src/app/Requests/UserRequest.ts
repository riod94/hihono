import BaseRequest from "./BaseRequest"
import vine from "@vinejs/vine"
import { Context } from "hono"

interface get {
    username: string
    email: string
}
interface post {
    file: File
}

export default class UserRequest extends BaseRequest {
    // Add validation rules
    static schema = {
        get: vine.object({
            username: vine.string().minLength(3),
            email: vine.string().email()
        }),
        post: vine.object({
            file: vine.any()
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
}