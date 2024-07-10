import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";

export default class LocalStorage {
	private static path: string = './src/storage/local/';
	private static ext: string = '.json';


	static set(key: string, values: any) {
		if (!existsSync(this.path)) {
			mkdirSync(this.path);
		}
		const store = writeFileSync(`${this.path}${key}${this.ext}`, JSON.stringify(values));
		return store;
	}

	static get(key: string) {
		const filePath = `${this.path}${key}${this.ext}`;
		if (!existsSync(filePath)) {
			return null;
		}
		const store = readFileSync(filePath, "utf8");
		return JSON.parse(store);
	}

	static has(key: string) {
		const filePath = `${this.path}${key}${this.ext}`;
		if (!existsSync(filePath)) {
			return false;
		}
		return true;
	}

	static delete(key: string) {
		const filePath = `${this.path}${key}${this.ext}`;
		if (existsSync(filePath)) {
			unlinkSync(filePath);
			return true;
		}

		return false;
	}
}
