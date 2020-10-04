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

import { LogService } from '@dagonmetric/ng-log';

import { NavLinkItem, appSettings } from '../shared';

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
        return appSettings.appName;
    }

    get appVersion(): string {
        return appSettings.appVersion;
    }

    get navLinks(): NavLinkItem[] {
        return appSettings.navLinks;
    }

    constructor(
        private readonly _modalController: ModalController,
        private readonly _toastController: ToastController,
        private readonly _socialSharing: SocialSharing,
        private readonly _logService: LogService
    ) {}

    dismissModal(): void {
        void this._modalController.dismiss({
            dismissed: true
        });
    }

    async showShareSheet(): Promise<void> {
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
                    app_version: appSettings.appVersion
                }
            });
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const errMsg = err && err.message ? ` ${err.message}` : '';
            this._logService.error(`An error occurs when sharing via Web API.${errMsg}`);
        }
    }
}
