/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { Component } from '@angular/core';

import { ModalController, ToastController } from '@ionic/angular';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';

import { ConfigService } from '@dagonmetric/ng-config';
import { LogService } from '@dagonmetric/ng-log';

import { AppConfig, NavLinkItem } from '../shared';

/**
 * The app about modal component.
 */
@Component({
    selector: 'app-about-modal',
    templateUrl: 'about-modal.component.html',
    styleUrls: ['about-modal.component.scss']
})
export class AboutModalComponent {
    slidesOptions = {
        initialSlide: 0,
        slidesPerView: 1,
        autoplay: true
    };

    get appName(): string {
        return this._appConfig.appName;
    }

    get appVersion(): string {
        return this._appConfig.appVersion;
    }

    get navLinks(): NavLinkItem[] {
        return this._appConfig.navLinks;
    }

    private readonly _appConfig: AppConfig;

    constructor(
        private readonly _modalController: ModalController,
        private readonly _toastController: ToastController,
        private readonly _socialSharing: SocialSharing,
        private readonly _logService: LogService,
        configService: ConfigService
    ) {
        this._appConfig = configService.getValue<AppConfig>('app');
    }

    dismissModal(): void {
        // tslint:disable-next-line: no-floating-promises
        this._modalController.dismiss({
            dismissed: true
        });
    }

    async showShareSheet(): Promise<void> {
        this._appConfig.socialSharing = this._appConfig.socialSharing || {};
        const socialSharingSubject = this._appConfig.socialSharing.subject;
        const socialSharingLink = this._appConfig.socialSharing.linkUrl;
        const socialSharingMessage = this._appConfig.socialSharing.message;

        try {
            // tslint:disable-next-line: no-floating-promises
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
            // tslint:disable-next-line: no-floating-promises
            toast.present();

            this._logService.trackEvent({
                name: 'share',
                properties: {
                    method: 'Social Sharing Native'
                }
            });
        } catch (err) {
            // tslint:disable-next-line: no-unsafe-any
            const errMsg = err && err.message ? ` ${err.message}` : '';
            this._logService.error(`An error occurs when sharing via Web API.${errMsg}`);
        }
    }
}
