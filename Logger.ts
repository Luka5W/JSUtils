import sep from 'path';

interface Colors {
    /**
     * 
     */
    normal: string;
    debug: string[];
    info: string[];
    log: string[];
    warn: string[];
    error: string[];
}

interface RemoveSensibleData {
    (data: string): string;
}

enum LogLevel {
    'debug' = 'debug',
    'info' = 'info',
    'log' = 'log',
    'warn' = 'warn',
    'error' = 'error',
}

/**
 * A simple logging utility.
 * 
 * [https://github.com/Luka5W/JSUtils/blob/v1.0.0/Logger.ts]
 * 
 * @version 1.0.0
 */
export class Logger {
    
    public static get COLOR_CODE() { return ["\x1b[","m"]; }
    public static get COLOR_RESET() { return "\x1b[0m"; }
    
    public static get LEVEL_DEBUG() { return 0; }
    public static get LEVEL_INFO() { return 1; }
    public static get LEVEL_LOG() { return 2; }
    public static get LEVEL_WARN() { return 3; }
    public static get LEVEL_ERROR() { return 4; }
    /**
     * Returns the default colors for logs.
     * 
     * @returns A default color object
     * 
     * @since 1.0.0
     */
    public static get COLORS_DEFAULT(): Colors {
        /*
         * https://misc.flogisoft.com/bash/tip_colors_and_formatting
         * COLOR   SET       RESET     CODE
         * black             all       0
         * red     bright    bright    1
         * green   dim       dim       2
         * yellow                      3
         * blue    underline underline 4
         * magenta blink     blink     5
         * cyan                        6
         * white   reverse   reverse   7
         *         hidden    hidden    8
         * default                     9
         * 
         * SET      +00 [      1,  2,      4,  5,      7,  8    ]
         * RESET    +20 [  0, 21, 22,     24, 25,     27, 28    ]
         * FG LIGHT +30 [ 30, 31, 32, 33, 34, 35, 36, 37,     39]
         * FG DARK  +90 [ 90, 91, 92, 93, 94, 95, 96, 97        ]
         * BG LIGHT +40 [ 40, 41, 42, 43, 44, 45, 46, 47,     49]
         * BF DARK +100 [100,101,102,103,104,105,106,107        ]
         * 
         * type: [
         *   prim,
         *   sec
         * ]
         */
        return {
            normal: Logger.COLOR_RESET,
            debug: [
                Logger.COLOR_RESET + Logger.COLOR_CODE[0] + '33' + Logger.COLOR_CODE[1] + Logger.COLOR_CODE[0] + '01' + Logger.COLOR_CODE[1],
                Logger.COLOR_RESET + Logger.COLOR_CODE[0] + '33' + Logger.COLOR_CODE[1] + Logger.COLOR_CODE[0] + '02' + Logger.COLOR_CODE[1],
            ],
            info: [
                Logger.COLOR_RESET + Logger.COLOR_CODE[0] + '34' + Logger.COLOR_CODE[1] + Logger.COLOR_CODE[0] + '01' + Logger.COLOR_CODE[1],
                Logger.COLOR_RESET + Logger.COLOR_CODE[0] + '37' + Logger.COLOR_CODE[1] + Logger.COLOR_CODE[0] + '02' + Logger.COLOR_CODE[1],
            ],
            log: [
                Logger.COLOR_RESET + Logger.COLOR_CODE[0] + '37' + Logger.COLOR_CODE[1] + Logger.COLOR_CODE[0] + '01' + Logger.COLOR_CODE[1],
                Logger.COLOR_RESET + Logger.COLOR_CODE[0] + '37' + Logger.COLOR_CODE[1] + Logger.COLOR_CODE[0] + '02' + Logger.COLOR_CODE[1],
            ],
            warn: [
                Logger.COLOR_RESET + Logger.COLOR_CODE[0] + '91' + Logger.COLOR_CODE[1] + Logger.COLOR_CODE[0] + '01' + Logger.COLOR_CODE[1],
                Logger.COLOR_RESET + Logger.COLOR_CODE[0] + '91' + Logger.COLOR_CODE[1] + Logger.COLOR_CODE[0] + '02' + Logger.COLOR_CODE[1],
            ],
            error: [
                Logger.COLOR_RESET + Logger.COLOR_CODE[0] + '31' + Logger.COLOR_CODE[1] + Logger.COLOR_CODE[0] + '01' + Logger.COLOR_CODE[1],
                Logger.COLOR_RESET + Logger.COLOR_CODE[0] + '31' + Logger.COLOR_CODE[1] + Logger.COLOR_CODE[0] + '02' + Logger.COLOR_CODE[1],
            ]
        };
    }
    
    private level: number;
    private baseDir: string;
    private removeSensibleData: RemoveSensibleData
    private colors: Colors;
    
    /**
     * A test function to demonstrate how this library will work.
     * 
     * @since 1.0.0
     */
    public static test() {
        class TestError extends Error {}
        let logger = new Logger(Logger.LEVEL_DEBUG);
        logger.debug("debug");
        logger.info("info");
        logger.log("log");
        logger.warn("warn");
        logger.error("error");
        logger.error("error:", new TestError("test error"));
        
        logger = new Logger(Logger.LEVEL_DEBUG, Logger.COLORS_DEFAULT);
        logger.debug("debug");
        logger.info("info");
        logger.log("log");
        logger.warn("warn");
        logger.error("error");
        logger.error("error:", new TestError("test error"));
    }
    
    /**
     * Creates a new Logger instance.
     * 
     * @param level level The loglevel (Integer from 0 - 4). @see LEVEL_DEBUG @see LEVEL_INFO @see LEVEL_LOG @see LEVEL_WARN @see LEVEL_ERROR
     * @param colors The default color object. @see COLORS_DEFAULT
     * @param baseDir The base directory (This will be hidden from each log so only relative paths are logged)
     * @param removeSensibleData A function to remove sensible data like ports, domains, IPs, ...
     * 
     * @since 1.0.0
     */
    constructor(
        level: number,
        colors: Colors = {normal: '', debug: ['', ''], info: ['', ''], log: ['', ''], warn: ['', ''], error: ['', '']},
        baseDir: string = (process.cwd() + sep),
        removeSensibleData: RemoveSensibleData = (data: string): string => { return data }
    ) {
        if (level < Logger.LEVEL_DEBUG || level > Logger.LEVEL_ERROR) throw new Error('IndexOutOfBoundsError: 0 <= level <= 3');
        this.level = level;
        this.baseDir = baseDir;
        this.removeSensibleData = removeSensibleData;
        this.colors = colors;
    }
    
    /**
     * Logs a [D]ebug message.
     * 
     * @param message The message to log
     * @param error The error to log after the message
     * 
     * @since 1.0.0
     */
    public debug(message: string, error?: any): void {
        if (this.level == 0) this.logToConsole(LogLevel.debug, message, error);
    }
    /**
     * Logs an [I]nfo message.
     * 
     * @param message The message to log
     * @param error The error to log after the message
     * 
     * @since 1.0.0
     */
    public info(message: string, error?: any): void {
        if (this.level <= 1) this.logToConsole(LogLevel.info, message, error);
    }
    /**
     * Logs a [L]og message.
     * 
     * @param message The message to log
     * @param error The error to log after the message
     * 
     * @since 1.0.0
     */
    public log(message: string, error?: any): void {
        if (this.level <= 2) this.logToConsole(LogLevel.log, message, error);
    }
    /**
     * Logs a [W]arning message.
     * 
     * @param message The message to log
     * @param error The error to log after the message
     * 
     * @since 1.0.0
     */
    public warn(message: string, error?: any): void {
        if (this.level <= 3) this.logToConsole(LogLevel.warn, message, error);
    }
    /**
     * Logs an [E]rror message.
     * 
     * @param message The message to log
     * @param error The error to log after the message
     * 
     * @since 1.0.0
     */
    public error(message: string, error?: any): void {
        if (this.level <= 4) this.logToConsole(LogLevel.error, message, error);
    }
    
    /**
     * Logs a message.
     * 
     * What kind of message it is (debug, info, ...), depends on the first char of the function name of the caller method.
     * 
     * @param logLevel The level to log to
     * @param message The message to log
     * @param error The error to log after the message
     * 
     * @since 1.0.0
     */
    private logToConsole(logLevel: LogLevel, message: any, error?: any): void {
        let stack = (new Error()).stack;
        /*
Error
    at Logger.#logToConsole (%absolute_path%:%line%:%column%)
    at Logger.$l$og (%absolute_path%:%line%:%column%)
    at $%?%$ ($%absolute_path%:%line%:%column%$)
         */
        let line: string[] | string = stack!!.split(/^Error\n.*\n.*\n *at /)[1].split('\n')[0].slice(0, -1).split(/ \(/g);
        let file = line.pop()!!.replace(this.baseDir, '');
        line = line.join(' (');
        let location = file + (line ? ` ${line}` : '');
        let prettyType = this.colors[logLevel][0] + logLevel[0].toUpperCase() + this.colors[logLevel][1];
        let date = (new Date()).toISOString();
        message = this.colors.normal + message + Logger.COLOR_RESET
        message = this.removeSensibleData(`${this.colors[logLevel][1]}[${prettyType}] ${date} [${location}] ${message}`);
        if (error === undefined) {
            console[logLevel](message);
        }
        else {
            console[logLevel](message + '\n', error);
        }
    }
}
