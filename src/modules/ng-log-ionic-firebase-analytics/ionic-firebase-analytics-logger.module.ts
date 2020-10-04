/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { NgModule } from '@angular/core';

import { LOGGER_PROVIDER } from '@dagonmetric/ng-log';

import { IonicFirebaseAnalyticsLoggerProvider } from './ionic-firebase-analytics-logger-provider';

/**
 * The `NGMODULE` for providing `LOGGER_PROVIDER` with `IonicFirebaseAnalyticsLoggerProvider`.
 */
@NgModule({
    providers: [
        {
            provide: LOGGER_PROVIDER,
            useClass: IonicFirebaseAnalyticsLoggerProvider,
            multi: true
        }
    ]
})
export class IonicFirebaseAnalyticsLoggerModule {}
