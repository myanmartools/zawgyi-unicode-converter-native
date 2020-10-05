/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

import { MenuController, ModalController, Platform, ToastController } from '@ionic/angular';

import { AppRate } from '@ionic-native/app-rate/ngx';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links/ngx';
import { HeaderColor } from '@ionic-native/header-color/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { WebIntent } from '@ionic-native/web-intent/ngx';

import { FirebaseX } from '@ionic-native/firebase-x/ngx';

import { LogService } from '@dagonmetric/ng-log';
import { TranslitResult, TranslitService } from '@dagonmetric/ng-translit';

import { DetectedEnc, ZawgyiDetector } from '@myanmartools/ng-zawgyi-detector';

import { environment } from '../environments/environment';

import { NavLinkItem, Sponsor, appSettings } from './shared';

import { AboutModalComponent } from './about/about-modal.component';

export type SourceEnc = 'auto' | DetectedEnc;

/**
 * Core app component.
 */
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit, OnDestroy {
    private readonly _selectInputFontText = 'ထည့်သွင်းဖောင့်ရွေးချယ်ရန် (အော်တိုသိရှိ)';
    private readonly _sourcePlaceholderAuto = 'ဇော်ဂျီ(သို့)ယူနီကုတ်စာသားကိုဤနေရာတွင်ထည့်ပါ';
    private readonly _sourcePlaceholderZg = 'ဇော်ဂျီစာသားကိုဤနေရာတွင်ထည့်ပါ';
    private readonly _sourcePlaceholderUni = 'ယူနီကုတ်စာသားကိုဤနေရာတွင်ထည့်ပါ';

    private readonly _targetPlaceholderAuto = 'ပြောင်းပြီးစာသားကိုဤနေရာတွင်တွေ့ရမည်';
    private readonly _targetPlaceholderZg = 'ပြောင်းပြီးဇော်ဂျီစာသားကိုဤနေရာတွင်တွေ့ရမည်';
    private readonly _targetPlaceholderUni = 'ပြောင်းပြီးယူနီကုတ်စာသားကိုဤနေရာတွင်တွေ့ရမည်';

    private readonly _translitSubject = new Subject<string>();
    private readonly _destroyed = new Subject<void>();

    private readonly _timePeriodToExit = 2000;

    private _backButtonSubscription?: Subscription;
    private _sourceText = '';
    private _outText = '';
    private _sourceEnc?: SourceEnc = 'auto';
    private _targetEnc?: DetectedEnc;
    private _sourcePlaceholderText = '';
    private _targetPlaceholderText = '';
    private _convertSource = 'direct';

    private _detectedEnc: DetectedEnc = null;
    private _curRuleName = '';

    private _lastTimeBackPress = 0;
    private _isDarkMode?: boolean | null = null;

    private _sponsorSectionVisible = false;
    private _sponsors: Sponsor[] = [];

    private _fontEncSelectedText = this._selectInputFontText;

    // Sync configs
    private _appThemeColor: string;

    get appName(): string {
        return appSettings.appName;
    }

    get appVersion(): string {
        return appSettings.appVersion;
    }

    get navLinks(): NavLinkItem[] {
        return appSettings.navLinks || [];
    }

    get privacyUrl(): string | undefined {
        return appSettings.privacyUrl;
    }

    get fontEncSelectedText(): string {
        return this._fontEncSelectedText;
    }

    get detectedEnc(): DetectedEnc {
        return this._detectedEnc;
    }

    get sourceEncLabel(): string {
        if (this._detectedEnc === 'zg' && this._sourceText && this._sourceText.trim().length) {
            return 'ZAWGYI';
        } else if (this._detectedEnc === 'uni' && this._sourceText && this._sourceText.trim().length) {
            return 'UNICODE';
        } else {
            return this._sourcePlaceholderAuto;
        }
    }

    get targeetEncLabel(): string {
        if (this._detectedEnc === 'zg' && this._outText && this._outText.trim().length) {
            return 'UNICODE';
        } else if (this._detectedEnc === 'uni') {
            return 'ZAWGYI';
        } else {
            return this._targetPlaceholderAuto;
        }
    }

    get sourceText(): string {
        return this._sourceText;
    }
    set sourceText(val: string) {
        this._sourceText = val;
        this.translitNext();
    }

    get sourceEnc(): SourceEnc | undefined {
        return this._sourceEnc;
    }
    set sourceEnc(val: SourceEnc | undefined) {
        if (!val) {
            return;
        }

        this._sourceEnc = val;
        this.onSourceEncChanged(val);
    }

    get targetEnc(): DetectedEnc | undefined {
        return this._targetEnc;
    }

    get outText(): string {
        return this._outText;
    }

    // get textAreaMinRows(): number {
    //     const platformHeight = this._platform.height();

    //     // iPhone: 568, 640, 667,  736, 812,  896
    //     //  Android: 640, 732, 740, 824, 847,  853

    //     if (platformHeight >= 900) {
    //         return 10;
    //     } else if (platformHeight >= 820) {
    //         return 9;
    //     } else if (platformHeight >= 730) {
    //         return 8;
    //     } else if (platformHeight >= 640) {
    //         return 7;
    //     } else if (platformHeight >= 580) {
    //         return 6;
    //     } else if (platformHeight >= 540) {
    //         return 5;
    //     } else {
    //         return 4;
    //     }
    // }

    get sourcePlaceholderText(): string {
        return this._sourcePlaceholderText || this._sourcePlaceholderAuto;
    }

    get targetPlaceholderText(): string {
        return this._targetPlaceholderText || this._targetPlaceholderAuto;
    }

    get isDarkMode(): boolean {
        return this._isDarkMode == null ? false : this._isDarkMode;
    }
    set isDarkMode(value: boolean) {
        this.setDarkMode(value);

        this._logService.trackEvent({
            name: value ? 'change_dark_mode' : 'change_light_mode',
            properties: {
                mode: value ? 'dark' : 'light',
                app_version: appSettings.appVersion,
                app_platform: 'android'
            }
        });
    }

    get sponsorSectionVisible(): boolean {
        return this._sponsorSectionVisible && !this.sourceText.length;
    }

    get sponsors(): Sponsor[] {
        return this._sponsors;
    }

    constructor(
        private readonly _translitService: TranslitService,
        private readonly _zawgyiDetector: ZawgyiDetector,
        private readonly _logService: LogService,
        private readonly _platform: Platform,
        private readonly _splashScreen: SplashScreen,
        private readonly _statusBar: StatusBar,
        private readonly _headerColor: HeaderColor,
        private readonly _menuController: MenuController,
        private readonly _modalController: ModalController,
        private readonly _toastController: ToastController,
        private readonly _socialSharing: SocialSharing,
        private readonly _appRate: AppRate,
        private readonly _webIntent: WebIntent,
        private readonly _nativeStorage: NativeStorage,
        private readonly _firebaseDynamicLinks: FirebaseDynamicLinks,
        private readonly _firebaseX: FirebaseX
    ) {
        this._appThemeColor = appSettings.appThemeColor;
        this.initializeApp();
    }

    ngOnInit(): void {
        this._translitSubject
            .pipe(
                debounceTime(200),
                distinctUntilChanged(),
                takeUntil(this._destroyed),
                switchMap(() => {
                    const input = this._sourceText;
                    if (!input || !input.trim().length) {
                        if (this._sourceEnc === 'auto' || !this.detectedEnc) {
                            this.resetFontEncSelectedText();
                            this._sourceEnc = 'auto';
                            this._detectedEnc = null;
                        }

                        return of({
                            outputText: input,
                            replaced: false,
                            duration: 0
                        });
                    }

                    if (this._sourceEnc === 'auto' || !this.detectedEnc) {
                        const detectorResult = this._zawgyiDetector.detect(input, { detectMixType: false });
                        this._detectedEnc = detectorResult.detectedEnc;

                        if (detectorResult.detectedEnc === 'zg') {
                            this.resetFontEncSelectedText('ဇော်ဂျီဟုသိရှိ');
                            this._sourceEnc = 'auto';
                            this._detectedEnc = 'zg';
                            this._targetEnc = 'uni';
                        } else if (detectorResult.detectedEnc === 'uni') {
                            this.resetFontEncSelectedText('ယူနီကုတ်ဟုသိရှိ');
                            this._sourceEnc = 'auto';
                            this._detectedEnc = 'uni';
                            this._targetEnc = 'zg';
                        } else {
                            this.resetFontEncSelectedText();
                            this._sourceEnc = 'auto';
                            this._detectedEnc = null;

                            return of({
                                replaced: false,
                                outputText: input,
                                duration: 0
                            });
                        }
                    }

                    this._curRuleName = this.detectedEnc === 'zg' ? 'zg2uni' : 'uni2zg';

                    return this._translitService.translit(input, this._curRuleName).pipe(takeUntil(this._destroyed));
                })
            )
            .subscribe((result: TranslitResult) => {
                this._outText = result.outputText || '';

                if (!environment.production && this._sourceText === '_CrashlyticsTest_') {
                    this._logService.fatal('', {});
                }

                if (this._sourceText.length && this._curRuleName && result.replaced) {
                    this._logService.trackEvent({
                        name: `convert_${this._curRuleName}`,
                        properties: {
                            method: this._curRuleName,
                            input_length: this._sourceText.length,
                            duration_msec: result.duration,
                            source: this._convertSource,
                            app_version: appSettings.appVersion,
                            app_platform: 'android'
                        }
                    });

                    this._convertSource = 'direct';
                }
            });
    }

    ngAfterViewInit(): void {
        this._backButtonSubscription = this._platform.backButton.subscribe(() => {
            void this.handleBackButton();
        });
    }

    ngOnDestroy(): void {
        if (this._backButtonSubscription) {
            this._backButtonSubscription.unsubscribe();
        }

        this._destroyed.next();
        this._destroyed.complete();

        this._logService.flush();
    }

    clearInput(): void {
        this.sourceText = '';
    }

    async showShareSheet(): Promise<void> {
        this._sponsorSectionVisible = false;

        appSettings.socialSharing = appSettings.socialSharing || {};
        const socialSharingSubject = appSettings.socialSharing.subject;
        const socialSharingLink = appSettings.socialSharing.linkUrl;
        const socialSharingMessage = appSettings.socialSharing.message;

        try {
            await this._socialSharing.shareWithOptions({
                message: socialSharingMessage,
                subject: socialSharingSubject,
                url: socialSharingLink
                // appPackageName
            });

            const toast = await this._toastController.create({
                message: 'Thank you for sharing the app 😊.',
                duration: 2000
            });

            void toast.present();

            this._logService.trackEvent({
                name: 'share',
                properties: {
                    method: 'Social Sharing Native',
                    app_version: appSettings.appVersion,
                    app_platform: 'android'
                }
            });
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const errMsg = err && err.message ? ` ${err.message}` : '';
            this._logService.error(`An error occurs when sharing via Web API.${errMsg}`);
        }
    }

    promptForRating(): void {
        try {
            this._appRate.promptForRating(true);

            this._logService.trackEvent({
                name: 'rate',
                properties: {
                    method: 'App Rate Native',
                    app_version: appSettings.appVersion,
                    app_platform: 'android'
                }
            });
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const errMsg = err && err.message ? ` ${err.message}` : '';
            this._logService.error(`An error occurs while calling _appRate.promptForRating() method.${errMsg}`);
        }
    }

    async toggleSideNav(): Promise<void> {
        const isOpened = await this._menuController.toggle();
        this._logService.trackEvent({
            name: isOpened ? 'open_drawer_menu' : 'close_drawer_menu',
            properties: {
                action: isOpened ? 'open' : 'close',
                app_version: appSettings.appVersion,
                app_platform: 'android'
            }
        });
    }

    async showAboutModal(): Promise<void> {
        const modal = await this._modalController.create({
            component: AboutModalComponent
        });

        void modal.onDidDismiss().then(() => {
            this._logService.trackEvent({
                name: 'screen_view',
                properties: {
                    screen_name: 'Home',
                    app_platform: 'android'
                }
            });
        });
        await modal.present();

        this._logService.trackEvent({
            name: 'screen_view',
            properties: {
                screen_name: 'About',
                app_platform: 'android'
            }
        });
    }

    private initializeApp(): void {
        void this._platform.ready().then(async () => {
            await this.initRemoteConfigs();
            await this.detectDarkTheme();

            if (this._platform.is('android') || this._platform.is('ios')) {
                this._statusBar.styleLightContent();
            }

            if (this._platform.is('android')) {
                this._statusBar.backgroundColorByHexString(`#FF${this._appThemeColor.replace('#', '')}`);
                void this._headerColor.tint(this._appThemeColor);
            }

            if (this._platform.is('android') || this._platform.is('ios')) {
                this._splashScreen.hide();
            }

            if (this._platform.is('android')) {
                this.registerBroadcastReceiverAndroid();
            }

            this._platform.pause.pipe(takeUntil(this._destroyed)).subscribe(() => {
                this.onPlatformPaused();
            });

            this._platform.resume.pipe(takeUntil(this._destroyed)).subscribe(() => {
                this.onPlatformResumed();
            });

            this.handlePlatformReady();
        });
    }

    private async initRemoteConfigs(): Promise<void> {
        if (!this._platform.is('android') && !this._platform.is('ios')) {
            return;
        }

        try {
            if (environment.production) {
                await this._firebaseX.fetch();
            } else {
                await this._firebaseX.fetch(900);
            }

            await this._firebaseX.activateFetched();

            const remoteThemeColor = (await this._firebaseX.getValue('themeColor')) as string;
            if (remoteThemeColor) {
                this._appThemeColor = remoteThemeColor;
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const errMsg = err && err.message ? ` ${err.message}` : '';
            this._logService.error(`An error occurs while fetching firebase remote config.${errMsg}`);
        }
    }

    private async detectDarkTheme(): Promise<void> {
        if (this._platform.is('android') || this._platform.is('ios')) {
            try {
                const colorMode = (await this._firebaseX.getValue('colorMode')) as string;

                if (colorMode === 'dark') {
                    this.setDarkMode(true);

                    return;
                } else if (colorMode === 'light') {
                    this.setDarkMode(false);

                    return;
                }
            } catch (err) {
                // Do nothing
            }
        }

        const isDarkModeCached = await this.getCacheItem('isDarkMode');
        if (isDarkModeCached && (isDarkModeCached.toLowerCase() === 'true' || isDarkModeCached.toLowerCase() === '1')) {
            this.setDarkMode(true);
        } else {
            if (window.matchMedia('(prefers-color-scheme)').media !== 'not all') {
                const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

                this.setDarkMode(darkModeMediaQuery.matches);

                if (darkModeMediaQuery.addEventListener) {
                    darkModeMediaQuery.addEventListener('change', (mediaQuery) => {
                        this.setDarkMode(mediaQuery.matches);
                    });
                }
            } else {
                this.setDarkMode(true);
            }
        }
    }

    private setDarkMode(value: boolean): void {
        this._isDarkMode = value;
        this.toggleDarkTheme(value);

        void this.setCacheItem('isDarkMode', `${value}`.toLocaleLowerCase()).then(() => {
            // Do nothing
        });
    }

    private toggleDarkTheme(isDark: boolean): void {
        document.body.classList.toggle('dark', isDark);
    }

    private async handleWelcomeScreen(): Promise<void> {
        const cachedAppVersion = await this.getCacheItem('appVersion');

        if (cachedAppVersion !== this.appVersion) {
            this._sponsorSectionVisible = false;
            void this.showAboutModal();
            await this.setCacheItem('appVersion', this.appVersion);
        } else {
            if (this._platform.is('android') || this._platform.is('ios')) {
                try {
                    // Sponsors
                    const sStr = (await this._firebaseX.getValue('sponsors')) as string;
                    const sponsorList = JSON.parse(sStr) as Sponsor[];
                    this._sponsors = sponsorList.filter(
                        (s) => !s.inactive && (s.expiresIn == null || s.expiresIn >= Date.now())
                    );

                    const svStr = (await this._firebaseX.getValue('sponsorSectionVisible')) as string;
                    this._sponsorSectionVisible = svStr === 'true' ? true : false;
                } catch (err) {
                    // Do nothing
                }
            }

            this._logService.trackEvent({
                name: 'screen_view',
                properties: {
                    screen_name: 'Home',
                    app_platform: 'android'
                }
            });
        }
    }

    private onPlatformPaused(): void {
        if (this._platform.is('android')) {
            this._webIntent.unregisterBroadcastReceiver();
        }
    }

    private onPlatformResumed(): void {
        if (this._platform.is('android')) {
            this.registerBroadcastReceiverAndroid();
        }
    }

    private registerBroadcastReceiverAndroid(): void {
        this._webIntent.registerBroadcastReceiver({
            filterActions: ['com.darryncampbell.cordova.plugin.broadcastIntent.ACTION']
        });
    }

    private handlePlatformReady(): void {
        void this.handleWelcomeScreen();

        if (this._platform.is('android') || this._platform.is('ios')) {
            void this.handleWebIntent();
            this.handleDynamicLinks();
            void this.handlePromptForRating();
        }
    }

    private async handleBackButton(): Promise<void> {
        const ele = await this._modalController.getTop();
        if (ele) {
            void this._modalController.dismiss({
                dismissed: true
            });

            return;
        }

        const isMenuOpened = await this._menuController.isOpen();
        if (isMenuOpened) {
            void this._menuController.close();

            this._logService.trackEvent({
                name: 'close_drawer_menu',
                properties: {
                    action: 'close',
                    app_version: appSettings.appVersion,
                    app_platform: 'android'
                }
            });

            return;
        }

        if (new Date().getTime() - this._lastTimeBackPress < this._timePeriodToExit) {
            this._logService.flush();

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
            (navigator as any).app.exitApp();
        } else {
            const toast = await this._toastController.create({
                message: 'Press back again to exit the app.',
                duration: 2000
            });

            void toast.present();

            this._lastTimeBackPress = new Date().getTime();
        }
    }

    private async handlePromptForRating(): Promise<void> {
        const storeAppUrlInfo = appSettings.storeAppUrlInfo;

        let ratePromptedCount = 0;
        let rateButtonTouchCount = 0;

        const rateButtonTouchCountStr = await this.getCacheItem('rateButtonTouchCount');
        if (rateButtonTouchCountStr && rateButtonTouchCountStr.length) {
            try {
                rateButtonTouchCount = parseInt(rateButtonTouchCountStr, 10);
            } catch (err) {
                // Do nothing
            }
        }

        if (rateButtonTouchCount === 0) {
            const ratePromptedCountStr = await this.getCacheItem('ratePromptedCount');
            if (ratePromptedCountStr && ratePromptedCountStr.length) {
                try {
                    ratePromptedCount = parseInt(ratePromptedCountStr, 10);
                } catch (err) {
                    // Do nothing
                }
            }
        }

        this._appRate.preferences.storeAppURL = {
            ...storeAppUrlInfo
        };
        this._appRate.preferences.displayAppName = this.appName;
        this._appRate.preferences.usesUntilPrompt =
            rateButtonTouchCount > 0 ? rateButtonTouchCount * 10 : ratePromptedCount > 0 ? ratePromptedCount * 5 : 3;
        this._appRate.preferences.simpleMode = true;
        this._appRate.preferences.useCustomRateDialog = true;
        this._appRate.preferences.useLanguage = 'en';
        this._appRate.preferences.customLocale = {
            title: 'Do you \u2764\uFE0F using this app?',
            message: 'We hope yoou like using Zawgyi Unicode Converter.\nWe love to hear your feedback.',
            cancelButtonLabel: 'No, thanks',
            laterButtonLabel: 'Later',
            rateButtonLabel: 'Rate it now',
            yesButtonLabel: 'Yes',
            noButtonLabel: 'No'
            // appRatePromptTitle: 'Do you \u2764\uFE0F using this app?',
            // feedbackPromptTitle: 'Would you mind giving us some feedback?',
        };
        this._appRate.preferences.callbacks = {
            // handleNegativeFeedback: () => {
            //     window.open('mailto:app-support@dagonmetric.com', '_system');
            // },

            // onRateDialogShow: (cb: any) => {
            //     // cause immediate click on 'Rate Now' button
            //     cb(1);
            // },
            onButtonClicked: async (buttonIndex?: number) => {
                if (buttonIndex === 3) {
                    ++rateButtonTouchCount;
                    void this.setCacheItem('rateButtonTouchCount', `${rateButtonTouchCount}`);

                    const toast = await this._toastController.create({
                        message: 'Thank you for your review.',
                        duration: 2000
                    });

                    void toast.present();
                } else {
                    ++ratePromptedCount;
                    void this.setCacheItem('ratePromptedCount', `${ratePromptedCount}`);
                }
            }
        };

        if (rateButtonTouchCount > 1 || ratePromptedCount > 3) {
            return;
        }

        try {
            this._appRate.promptForRating(false);
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const errMsg = err && err.message ? ` ${err.message}` : '';
            this._logService.error(`An error occurs while calling _appRate.promptForRating() method.${errMsg}`);
        }
    }

    private handleDynamicLinks(): void {
        this._firebaseDynamicLinks.onDynamicLink().subscribe(
            () => {
                // Do nothing
            },
            (err) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const errMsg = err && err.message ? ` ${err.message}` : '';
                this._logService.error(`An error occurs on receiving dynamic link.${errMsg}`);
            }
        );
    }

    private async handleWebIntent(): Promise<void> {
        try {
            const intent = await this._webIntent.getIntent();

            if (intent.extras) {
                const textExtras = (intent.extras as { [key: string]: string })['android.intent.extra.TEXT'];
                if (textExtras) {
                    this._logService.trackEvent({
                        name: 'web_intent_received',
                        properties: {
                            action: intent.action,
                            type: intent.type,
                            app_version: appSettings.appVersion,
                            app_platform: 'android'
                        }
                    });

                    this._convertSource = 'web_intent';
                    this._sourceText = textExtras;
                    this.translitNext();
                }
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const errMsg = err && err.message ? ` ${err.message}` : '';
            this._logService.error(`An error occurs while calling _webIntent.getIntent() method.${errMsg}`);
        }
    }

    private onSourceEncChanged(val?: SourceEnc): void {
        this._sourceEnc = val;

        if (val === 'uni' || val === 'zg') {
            this._detectedEnc = val;
            const selectedText = val === 'zg' ? 'ZAWGYI' : 'UNICODE';
            this.resetFontEncSelectedText(selectedText);
            if (val === 'zg') {
                this._sourcePlaceholderText = this._sourcePlaceholderZg;
                this._targetPlaceholderText = this._targetPlaceholderUni;
            } else {
                this._sourcePlaceholderText = this._sourcePlaceholderUni;
                this._targetPlaceholderText = this._targetPlaceholderZg;
            }
        } else {
            this._detectedEnc = null;
            this.resetFontEncSelectedText();
            this._sourcePlaceholderText = this._sourcePlaceholderAuto;
            this._targetPlaceholderText = this._targetPlaceholderAuto;
        }

        if (this._sourceEnc === 'zg' && (!this.targetEnc || this.targetEnc === 'zg')) {
            this._targetEnc = 'uni';
        } else if (this._sourceEnc === 'uni' && (!this.targetEnc || this.targetEnc === 'uni')) {
            this._targetEnc = 'zg';
        }

        this._logService.trackEvent({
            name: `change_input_font_${this.sourceEnc}`,
            properties: {
                font_enc: this.sourceEnc,
                app_version: appSettings.appVersion,
                app_platform: 'android'
            }
        });

        this.translitNext();
    }

    private resetFontEncSelectedText(text?: string): void {
        if (text) {
            this._fontEncSelectedText = text;
        } else if (this._sourceText && this.sourceText.trim().length) {
            this._fontEncSelectedText = 'ထည့်သွင်းဖောင့်ကိုရွေးချယ်ပါ';
        } else {
            this._fontEncSelectedText = this._selectInputFontText;
        }
    }

    private translitNext(): void {
        this._translitSubject.next(`${this._sourceEnc}|${this._convertSource}|${this._sourceText}`);
    }

    private async setCacheItem(key: string, value: string): Promise<void> {
        if (typeof localStorage === 'object') {
            try {
                localStorage.setItem(key, value);
            } catch (err) {
                this._logService.error('An error occurs while calling localStorage.setItem() method.');
            }
        }

        if (!this._platform.is('android') && !this._platform.is('ios')) {
            return null;
        }

        try {
            await this._nativeStorage.setItem(key, value);
        } catch (err) {
            this._logService.error('An error occurs while calling _nativeStorage.setItem() method.');
        }
    }

    private async getCacheItem(key: string): Promise<string | null> {
        if (typeof localStorage === 'object') {
            try {
                const cachedValue = localStorage.getItem(key);
                if (cachedValue != null) {
                    return cachedValue;
                }
            } catch (err) {
                this._logService.error('An error occurs while calling localStorage.getItem() method.');
            }
        }

        if (!this._platform.is('android') && !this._platform.is('ios')) {
            return null;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const cachedValue = await this._nativeStorage.getItem(key);
            if (cachedValue != null) {
                return cachedValue as string;
            }
        } catch (err) {
            this._logService.error('An error occurs while calling _nativeStorage.getItem() method.');
        }

        return null;
    }
}
