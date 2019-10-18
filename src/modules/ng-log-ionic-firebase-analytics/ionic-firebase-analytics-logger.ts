/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { EventInfo, EventTimingInfo, Logger, LogInfo, LogLevel, PageViewInfo, PageViewTimingInfo } from '@dagonmetric/ng-log';

import { FirebaseX } from '@ionic-native/firebase-x/ngx';

import { UserInfo } from './user-info';

/**
 * Ionic Firebase analytics implementation for `Logger`.
 */
export class IonicFirebaseAnalyticsLogger extends Logger {
    private readonly _eventTiming: Map<string, number> = new Map<string, number>();

    constructor(
        readonly name: string,
        private readonly _userInfo: UserInfo,
        private readonly _analytics?: FirebaseX) {
        super();
    }

    log(logLevel: LogLevel, message: string | Error, logInfo?: LogInfo): void {
        if (logLevel === LogLevel.None || !this._analytics) {
            return;
        }

        // tslint:disable-next-line: no-any
        const properties: { [key: string]: any } = logInfo && logInfo.properties ? { ...logInfo.properties } : {};

        if (this._userInfo.userId) {
            properties.user_id = this._userInfo.userId;
        }

        if (this._userInfo.accountId) {
            properties.account_id = this._userInfo.accountId;
        }

        if (logLevel === LogLevel.Error || logLevel === LogLevel.Critical) {
            properties.description = typeof message === 'string' ? message : `${message}`;
            properties.fatal = logLevel === LogLevel.Critical;

            this._analytics.logEvent('exception', properties)
                .then(() => {
                    // Do nothing;
                })
                .catch((error: Error) => {
                    console.error(error);
                });
        } else {
            let level: string;
            if (logLevel === LogLevel.Trace) {
                level = 'trace';
            } else if (logLevel === LogLevel.Debug) {
                level = 'debug';
            } else if (logLevel === LogLevel.Info) {
                level = 'info';
            } else {
                level = 'warn';
            }

            properties.message = typeof message === 'string' ? message : `${message}`;
            properties.level = level;

            this._analytics.logEvent('trace', properties)
                .then(() => {
                    // Do nothing;
                })
                .catch((error: Error) => {
                    console.error(error);
                });
        }
    }

    startTrackPage(name?: string): void {
        if (!name) {
            console.error('Could not detect document title, please provide name parameter.');

            return;
        }

        if (this._eventTiming.get(name) != null) {
            console.error(`The 'startTrackPage' was called more than once for this event without calling stop, name: ${name}.`);

            return;
        }

        this._eventTiming.set(name, +new Date());
    }

    stopTrackPage(name?: string, pageViewInfo?: PageViewTimingInfo): void {
        if (!name) {
            console.error('Could not detect document title, please provide name parameter.');

            return;
        }

        const start = this._eventTiming.get(name);
        if (start == null || isNaN(start)) {
            console.error(`The 'stopTrackPage' was called without a corresponding start, name: ${name}.`);

            return;
        }

        this._eventTiming.delete(name);

        const duration = Math.max(+new Date() - start, 0);
        const properties = this.getMappedPageViewProps(pageViewInfo);
        properties.page_title = name;

        if (!this._analytics) {
            return;
        }

        this._analytics.logEvent('timing_complete', {
            ...properties,
            name: 'page_view',
            value: duration
        })
            .then(() => {
                // Do nothing;
            })
            .catch((error: Error) => {
                console.error(error);
            });
    }

    trackPageView(pageViewInfo?: PageViewInfo): void {
        if (!pageViewInfo || !pageViewInfo.name) {
            console.error('Could not detect document title, please provide name parameter.');

            return;
        }

        const properties = this.getMappedPageViewProps(pageViewInfo);
        properties.page_title = pageViewInfo.name;

        if (!this._analytics) {
            return;
        }

        this._analytics.logEvent('page_view', properties)
            .then(() => {
                // Do nothing;
            })
            .catch((error: Error) => {
                console.error(error);
            });
    }

    startTrackEvent(name: string): void {
        if (this._eventTiming.get(name) != null) {
            console.error(`The 'startTrackEvent' was called more than once for this event without calling stop, name: ${name}.`);

            return;
        }

        this._eventTiming.set(name, +new Date());
    }

    stopTrackEvent(name: string, eventInfo?: EventTimingInfo): void {
        const start = this._eventTiming.get(name);
        if (start == null || isNaN(start)) {
            console.error(`The 'stopTrackEvent' was called without a corresponding start, name: ${name}.`);

            return;
        }

        this._eventTiming.delete(name);

        const duration = Math.max(+new Date() - start, 0);
        const properties = this.getMappedEventProps(eventInfo);

        if (!this._analytics) {
            return;
        }

        this._analytics.logEvent('timing_complete', {
            ...properties,
            name,
            value: duration
        })
            .then(() => {
                // Do nothing;
            })
            .catch((error: Error) => {
                console.error(error);
            });
    }

    trackEvent(eventInfo: EventInfo): void {
        if (!this._analytics) {
            return;
        }

        if (eventInfo.name === 'screen_view' && eventInfo.properties && eventInfo.properties.screen_name) {
            const screenName = eventInfo.properties.screen_name as string;

            this._analytics.setScreenName(screenName)
                .then(() => {
                    // Do nothing;
                })
                .catch((error: Error) => {
                    console.error(error);
                });
        } else {
            const properties = this.getMappedEventProps(eventInfo);

            this._analytics.logEvent(eventInfo.name, eventInfo.properties || properties)
                .then(() => {
                    // Do nothing;
                })
                .catch((error: Error) => {
                    console.error(error);
                });
        }
    }

    flush(): void {
        // Do nothing
    }

    // tslint:disable-next-line: no-any
    private getMappedEventProps(eventInfo?: EventTimingInfo): { [key: string]: any } {
        if (!eventInfo) {
            return {};
        }

        // tslint:disable-next-line: no-any
        const mappedProps: { [key: string]: any } = {
            ...eventInfo.properties,
            ...eventInfo.measurements
        };

        if (this._userInfo.userId) {
            mappedProps.user_id = this._userInfo.userId;
        }

        if (this._userInfo.accountId) {
            mappedProps.account_id = this._userInfo.accountId;
        }

        return mappedProps;
    }

    // tslint:disable-next-line: no-any
    private getMappedPageViewProps(pageViewInfo?: PageViewTimingInfo): { [key: string]: any } {
        if (!pageViewInfo) {
            return {};
        }

        // tslint:disable-next-line: no-any
        const mappedProps: { [key: string]: any } = {
            ...pageViewInfo.properties,
            ...pageViewInfo.measurements
        };

        if (pageViewInfo.uri) {
            if (pageViewInfo.uri.startsWith('/')) {
                mappedProps.page_path = pageViewInfo.uri;
            } else {
                mappedProps.page_location = pageViewInfo.uri;
            }
        }

        if (pageViewInfo.ref_uri) {
            mappedProps.ref_uri = pageViewInfo.ref_uri;
        }

        if (pageViewInfo.page_type) {
            mappedProps.page_type = pageViewInfo.page_type;
        }

        if (pageViewInfo.is_logged_in != null) {
            mappedProps.is_logged_in = pageViewInfo.is_logged_in;
        }

        if (this._userInfo.userId) {
            mappedProps.user_id = this._userInfo.userId;
        }

        if (this._userInfo.accountId) {
            mappedProps.account_id = this._userInfo.accountId;
        }

        return mappedProps;
    }
}
