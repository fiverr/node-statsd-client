declare class SDC {
    constructor({
        host,
        port,
        protocol,
        protocol_version,
        MTU,
        timeout,
        tags,
        scheme,
        prefix,
        sanitise,
        errorHandler,
        enforceRate
    }: {
        // StatsD host [127.0.0.1]
        host?: string,
        // StatsD port [8125]
        port?: string|number,
        // Internet Protocol (UDP/TCP) [UDP]
        protocol?: string,
        // Internet Protocol version (ipv4/ipv6) [ipv4]
        protocol_version?: string
        // Maximum Transmission Unit [576]
        MTU?: number,
        // Maximum cutoff time (ms) until flush current metric bulk [1000]
        timeout?: number,
        // Default tags to be sent with every metric []
        tags?,
        // Format stats metric as: `'datadog'`, `'graphite'`, custom format function [datadog]
        scheme?: string|(
            ({
                type, key, value, rate, tags
            }: {
                type: string,
                key: string,
                value: number,
                rate: number,
                tags: string[]
            }) => string),
        // Prefix all stats with this value []
        prefix?: string,
        // Sanitise stat keys [Default sanitisation: Allow characters, numbers, underscores and dots. Replace everything else with underscore. Lowercase everything]
        sanitise?: (string: string) => string,
        // Handle message sending errors (see section 'Throwing errors') []
        errorHandler?: Function,
        // Should I enforce rate (mark as false is rate was already enforced) [true]
        enforceRate?: boolean,
    });
    count(key: string, value: number, rate?: number, tags?: string[]): void;
    time(key: string, value: number, rate?: number, tags?: string[]): void;
    gauge(key: string, value: number, rate?: number, tags?: string[]): void;
    set(key: string, value: number, rate?: number, tags?: string[]): void;
    generic(type: string, key: string, value: number, rate?: number, tags?: string[]): void;
    histogram(key: string, value: number, rate?: number, tags?: string[]): void;
    get size(): number;
    destroy(): void;
}

export default SDC;
