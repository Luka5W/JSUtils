/**
 * A logging utility written by @author Luka5W.
 * 
 * [https://github.com/Luka5W/JSUtils/blob/v1.0.0/Logger.js]
 * 
 * @version 1.0.0
 */
module.exports = class Logger {
    
    static get COLOR_CODE() { return ["\x1b[","m"]; }
    static get COLOR_RESET() { return "\x1b[0m"; }
    
    static get LEVEL_DEBUG() { return 0; }
    static get LEVEL_INFO() { return 1; }
    static get LEVEL_LOG() { return 2; }
    static get LEVEL_WARN() { return 3; }
    static get LEVEL_ERROR() { return 4; }
    /**
     * Returns the default colors for logs.
     * 
     * @returns A default color object
     * 
     * @since 1.0.0
     */
    static get COLORS_DEFAULT() {
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
    
    #level;
    #baseDir;
    #removeSensibleData;
    #colors;
    
    /**
     * A test function to demonstrate how this library will work.
     * 
     * @since 1.0.0
     */
    static test() {
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
     * @param {number} level The loglevel (Integer from 0 - 4). @see LEVEL_DEBUG @see LEVEL_INFO @see LEVEL_LOG @see LEVEL_WARN @see LEVEL_ERROR
     * @param {object} [colors={normal: '', debug: ['', ''], info: ['', ''], log: ['', ''], warn: ['', ''], error: ['', '']}] The default color object. @see COLORS_DEFAULT
     * @param {string} [baseDir=process.cwd() + require('path').sep] The base directory (This will be hidden from each log so only relative paths are logged)
     * @param {function} [removeSensibleData=(str) => { return str; }] A function to remove sensible data like ports, domains, IPs, ...
     * 
     * @since 1.0.0
     */
    constructor(level, colors = {normal: '', debug: ['', ''], info: ['', ''], log: ['', ''], warn: ['', ''], error: ['', '']}, baseDir = (process.cwd() + require('path').sep), removeSensibleData = (str) => { return str; }) {
        if (level < Logger.LEVEL_DEBUG || level > Logger.LEVEL_ERROR) throw new Error('IndexOutOfBoundsException', '0 <= level <= 3');
        this.#level = level;
        this.#baseDir = baseDir;
        this.#removeSensibleData = removeSensibleData;
        this.#colors = colors;
    }
    
    /**
     * Logs a [D]ebug message.
     * 
     * @param {string} message The message to log
     * @param {Error} [error] The error to log after the message
     * 
     * @since 1.0.0
     */
    debug(message, error = null) {
        if (this.#level == 0) this.#logToConsole(message, error);
    }
    /**
     * Logs an [I]nfo message.
     * 
     * @param {string} message The message to log
     * @param {Error} [error] The error to log after the message
     * 
     * @since 1.0.0
     */
    info(message, error = null) {
        if (this.#level <= 1) this.#logToConsole(message, error);
    }
    /**
     * Logs a [L]og message.
     * 
     * @param {string} message The message to log
     * @param {Error} [error] The error to log after the message
     * 
     * @since 1.0.0
     */
    log(message, error = null) {
        if (this.#level <= 2) this.#logToConsole(message, error);
    }
    /**
     * Logs a [W]arning message.
     * 
     * @param {string} message The message to log
     * @param {Error} [error] The error to log after the message
     * 
     * @since 1.0.0
     */
    warn(message, error = null) {
        if (this.#level <= 3) this.#logToConsole(message, error);
    }
    /**
     * Logs an [E]rror message.
     * 
     * @param {string} message The message to log
     * @param {Error} [error] The error to log after the message
     * 
     * @since 1.0.0
     */
    error(message, error = null) {
        if (this.#level <= 4) this.#logToConsole(message, error);
    }
    
    /**
     * Logs a message.
     * 
     * What kind of message it is (debug, info, ...), depends on the first char of the function name of the caller method.
     * 
     * @param {string} message The message to log
     * @param {Error} [error] The error to log after the message
     * 
     * @since 1.0.0
     */
    #logToConsole(message, error = null) {
        let stack = (new Error()).stack;
        /*
Error
    at Logger.#logToConsole (%absolute_path%:%line%:%column%)
    at Logger.$l$og (%absolute_path%:%line%:%column%)
    at $%?%$ ($%absolute_path%:%line%:%column%$)
         */
        let type = stack.split(/^Error\n.*\n *at Logger\./)[1].split(' ')[0];
        // (\n.*){2} does not work
        let line = stack.split(/^Error\n.*\n.*\n *at /)[1].split('\n')[0].slice(0, -1).split(/ \(/g);
        let file = line.pop().replace(this.#baseDir, '');
        line = line.join(' (');
        let location = file + (line ? ` ${line}` : '');
        let prettyType = this.#colors[type][0] + type[0].toUpperCase() + this.#colors[type][1];
        let date = (new Date()).toISOString();
        message = this.#colors.normal + message + Logger.COLOR_RESET
        message = this.#removeSensibleData(`${this.#colors[type][1]}[${prettyType}] ${date} [${location}] ${message}`);
        if (error === null) {
            console[type](message);
        }
        else {
            console[type](message + '\n', error);
        }
    }
}
