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

import { LogService, Logger } from '@dagonmetric/ng-log';

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
    get appName(): string {
        return appSettings.appName;
    }

    get appVersion(): string {
        return appSettings.appVersion;
    }

    get navLinks(): NavLinkItem[] {
        return appSettings.navLinks;
    }

    private readonly _logger: Logger;

    constructor(
        private readonly _modalController: ModalController,
        private readonly _toastController: ToastController,
        private readonly _socialSharing: SocialSharing,
        logService: LogService
    ) {
        this._logger = logService.createLogger('app-about');
    }

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
                message: 'ဤအက်ပ်ကိုမျှဝေတဲ့အတွက် ကျေးဇူးတင်ပါတယ်။',
                duration: 4000,
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
            this._logger.error(`An error occurs when sharing via Web API. ${err}`);
        }
    }
}
