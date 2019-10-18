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
import { IonicStorageModule } from '@ionic/storage';

import { AppRate } from '@ionic-native/app-rate/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { HeaderColor } from '@ionic-native/header-color/ngx';
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
        appVersion: '2.0.0',
        appThemeColor: '#8764B8',
        appDescription: 'Zawgyi Unicode Converter is a free and open source Zawgyi-One and standard Myanmar Unicode online/offline converter created by DagonMetric Myanmar Tools team.',
        storeAppUrlInfo: {
            android: 'market://details?id=com.dagonmetric.zawgyiunicodeconverter'
        },
        navLinks: [
            {
                url: 'https://www.facebook.com/DagonMetric',
                label: 'Learn more on Facebook',
                iconName: 'logo-facebook-24'
            },
            {
                url: 'https://www.youtube.com/channel/UCbJLAOU-kG6vkBOU1TSM5Cw',
                label: 'Watch more on YouTube',
                iconName: 'logo-youtube-24'
            },
            {
                url: 'https://github.com/myanmartools/zawgyi-unicode-converter-native',
                label: 'Open source on GitHub',
                iconName: 'logo-github-24'
            },
            {
                url: 'https://myanmartools.org',
                label: 'Explore Myanmar Tools',
                iconName: 'globe'
            }
        ],
        socialSharing: {
            subject: 'Zawgyi Unicode Converter app you may also like',
            message: 'သူငယ်ချင်းတို့တွေထဲမှာ ဇော်ဂျီ ယူနီကုဒ် အခက်အခဲရှိနေရင်\nZawgyi Unicode Converter app ကိုသုံးပြီး ဇော်ဂျီကနေ ယူနီကုဒ်၊ ယူနီကုဒ်ကနေ ဇော်ဂျီ အပြန်အလှန်ပြောင်းကြည့်လို့ရတယ်နော်။\nDownload link: ',
            linkUrl: 'https://play.google.com/store/apps/details?id=com.dagonmetric.zawgyiunicodeconverter'
        },
        privacyUrl: 'https://privacy.dagonmetric.com/privacy-statement',
        appAboutImageUrl: 'assets/images/about-welcome.png',
        aboutSlides: [
            {
                label: 'Ability to convert Zawgyi to Unicode and Unicode to Zawgyi',
                language: 'en-US'
            },
            {
                label: 'ဇော်ဂျီ မှ ယူနီကုဒ် နှင့် ယူနီကုဒ် မှ ဇော်ဂျီ အပြန်အလှန်ပြောင်းလဲနိုင်ခြင်း',
                language: 'my-MM'
            },
            {
                label: 'Amazing correctness in every conversion',
                language: 'en-US'
            },
            {
                label: 'ပြောင်းလဲခြင်းတိုင်းမှာ အံ့သြဖွယ် တိကျမှန်ကန်မှုရှိခြင်း',
                language: 'my-MM'
            },
            {
                label: 'Intelligent understanding of your input and convert automatically',
                language: 'en-US'
            },
            {
                label: 'စာရိုက်လိုက်တာနှင့် ဇော်ဂျီ ယူနီကုဒ် အလိုအလျောက်သိရှိပြီး ပြောင်းလဲပေးခြင်း',
                language: 'my-MM'
            },
            {
                label: 'Ability to use anytime even disconnected from internet',
                language: 'en-US'
            },
            {
                label: 'အင်တာနက် ပြတ်တောက်နေချိန်တွင်လည်း အချိန်မရွေးအသုံးပြုနိုင်ခြင်း',
                language: 'my-MM'
            },
            {
                label: 'Created by DagonMetric',
                language: 'en-US'
            },
            {
                label: 'ဒဂုန်မက်ထရစ်မှ ဖန်တီးထားသည်',
                language: 'my-MM'
            },
            {
                label: "Let's start converting now to Unicode to improve Myanmar language in digital world!",
                language: 'en-US'
            },
            {
                label: 'ကွန်ပျူတာသုံးမြန်မာစာစနစ် တိုးတက်ဖို့ ယူနီကုဒ်ကိုစတင်ပြောင်းလဲကြစို့...',
                language: 'my-MM'
            }
        ],
        facebookAppId: '461163654621837'
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
        IonicStorageModule.forRoot(),

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
        HeaderColor,
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
