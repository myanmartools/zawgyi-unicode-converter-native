/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { IonicModule } from '@ionic/angular';

import { AppRate } from '@ionic-native/app-rate/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { HeaderColor } from '@ionic-native/header-color/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { WebIntent } from '@ionic-native/web-intent/ngx';

import { LogModule } from '@dagonmetric/ng-log';
import { ConsoleLoggerModule } from '@dagonmetric/ng-log/console';
import { TranslitModule } from '@dagonmetric/ng-translit';

import { ZawgyiDetectorModule } from '@myanmartools/ng-zawgyi-detector';

import { environment } from '../environments/environment';

import { CdkTextareaSyncSizeModule } from '../modules/cdk-extensions';
import { IonicFirebaseAnalyticsLoggerModule } from '../modules/ng-log-ionic-firebase-analytics';
import { ZgUniTranslitRuleLoaderModule } from '../modules/zg-uni-translit-rule-loader';

import { AppComponent } from './app.component';

import { AboutModalComponent } from './about';
import { AppLogsModalComponent } from './app-logs';
import { NotificationModalComponent } from './notification';

/**
 * App module for both node and web platforms.
 */
@NgModule({
    declarations: [AppComponent, AboutModalComponent, AppLogsModalComponent, NotificationModalComponent],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,

        BrowserAnimationsModule,

        MatFormFieldModule,
        MatInputModule,
        CdkTextareaSyncSizeModule,

        IonicModule.forRoot(),

        // ng-log modules
        LogModule.withConfig({
            minLevel: environment.production ? 'warn' : 'trace'
        }),
        ConsoleLoggerModule.withOptions({
            enableDebug: !environment.production
        }),

        // ng-translit modules
        TranslitModule,
        ZgUniTranslitRuleLoaderModule,

        // ng-zawgyi-detector module
        ZawgyiDetectorModule,

        IonicFirebaseAnalyticsLoggerModule
    ],
    providers: [
        AppRate,
        Clipboard,
        FirebaseX,
        // FirebaseDynamicLinks,
        HeaderColor,
        NativeStorage,
        StatusBar,
        SplashScreen,
        SocialSharing,
        WebIntent
    ],
    bootstrap: [AppComponent],
    entryComponents: [AboutModalComponent, AppLogsModalComponent, NotificationModalComponent]
})
export class AppModule {}
