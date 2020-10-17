/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

import { MenuController, ModalController, Platform, ToastController } from '@ionic/angular';

import { AppRate } from '@ionic-native/app-rate/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { HeaderColor } from '@ionic-native/header-color/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { WebIntent } from '@ionic-native/web-intent/ngx';

import { LogService, Logger } from '@dagonmetric/ng-log';
import { TranslitResult, TranslitService } from '@dagonmetric/ng-translit';
import { DetectedEnc, ZawgyiDetector } from '@myanmartools/ng-zawgyi-detector';

import { environment } from '../environments/environment';

import { CdkTextareaSyncSize } from '../modules/cdk-extensions';

import { FirebaseCloudMessage, NavLinkItem, Sponsor, appSettings } from './shared';

import { AboutModalComponent } from './about';
import { AppLog, AppLogsModalComponent } from './app-logs';
import { NotificationModalComponent } from './notification';

export type SourceEnc = 'auto' | DetectedEnc;

const SelectInputFontText = 'ထည့်သွင်းဖောင့်ရွေးရန် (အော်တို)';

const SourceZgOrUniLabelText = 'ဇော်ဂျီ(သို့)ယူနီကုတ်စာသားကိုဤနေရာတွင်ထည့်ပါ';
const SourceZgLabelText = 'ဇော်ဂျီစာသားကိုဤနေရာတွင်ထည့်ပါ';
const SourceUniLabelText = 'ယူနီကုတ်စာသားကိုဤနေရာတွင်ထည့်ပါ';

const TargetZgOrUniLabelText = 'ပြောင်းပြီးစာသားကိုဤနေရာတွင်တွေ့ရမည်';
const TargetZgLabelText = 'ပြောင်းပြီးဇော်ဂျီစာသားကိုဤနေရာတွင်တွေ့ရမည်';
const TargetUniLabelText = 'ပြောင်းပြီးယူနီကုတ်စာသားကိုဤနေရာတွင်တွေ့ရမည်';

const RateOpenedCountKey = 'rateOpenedCount';
const RatePromptedCountKey = 'ratePromptedCount';

/**
 * Core app component.
 */
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('sourceTextareaSyncSize', { static: false })
    sourceTextareaSyncSize?: CdkTextareaSyncSize;

    @ViewChild('outTextareaSyncSize', { static: false })
    outTextareaSyncSize?: CdkTextareaSyncSize;

    customPopoverOptions = {
        cssClass: 'my-uni'
    };

    private readonly _translitSubject = new Subject<string>();
    private readonly _destroyed = new Subject<void>();

    private readonly _timePeriodToExit = 2000;

    private _backButtonSubscription?: Subscription;
    private _sourceText = '';
    private _outText = '';
    private _sourceEnc?: SourceEnc = 'auto';
    private _targetEnc?: DetectedEnc;
    private _convertSource = 'direct';

    private _detectedEnc: DetectedEnc = null;
    private _curRuleName = '';

    private _lastTimeBackPress = 0;
    private _isDarkMode?: boolean | null = null;

    private _sponsorSectionVisible = false;
    private _sponsors: Sponsor[] = [];

    private _fontEncSelectedText = SelectInputFontText;
    private _sourceLabelText = SourceZgOrUniLabelText;
    private _targetLabelText = TargetZgOrUniLabelText;

    private readonly _logger: Logger;

    private _appLogs: AppLog[] = [];
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
            return this._sourceLabelText;
        }
    }

    get targeetEncLabel(): string {
        if (this._detectedEnc === 'zg' && this._outText && this._outText.trim().length) {
            return 'UNICODE';
        } else if (this._detectedEnc === 'uni') {
            return 'ZAWGYI';
        } else {
            return this._targetLabelText;
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

    // get sourcePlaceholderText(): string {
    //     return this._sourcePlaceholderText || this._sourcePlaceholderAuto;
    // }

    // get targetPlaceholderText(): string {
    //     return this._targetPlaceholderText || this._targetPlaceholderAuto;
    // }

    get isDarkMode(): boolean {
        return this._isDarkMode == null ? false : this._isDarkMode;
    }
    set isDarkMode(value: boolean) {
        this.setDarkMode(value);

        this._logger.trackEvent({
            name: value ? 'change_dark_mode' : 'change_light_mode',
            properties: {
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
        private readonly _menuController: MenuController,
        private readonly _modalController: ModalController,
        private readonly _toastController: ToastController,
        private readonly _appRate: AppRate,
        private readonly _clipboard: Clipboard,
        private readonly _firebaseX: FirebaseX,
        private readonly _headerColor: HeaderColor,
        private readonly _nativeStorage: NativeStorage,
        private readonly _platform: Platform,
        private readonly _socialSharing: SocialSharing,
        private readonly _splashScreen: SplashScreen,
        private readonly _statusBar: StatusBar,
        private readonly _webIntent: WebIntent,
        private readonly _translitService: TranslitService,
        private readonly _zawgyiDetector: ZawgyiDetector,
        logService: LogService
    ) {
        this._logger = logService.createLogger('app');
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

                if (this._sourceText.length && this._curRuleName && result.replaced) {
                    this._logger.trackEvent({
                        name: `convert_${this._curRuleName}`,
                        properties: {
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
        if (this.sourceTextareaSyncSize) {
            this.sourceTextareaSyncSize.secondCdkTextareaSyncSize = this.outTextareaSyncSize;
        }
        if (this.outTextareaSyncSize) {
            this.outTextareaSyncSize.secondCdkTextareaSyncSize = this.sourceTextareaSyncSize;
        }

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

        this._logger.flush();
    }

    clearInput(): void {
        this.sourceText = '';
        this._logger.trackEvent({
            name: 'clear_input',
            properties: {
                app_version: appSettings.appVersion,
                app_platform: 'android'
            }
        });
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
                message: 'ဤအက်ပ်ကိုမျှဝေတဲ့အတွက် ကျေးဇူးတင်ပါတယ်။',
                duration: 5000,
                cssClass: 'my-uni'
            });

            void toast.present();

            this._logger.trackEvent({
                name: 'app_share',
                properties: {
                    app_version: appSettings.appVersion,
                    app_platform: 'android'
                }
            });
        } catch (err) {
            const errPrefixMsg = 'An error occurs when sharing via Web API.';
            this._logger.error(`${errPrefixMsg} ${err}`);
            this._appLogs.push({
                message: errPrefixMsg,
                data: err
            });
        }
    }

    async openAppReview(): Promise<void> {
        await this.openAppRateUrl(appSettings.storeAppUrlInfo.android);
    }

    async toggleSideNav(): Promise<void> {
        const isOpened = await this._menuController.toggle();
        this._logger.trackEvent({
            name: isOpened ? 'open_drawer_menu' : 'close_drawer_menu',
            properties: {
                app_version: appSettings.appVersion,
                app_platform: 'android'
            }
        });
    }

    logoClicked(): void {
        if (this.sourceText && this.sourceText.toLowerCase() === '$crashlyticstest') {
            this._logger.fatal('', {});
        } else if (this.sourceText && this.sourceText.toLowerCase() === '$showlogs') {
            void this.showAppLogModal();
        } else if (this.sourceText && this.sourceText.toLowerCase() === '$clearlogs') {
            this._appLogs = [];
        } else if (this.sourceText && this.sourceText.toLowerCase() === '$toggledarkmode') {
            this.isDarkMode = !this.isDarkMode;
        } else if (this.sourceText && this.sourceText.toLowerCase() === '$togglemenu') {
            void this.toggleSideNav();
        } else if (this.sourceText && this.sourceText.toLowerCase() === '$showsponsors') {
            this._sponsorSectionVisible = true;
        } else if (this.sourceText && this.sourceText.toLowerCase() === '$hidesponsors') {
            this._sponsorSectionVisible = false;
        } else {
            void this.showAboutModal();
        }
    }

    async showAboutModal(): Promise<void> {
        const modal = await this._modalController.create({
            component: AboutModalComponent
        });

        void modal.onDidDismiss().then(() => {
            this._logger.trackEvent({
                name: 'screen_view',
                properties: {
                    screen_name: 'Home',
                    app_platform: 'android'
                }
            });
        });
        await modal.present();

        this._logger.trackEvent({
            name: 'screen_view',
            properties: {
                screen_name: 'About',
                app_platform: 'android'
            }
        });
    }

    async showAppLogModal(): Promise<void> {
        const modal = await this._modalController.create({
            component: AppLogsModalComponent,
            componentProps: {
                appLogs: this._appLogs
            }
        });

        void modal.onDidDismiss().then(() => {
            this._logger.trackEvent({
                name: 'screen_view',
                properties: {
                    screen_name: 'Home',
                    app_platform: 'android'
                }
            });
        });
        await modal.present();

        this._logger.trackEvent({
            name: 'screen_view',
            properties: {
                screen_name: 'Logs',
                app_platform: 'android'
            }
        });
    }

    async copyOutTextToClipboard(): Promise<void> {
        if (!this._outText) {
            return;
        }

        await this._clipboard.clear();
        await this._clipboard.copy(this._outText);

        this._logger.trackEvent({
            name: 'copy_output',
            properties: {
                app_version: appSettings.appVersion,
                app_platform: 'android'
            }
        });

        const toast = await this._toastController.create({
            message: 'ပြောင်းပြီးစာသားများကို ကူးယူပြီးပါပြီ။',
            duration: 2000,
            cssClass: 'my-uni'
        });

        void toast.present();
    }

    private initializeApp(): void {
        void this._platform.ready().then(async () => {
            if (this._platform.is('android') || this._platform.is('ios')) {
                await this.initFirebaseRemoteConfig();
                await this.detectDarkTheme();
                this._statusBar.styleLightContent();

                if (this._platform.is('android')) {
                    this._statusBar.backgroundColorByHexString(`#FF${this._appThemeColor.replace('#', '')}`);
                    void this._headerColor.tint(this._appThemeColor);
                }

                this._splashScreen.hide();

                if (this._platform.is('android')) {
                    this.registerBroadcastReceiverAndroid();
                }

                this._platform.pause.pipe(takeUntil(this._destroyed)).subscribe(() => {
                    this.onPlatformPaused();
                });

                this._platform.resume.pipe(takeUntil(this._destroyed)).subscribe(() => {
                    this.onPlatformResumed();
                });

                this.initFirebaseCloudMessaging();
                this.handlePlatformReady();
            }
        });
    }

    private initFirebaseCloudMessaging(): void {
        this._firebaseX
            .getToken()
            .then((token) => {
                this._appLogs.push({
                    message: 'Got a firebase token.',
                    data: token
                });
            })
            .catch((err) => {
                const errPrefixMsg = 'An error occurs while getting firebase token.';
                this._logger.error(`${errPrefixMsg} ${err}`);
                this._appLogs.push({
                    message: errPrefixMsg,
                    data: err
                });
            });

        this._firebaseX.onMessageReceived().subscribe((message: FirebaseCloudMessage) => {
            this._appLogs.push({
                message: 'Firebase message received.',
                data: message
            });

            void this.handleFirebaseMessageReceived(message);
        });

        this._firebaseX.onTokenRefresh().subscribe((token) => {
            this._appLogs.push({
                message: 'Got a new firebase refresh token.',
                data: token
            });
        });
    }

    private async initFirebaseRemoteConfig(): Promise<void> {
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
            const errPrefixMsg = 'An error occurs while fetching firebase remote config.';
            this._logger.error(`${errPrefixMsg} ${err}`);
            this._appLogs.push({
                message: errPrefixMsg,
                data: err
            });
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

            this._logger.trackEvent({
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
        void this.handleWebIntent();
        void this.handleAppRate();
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

            this._logger.trackEvent({
                name: 'close_drawer_menu',
                properties: {
                    app_version: appSettings.appVersion,
                    app_platform: 'android'
                }
            });

            return;
        }

        if (new Date().getTime() - this._lastTimeBackPress < this._timePeriodToExit) {
            this._logger.flush();

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
            (navigator as any).app.exitApp();
        } else {
            const toast = await this._toastController.create({
                message: 'အက်ပ်မှထွက်ရန် back button ထပ်နှိပ်ပါ။',
                duration: 2000,
                cssClass: 'my-uni'
            });

            void toast.present();

            this._lastTimeBackPress = new Date().getTime();
        }
    }

    private async handleAppRate(): Promise<void> {
        let usesUntilPrompt = 3;
        const rateOpenedCount = await this.getRateOpenedCount();
        if (rateOpenedCount > 0) {
            usesUntilPrompt = rateOpenedCount * 30;
        } else {
            const ratePromptedCount = await this.getRatePromptCount();
            if (ratePromptedCount > 0) {
                usesUntilPrompt = ratePromptedCount * 5;
            }
        }

        this._appRate.preferences = {
            displayAppName: this.appName,
            storeAppURL: {
                ...appSettings.storeAppUrlInfo
            },
            usesUntilPrompt,
            simpleMode: true,
            useCustomRateDialog: true,
            useLanguage: 'en',
            customLocale: {
                title: 'Do you \u2764\uFE0F using this app?',
                message: 'We hope yoou like using Zawgyi Unicode Converter.\nWe love to hear your feedback.',
                cancelButtonLabel: 'No, thanks',
                laterButtonLabel: 'Later',
                rateButtonLabel: 'Rate it now',
                yesButtonLabel: 'Yes',
                noButtonLabel: 'No'
            },
            openUrl: async (url) => {
                await this.openAppRateUrl(url);
            },
            callbacks: {
                onButtonClicked: async () => {
                    await this.increaseRatePromptCount();
                }
            }
        };

        try {
            this._appRate.promptForRating(false);
        } catch (err) {
            const errPrefixMsg = 'An error occurs while calling _appRate.promptForRating() method.';
            this._logger.error(`${errPrefixMsg} ${err}`);
            this._appLogs.push({
                message: errPrefixMsg,
                data: err
            });
        }
    }

    private async getRateOpenedCount(): Promise<number> {
        const str = await this.getCacheItem(RateOpenedCountKey);
        if (str && str.length) {
            try {
                return parseInt(str, 10);
            } catch (err) {
                // Do nothing
            }
        }

        return 0;
    }

    private async increaseRateOpenedCount(): Promise<void> {
        let count = await this.getRateOpenedCount();
        ++count;

        await this.setCacheItem(RateOpenedCountKey, `${count}`);
    }

    private async getRatePromptCount(): Promise<number> {
        const str = await this.getCacheItem(RatePromptedCountKey);
        if (str && str.length) {
            try {
                return parseInt(str, 10);
            } catch (err) {
                // Do nothing
            }
        }

        return 0;
    }

    private async increaseRatePromptCount(): Promise<void> {
        let count = await this.getRatePromptCount();
        ++count;

        await this.setCacheItem(RatePromptedCountKey, `${count}`);
    }

    private async openAppRateUrl(url: string): Promise<void> {
        if (!((window as unknown) as { SafariViewController: boolean }).SafariViewController) {
            window.open(url, '_blank', 'location=yes');
        } else {
            // TODO: To implement
        }

        await this.increaseRateOpenedCount();

        this._logger.trackEvent({
            name: 'open_app_rate',
            properties: {
                url,
                app_version: appSettings.appVersion,
                app_platform: 'android'
            }
        });

        const toast = await this._toastController.create({
            message: 'သင်၏ပြန်လည်သုံးသပ်မှုအတွက် ကျေးဇူးတင်ပါတယ်။',
            duration: 5000,
            cssClass: 'my-uni'
        });

        void toast.present();
    }

    // private handleDynamicLinks(): void {
    //     this._firebaseDynamicLinks.onDynamicLink().subscribe(
    //         () => {
    //             // Do nothing
    //         },
    //         (err) => {
    //             // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    //             const errMsg = err && err.message ? ` ${err.message}` : '';
    //             this._logger.error(`An error occurs on receiving dynamic link.${errMsg}`);
    //         }
    //     );
    // }

    private async handleWebIntent(): Promise<void> {
        try {
            const intent = await this._webIntent.getIntent();

            if (intent.extras) {
                const textExtras = (intent.extras as { [key: string]: string })['android.intent.extra.TEXT'];
                if (textExtras) {
                    this._logger.trackEvent({
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
            const errPrefixMsg = 'An error occurs while calling _webIntent.getIntent() method.';
            this._logger.error(`${errPrefixMsg} ${err}`);
            this._appLogs.push({
                message: errPrefixMsg,
                data: err
            });
        }
    }

    private async handleFirebaseMessageReceived(message: FirebaseCloudMessage): Promise<Promise<void>> {
        const data: { [key: string]: string } = message.data || {};

        const titleText = message.title || message.titleText;
        const bodyText = message.body || message.bodyText;
        const link = message.link || data.link;
        const linkLabel = message.linkLabel || data.linkLabel;
        const linkColor = message.linkColor || data.linkColor || 'blue';
        const imageUrl = message.imageUrl || data.imageUrl;
        const isAd = message.isAd || data.isAd;

        if (!bodyText) {
            return;
        }

        const modal = await this._modalController.create({
            component: NotificationModalComponent,
            componentProps: {
                titleText,
                bodyText,
                link,
                linkLabel,
                linkColor,
                imageUrl,
                isAd
            }
        });

        void modal.onDidDismiss().then(() => {
            this._logger.trackEvent({
                name: 'screen_view',
                properties: {
                    screen_name: 'Home',
                    app_platform: 'android'
                }
            });
        });
        await modal.present();

        this._logger.trackEvent({
            name: 'screen_view',
            properties: {
                screen_name: 'Notification',
                app_platform: 'android'
            }
        });
    }

    private onSourceEncChanged(val?: SourceEnc): void {
        this._sourceEnc = val;

        if (val === 'uni' || val === 'zg') {
            this._detectedEnc = val;
            const selectedText = val === 'zg' ? 'ဇော်ဂျီ' : 'ယူနီကုတ်';
            this.resetFontEncSelectedText(selectedText);
            if (val === 'zg') {
                this._sourceLabelText = SourceZgLabelText;
                this._targetLabelText = TargetUniLabelText;
            } else {
                this._sourceLabelText = SourceUniLabelText;
                this._targetLabelText = TargetZgLabelText;
            }
        } else {
            this._detectedEnc = null;
            this.resetFontEncSelectedText();
            this._sourceLabelText = SourceZgOrUniLabelText;
            this._targetLabelText = TargetZgOrUniLabelText;
        }

        if (this._sourceEnc === 'zg' && (!this.targetEnc || this.targetEnc === 'zg')) {
            this._targetEnc = 'uni';
        } else if (this._sourceEnc === 'uni' && (!this.targetEnc || this.targetEnc === 'uni')) {
            this._targetEnc = 'zg';
        }

        this._logger.trackEvent({
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
            this._fontEncSelectedText = 'ထည့်သွင်းဖောင့်ကိုရွေးပါ';
        } else {
            this._fontEncSelectedText = SelectInputFontText;
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
                const errPrefixMsg = 'An error occurs while calling localStorage.setItem() method.';
                this._logger.error(`${errPrefixMsg} ${err}`);
                this._appLogs.push({
                    message: errPrefixMsg,
                    data: err
                });
            }
        }

        if (!this._platform.is('android') && !this._platform.is('ios')) {
            return null;
        }

        try {
            await this._nativeStorage.setItem(key, value);
        } catch (err) {
            const errPrefixMsg = 'An error occurs while calling _nativeStorage.setItem() method.';
            this._logger.error(`${errPrefixMsg} ${err}`);
            this._appLogs.push({
                message: errPrefixMsg,
                data: err
            });
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
                const errPrefixMsg = 'An error occurs while calling localStorage.getItem() method.';
                this._logger.error(`${errPrefixMsg} ${err}`);
                this._appLogs.push({
                    message: errPrefixMsg,
                    data: err
                });
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
            const errPrefixMsg = 'An error occurs while calling _nativeStorage.getItem() method.';
            this._logger.error(`${errPrefixMsg} ${err}`);
            this._appLogs.push({
                message: errPrefixMsg,
                data: err
            });
        }

        return null;
    }
}
