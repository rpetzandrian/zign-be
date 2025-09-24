import winston, { createLogger, transports, format, transport } from "winston";

const consoleTransportFormat = format.printf((info) => {
    const { level, message } = info;
    const timestamp = new Date().toISOString()
    if (level === 'error') {
        const trace = info.error_trace ? '\n' + `-> ${info.error_trace}` : '';
        return `${level}: ${timestamp} ${message} ${trace}`;
    }
    return `${level}: ${timestamp} ${message}`;
});

/** format to be printed on console */
const generateLogTransports = (): transport => {
    return new transports.Console({
        format: format.combine(
            format.errors({ stack: true }),
            consoleTransportFormat,
            format.colorize({ all: true }),
        ),
    });
};

const logger: winston.Logger = createLogger({
    defaultMeta: {
        service: 'account-statement-service',
    },
    transports: generateLogTransports(),
    format: format.combine(format.splat()),
})

export default logger;