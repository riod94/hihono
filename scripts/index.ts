import { Cache } from '../src/utils';
import { CONST, MakeCommandInterface } from './constants';
import makeFile from './make';

const scripts = async (args: string[]) => {
    try {
        // Chech arguments length
        if (args.length === 0) {
            makeCommandList();
        } else {
            // Check if command is defined
            const commandName = args[0];
            const command: MakeCommandInterface | undefined = CONST.MAKE_COMMANDS.find((command) => command.name === commandName);
            if (command) {
                // Execute command
                const name: string = args[1];
                const options: any = args.splice(2);
                if (name && command.name) {
                    const makeCommand: string = command.name.split(':')[1];
                    await makeFile(makeCommand, name, options);
                } else if (command.name == 'key:generate') {
                    await makeFile('key', name, options);
                } else if (command.name == 'cache:clear') {
                    Cache.flush();
                    console.info('\x1b[32m%s\x1b[0m', 'Application cache cleared!');
                    return
                } else {
                    console.error(`Not enough arguments (missing: "${name}"). `);
                }
            } else {
                console.error(`Command "${commandName}" is not defined. Did you mean one of the following?`);
                makeCommandList();
            }
        }
    } catch (error) {
        console.error(error);
    }
}

const makeCommandList = () => {
    // Get max length
    const maxLength = Math.max(...CONST.MAKE_COMMANDS.map((command) => command.name.length));
    console.log('\x1b[32m%s\x1b[0m', 'Available Commands:');
    // Print commands
    CONST.MAKE_COMMANDS.forEach((command) => {
        const paddedName = command.name.padEnd(maxLength);
        console.log('\x1b[36m%s\x1b[0m    ', paddedName, command.description);
    });
};

// Run scripts
scripts(process.argv.splice(2));