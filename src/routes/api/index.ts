import { Hono } from "hono";
import { serveStatic } from 'hono/bun'
import { timeout } from 'hono/timeout'
import { AuthMiddleware, InitMiddleware } from "../../app/Middleware";
import PayrollRoute from "./payrolls";
import { UserController } from "../../app/Controllers";

const ApiRoot = new Hono().basePath("/:company/api");

ApiRoot.use(InitMiddleware(), AuthMiddleware(), timeout(30000));

ApiRoot.use('/private/*', (c, next) => {
    const root = '/src/storage/private'
    const path = c.req.path
    const fileName = path.split('/private/')[1];
    const company = c.req.param('company');
    const filePath = `${root}/${company}/${fileName}`;

    return serveStatic({
        path: filePath,
        rewriteRequestPath: (path) => path.replace(/^\/private/, ''),
        onNotFound: (path, c) => { console.info(`${path} is not found, you access ${c.req.path}`) }
    })(c, next);
});

ApiRoot.get('/users', UserController.index)

export default ApiRoot