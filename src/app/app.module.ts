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

import { IonicModule } from '@ionic/angular';

import { AppRate } from '@ionic-native/app-rate/ngx';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { HeaderColor } from '@ionic-native/header-color/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { WebIntent } from '@ionic-native/web-intent/ngx';

import { ConfigModule } from '@dagonmetric/ng-config';
import { StaticConfigLoaderModule } from '@dagonmetric/ng-config/static-loader';
import { LogModule } from '@dagonmetric/ng-log';
import { ConsoleLoggerModule } from '@dagonmetric/ng-log/console';
import { TranslitModule } from '@dagonmetric/ng-translit';

import { ZawgyiDetectorModule } from '@myanmartools/ng-zawgyi-detector';

import { environment } from '../environments/environment';
import { IonicFirebaseAnalyticsLoggerModule } from '../modules/ng-log-ionic-firebase-analytics';
import { ZgUniTranslitRuleLoaderModule } from '../modules/zg-uni-translit-rule-loader';

import { AppConfig } from './shared';

import { AppComponent } from './app.component';

import { AboutModalComponent } from './about/about-modal.component';
import { SupportModalComponent } from './support/support-modal.component';

export const settings: { app: AppConfig } = {
    app: {
        appName: 'Zawgyi Unicode Converter',
        appVersion: '3.6.0',
        appThemeColor: '#8764B8',
        storeAppUrlInfo: {
            android: 'market://details?id=com.dagonmetric.zawgyiunicodeconverter'
        },
        navLinks: [
            {
                url: 'https://myanmartools.org',
                label: 'Explore Myanmar Tools',
                iconName: 'logo-myanmartools-24'
            },
            {
                url: 'https://www.facebook.com/DagonMetric',
                label: 'Posts on Facebook',
                iconName: 'logo-facebook-24'
            },
            {
                url: 'https://www.youtube.com/channel/UCbJLAOU-kG6vkBOU1TSM5Cw',
                label: 'Videos on YouTube',
                iconName: 'logo-youtube-24'
            },
            {
                url: 'https://github.com/myanmartools/zawgyi-unicode-converter-native',
                label: 'Source code on GitHub',
                iconName: 'logo-github-24'
            }
        ],
        socialSharing: {
            subject: 'Zawgyi Unicode Converter app you may also like',
            message: 'ဇော်ဂျီ ယူနီကုဒ် ဖတ်မရတဲ့ အခက်အခဲရှိနေသူများအတွက် ဇော်ဂျီကနေ ယူနီကုဒ်၊ ယူနီကုဒ်ကနေ ဇော်ဂျီ အပြန်အလှန် အလိုအလျောက် ပြောင်းပေးတဲ့ app တစ်ခု မျှဝေလိုက်ပါတယ်။',
            linkUrl: 'https://myanmartools.org/apps/zawgyi-unicode-converter'
        },
        privacyUrl: 'https://privacy.dagonmetric.com/privacy-statement'
    }
};

/**
 * App module for both node and web platforms.
 */
@NgModule({
    declarations: [
        AppComponent,
        AboutModalComponent,
        SupportModalComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,

        IonicModule.forRoot(),

        // ng-config modules
        ConfigModule.init(),
        StaticConfigLoaderModule.withSettings(settings),

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
        FirebaseX,
        FirebaseDynamicLinks,
        HeaderColor,
        NativeStorage,
        StatusBar,
        SplashScreen,
        SocialSharing,
        WebIntent
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        AboutModalComponent,
        SupportModalComponent
    ]
})
export class AppModule { }
