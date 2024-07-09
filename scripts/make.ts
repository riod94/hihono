import path = require('path');
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { CONST } from './constants';
import Crypt from '../src/utils/Crypt';

const succesColor = '\x1b[32m%s\x1b[0m';

export default async function makeFile(command: string, name: string, options?: any) {
    try {
        // Check if command is to generate application key
        if (command === 'key') {
            return keyGenerate();
        }

        // Check if command is to make test
        if (command === 'test') {
            return makeTest(command, name, options);
        }

        // Parse the name into directory and filename
        const parsedPath = path.parse(name);
        const dirPath = path.join(__dirname, '..', 'src', 'app', CONST.DIR_NAME[command], parsedPath.dir);
        const filename = parsedPath.name;
        const ext = parsedPath.ext || '.ts';

        // Create the directory if it doesn't exist
        if (!existsSync(dirPath)) {
            mkdirSync(dirPath, { recursive: true });
        }

        // Create a new file in the directory
        const filePath = path.join(dirPath, `${filename}${ext}`);


        // Write the template to the file
        writeFileSync(filePath, CONST.TEMPLATES[command](filename), { signal: AbortSignal.timeout(5000) });

        // Check if the index file exists
        const indexPath = path.join(dirPath, 'index.ts');
        if (!existsSync(indexPath)) {
            writeFileSync(indexPath, '', { signal: AbortSignal.timeout(5000) });
        }

        // Add exports all classes to index of the directory
        const indexContent = readFileSync(indexPath, 'utf-8');
        const newContent = `export { default as ${filename} } from './${filename}';\n`;
        // check if the new content is not already in the index
        if (indexContent.indexOf(newContent) === -1) {
            const newIndexContent = `${newContent}${indexContent}`;
            writeFileSync(indexPath, newIndexContent, { signal: AbortSignal.timeout(5000) });
        }

        // Log a success message
        console.info(succesColor, `Successfully created ${command}: ${filePath}`);
    } catch (error) {
        console.error(`Failed to create ${command}: ${error}`);
    }
}

function keyGenerate() {
    // Generate encryption key
    const defaultHash = Math.random().toString(36).substring(0, 15) + Math.random().toString(36).substring(0, 15) + Math.random().toString(36).substring(0, 15);
    const key = Crypt.hash(defaultHash);

    // Check if .env file exists
    const envFilePath = '.env';
    const envExampleFilePath = '.env.example';
    let envContent = existsSync(envFilePath) ? readFileSync(envFilePath, 'utf8') : readFileSync(envExampleFilePath, 'utf8');

    // Update or add APP_KEY to .env
    const regex = /(APP_KEY=)(.*)/;
    const match = envContent.match(regex);

    if (match) {
        const [_, keyPrefix] = match;
        envContent = envContent.replace(regex, `${keyPrefix}${key}`);
    } else {
        envContent += `\nAPP_KEY=${key}`;
    }

    writeFileSync(envFilePath, envContent, { signal: AbortSignal.timeout(5000) });

    console.info(succesColor, 'Application key generated successfully.');
}

function makeTest(command: string, name: string, options?: any) {
    const isUnitTest = options.includes('--unit');
    const testType = isUnitTest ? 'Unit' : 'Feature';
    const parsedPath = path.parse(name);
    const dirPath = path.join(__dirname, '..', CONST.DIR_NAME[command].toLowerCase(), parsedPath.dir, testType);
    const filename = parsedPath.name;
    const ext = parsedPath.ext || '.test.ts';

    // Create the directory if it doesn't exist
    if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
    }

    // Create a new file in the directory
    const filePath = path.join(dirPath, `${filename}${ext}`);

    // Write the template to the file
    writeFileSync(filePath, CONST.TEMPLATES[command](filename), { signal: AbortSignal.timeout(5000) });

    // Log a success message
    console.info(succesColor, `Successfully created ${command}: ${filePath}`);
}