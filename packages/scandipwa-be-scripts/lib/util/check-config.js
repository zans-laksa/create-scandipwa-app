const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const createDirSafe = require('./create-dir-safe');
const pathExists = require('./path-exists');
const eta = require('eta');
const fs = require('fs');
const ora = require('ora');

const checkConfigPath = async ({
    configPathname, dirName, template, ports = {}, name, output, overwrite
}) => {
    // eslint-disable-next-line no-param-reassign
    output = output || ora();
    const pathOk = await pathExists(configPathname);

    if (pathOk && !overwrite) {
        output.succeed(`${name} config already created`);
        return true;
    }
    output.warn(`${name} config not found, creating...`);
    const configTemplate = await fs.promises.readFile(template, 'utf-8');

    const compliedConfig = await eta.render(configTemplate, { ports, date: new Date().toUTCString() });

    try {
        if (dirName) {
            await createDirSafe(dirName);
        }
        await fs.promises.writeFile(configPathname, compliedConfig, { encoding: 'utf-8' });
        output.succeed(`${name} config created`);
        return true;
    } catch (e) {
        output.fail(`create ${name} config error`);

        logger.log(e);

        logger.error(`Failed to create ${name} configuration file. See ERROR log above`);
        return false;
    }
};

module.exports = checkConfigPath;