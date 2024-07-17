const fs = require('fs');
const pathHelper = require('path');
class ExpressHost {
    #name;
    #app = {};
    #services = [];
    #pipelines = [];
    #configs = {};
    #routes = [];
    #logger;
    #dict = {
        port: 9100
    };
    #default = {
        port: 9100
    };

    constructor(serviceName, logger) {
        this.#name = serviceName
        this.#logger = logger ?? console;
    }

    get configs() {
        return this.#configs;
    }

    get port() {
        return this.#dict.port;
    }

    set port(port) {
        const num = +port;
        if (Number.isInteger(num) && num >= 0 && num <= 65535) {
            this.#dict.port = num;
        } else {
            throw new Error('Port must be a number between 0 and 65535');
        }
    }

    configuration(path) {
        const thiz = this;
        fs.readdirSync(path, {withFileTypes: true}).forEach(file => {
            const fName = file.name.substring(0, file.name.lastIndexOf('.'));
            thiz.#configs[fName] = require(pathHelper.join(path, fName));
        })
        return thiz;
    }

    addService(service) {
        if (service) {
            this.#services.push(service);
        }
        return this;
    }

    addServices(services) {
        if (Array.isArray(services)) {
            for (const service of services) {
                this.addService(service);
            }
        }
        return this;
    }

    addRoute(route) {
        if (route
            && typeof route === 'object'
            && 'area' in route
            && typeof route.area === 'string'
            && route.area.trim() !== ''
            && 'source' in route
            && typeof route.source === 'string'
            && route.source.trim() !== '') {
            this.#routes.push(route)
        }
        return this;
    }

    addRoutes(routes) {
        if (Array.isArray(routes)) {
            for (const route of routes) {
                this.addRoute(route)
            }
        }
        return this;
    }

    addPipeline(pipeline) {
        if (pipeline && typeof pipeline === 'function') {
            this.#pipelines.push(pipeline);
        }
        return this;
    }

    addPipelines(pipelines) {
        if (Array.isArray(pipelines)) {
            for (const pipeline of pipelines) {
                this.addPipeline(pipeline);
            }
        }
        return this;
    }

    set(key, value) {
        if (typeof key !== 'string') {
            throw new Error('ExpressHost set function Parameter Error: key should be string')
        }
        this.#dict[key] = value;
        return this;
    }

    get(key) {
        if (typeof key !== 'string') {
            throw new Error('ExpressHost set key should be string')
        }
        return this.#dict[key];
    }

    build(cb) {
        const express = require('express');
        this.#app = express();
        // set pipeline
        if (Array.isArray(this.#pipelines) && this.#pipelines?.length > 0) {
            try {
                for (const pipeline of this.#pipelines) {
                    this.#app.use(pipeline)
                }
            } catch (error) {
                this.#logger.error(`Pipeline use failed。 pipeline: ${pipeline} 。 error: ${error.message}`);
            }
        }
        cb(this.#app);
    }

    start() {
        if (!this.#app || typeof this.#app !== 'function') {
            this.build()
        }
        // set routes
        if (!this.#routes || this.#routes?.length < 0) {
            throw new Error(`Bad Request: routes cannot be null or empty`)
        } else {
            for (const route of this.#routes) {
                try {
                    this.#app.use(route.area, require(route.source));
                } catch (error) {
                    this.#logger.error(`Router use failed。 area: ${route.area} 。 file: ${route.source} 。 error: ${error.message}`);
                }
            }
        }
        // set default not found response
        this.#app.use((req, res) => {
            const err = new Error('Not Found');
            err.status = 404;
            res.status(404).json(404);
        })

        // set default errorHandle
        this.#app.use((error, req, res, next) => {
            //error handle
            res.status(500).json('Error Handle: Server Error')
        })

        // set port
        const thiz = this;
        this.#app.listen(this.port, function () {
            thiz.#logger.info(`${thiz.#name} http 服务器启动成功,端口号: ${thiz.port}`);
        })
    }
}

module.exports = ExpressHost;