const mysql = require('mysql2')
class MySqlProvider {
    #logger;

    constructor (masterOpt, slaveOpt, logger) {
        if (!masterOpt) {
            throw new Error('master option cannot be null or empty');
        }
        this.master = mysql.createPool(masterOpt).promise();
        this.slave = !slaveOpt ? this.master : mysql.createPool(slaveOpt).promise();
        this.#logger = logger ?? console;
    }

    /**
     * @param {string} sql
     * @param {array} params
     * @param {object} options
     * @param {boolean} options.disableLogging if true, print sql
     * @returns {Promise<array>}
     */
    async execute (sql, params, options = { disableLogging: false}) {
        try {
            const provider = sql.match(/^\s*select\s*/gi) !== null ? this.slave : this.master;
            sql = provider.format(sql, params);
            if (!options.disableLogging) {
                this.#logger.sql(sql);
            }
            return await provider.query(sql);
        } catch (error) {
            this.#logger.error(`SQL语句执行出错: ${error.sql} 。 MESSAGE: ${error.message}。STACK: ${error.stack}`);
            throw error;
        }
    }

    async getMasterConnection () {
        return await this.master.getConnection();
    }

    async ping () {
        const connections = [await this.master.getConnection(), await this.slave.getConnection()];
        for (const conn of connections) {
            await conn.ping();
            await conn.release();
        }
    }
}

module.exports = MySqlProvider;