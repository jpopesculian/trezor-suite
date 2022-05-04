export type App = 'suite' | 'connect-popup';

export type Environment = 'desktop' | 'web' | 'mobile';

export type InitOptions = {
    sessionId?: string;
    instanceId?: string;
    environment: Environment;
    app: App;
    isDev: boolean;
    commitId: string;
    report?: {
        sessionEnd?: boolean;
    };
};

export type Event = {
    type: string;
    payload?: {
        [key: string]: string | number | boolean;
    };
};
