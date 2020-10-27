/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { Component, Input } from '@angular/core';

import { ModalController, ToastController } from '@ionic/angular';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';

import { LogService, Logger } from '@dagonmetric/ng-log';

import { appSettings } from '../shared';

/**
 * The app notification modal component.
 */
@Component({
    selector: 'app-notification-modal',
    templateUrl: 'notification-modal.component.html',
    styleUrls: ['notification-modal.component.scss']
})
export class NotificationModalComponent {
    @Input()
    titleText: string;

    @Input()
    bodyText: string;

    @Input()
    bodyText2: string;

    @Input()
    bodyText3: string;

    @Input()
    link: string;

    @Input()
    linkLabel: string;

    @Input()
    linkColor: string;

    @Input()
    imageUrl: string;

    @Input()
    isAd: string;

    private readonly _logger: Logger;

    constructor(
        private readonly _modalController: ModalController,
        private readonly _toastController: ToastController,
        private readonly _socialSharing: SocialSharing,
        logService: LogService
    ) {
        this._logger = logService.createLogger('app-notification');
    }

    dismissModal(): void {
        void this._modalController.dismiss({
            dismissed: true
        });
    }

    async showShareSheet(): Promise<void> {
        if (!this.link) {
            return;
        }

        const socialSharingSubject = this.titleText || this.bodyText;
        const socialSharingLink = this.link;
        const socialSharingMessage = this.bodyText;

        try {
            await this._socialSharing.shareWithOptions({
                message: socialSharingMessage,
                subject: socialSharingSubject,
                url: socialSharingLink
                // appPackageName
            });

            const toast = await this._toastController.create({
                message: 'မျှဝေတဲ့အတွက် ကျေးဇူးတင်ပါတယ်။',
                duration: 4000,
                cssClass: 'my-uni'
            });

            void toast.present();

            this._logger.trackEvent({
                name: this.isAd ? 'share_ad_message' : 'share_app_message',
                properties: {
                    link: this.link,
                    subject: socialSharingSubject,
                    app_version: appSettings.appVersion,
                    app_platform: 'android'
                }
            });
        } catch (err) {
            this._logger.error(`An error occurs when sharing via Web API. ${err}`);
        }
    }
}
