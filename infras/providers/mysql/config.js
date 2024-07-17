class MySqlConfig {
    constructor (username, password, host, port, database, multipleStatements, waitForConnections, connectionLimit, queueLimit) {
        this.user = username;
        this.password = password;
        this.host = host;
        this.port = port;
        this.database = database;
        this.multipleStatements = multipleStatements ?? true;
        this.waitForConnections = waitForConnections ?? true;
        this.connectionLimit = connectionLimit ?? 10;
        this.queueLimit = queueLimit ?? 0;
        this.dateStrings = true;
        this.typeCast = (field, useDefaultTypeCasting) => {
            // // We only want to cast bit fields that have a single-bit in them. If the field
            // // has more than one bit, then we cannot assume it is supposed to be a Boolean.
            // if ((field.type === 'BIT') && (field.length === 1)) {
            //   const bytes = field.buffer()
            //
            //   // A Buffer in Node represents a collection of 8-bit unsigned integers.
            //   // Therefore, our single "bit field" comes back as the bits '0000 0001',
            //   // which is equivalent to the number 1.
            //   return (bytes[0] === 1)
            // }

            return (useDefaultTypeCasting());
        };
    }
}

module.exports = MySqlConfig;