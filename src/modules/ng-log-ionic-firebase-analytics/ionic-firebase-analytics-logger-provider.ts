/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { Injectable } from '@angular/core';

import {
    EventInfo,
    EventTimingInfo,
    Logger,
    LoggerProvider,
    LogInfo,
    LogLevel,
    PageViewInfo,
    PageViewTimingInfo
} from '@dagonmetric/ng-log';

import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform } from '@ionic/angular';

import { IonicFirebaseAnalyticsLogger } from './ionic-firebase-analytics-logger';

import { UserInfo } from './user-info';

/**
 * Logger provider factory for `IonicFirebaseAnalyticsLogger`.
 */
@Injectable({
    providedIn: 'root'
})
export class IonicFirebaseAnalyticsLoggerProvider extends Logger implements LoggerProvider {
    private readonly _userInfo: UserInfo = {};
    private readonly _analytics?: FirebaseX;

    private _currentLogger?: IonicFirebaseAnalyticsLogger;

    get name(): string {
        return 'ionicFirebaseAnalytics';
    }

    get currentLogger(): IonicFirebaseAnalyticsLogger {
        if (this._currentLogger) {
            return this._currentLogger;
        }

        this._currentLogger = new IonicFirebaseAnalyticsLogger(
            '',
            this._userInfo,
            this._analytics);

        return this._currentLogger;
    }

    constructor(platForm: Platform, analytics: FirebaseX) {
        super();
        if (platForm.is('android') || platForm.is('ios')) {
            this._analytics = analytics;
        }
    }

    createLogger(category: string): Logger {
        return new IonicFirebaseAnalyticsLogger(
            category,
            this._userInfo,
            this._analytics);
    }

    setUserProperties(userId: string, accountId?: string): void {
        this._userInfo.userId = userId;
        this._userInfo.accountId = accountId;
    }

    clearUserProperties(): void {
        this._userInfo.userId = undefined;
        this._userInfo.accountId = undefined;
    }

    log(logLevel: LogLevel, message: string | Error, logInfo?: LogInfo): void {
        this.currentLogger.log(logLevel, message, logInfo);
    }

    startTrackPage(name?: string): void {
        this.currentLogger.startTrackPage(name);
    }

    stopTrackPage(name?: string, pageViewInfo?: PageViewTimingInfo): void {
        this.currentLogger.stopTrackPage(name, pageViewInfo);
    }

    trackPageView(pageViewInfo?: PageViewInfo): void {
        this.currentLogger.trackPageView(pageViewInfo);
    }

    startTrackEvent(name: string): void {
        this.currentLogger.startTrackEvent(name);
    }

    stopTrackEvent(name: string, eventInfo?: EventTimingInfo): void {
        this.currentLogger.stopTrackEvent(name, eventInfo);
    }

    trackEvent(eventInfo: EventInfo): void {
        this.currentLogger.trackEvent(eventInfo);
    }

    flush(): void {
        this.currentLogger.flush();
    }
}
