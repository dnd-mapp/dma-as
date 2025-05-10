import { rm } from 'fs/promises';

const directories = ['node_modules/', 'dist/', 'reports/'] as const;

async function clean() {
    console.log('Cleaning repository...');
    await Promise.all(directories.map((dir) => rm(dir, { recursive: true, force: true })));

    console.log('Done.');
}

(async () => {
    try {
        await clean();
    } catch (error) {
        console.error(error);
    }
})();
