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

import { LogService } from '@dagonmetric/ng-log';

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
    link: string;

    @Input()
    linkLabel: string;

    @Input()
    linkColor: string;

    @Input()
    imageUrl: string;

    @Input()
    isAd: string;

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
                duration: 5000,
                cssClass: 'my-uni'
            });

            void toast.present();

            this._logService.trackEvent({
                name: this.isAd ? 'share_ad_noti' : 'share_ad',
                properties: {
                    method: 'share',
                    app_version: appSettings.appVersion
                }
            });
        } catch (err) {
            this._logService.error(`An error occurs when sharing via Web API. ${err}`);
        }
    }
}
