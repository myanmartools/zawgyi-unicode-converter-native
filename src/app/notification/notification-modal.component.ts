/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { Component, Input } from '@angular/core';

import { ModalController } from '@ionic/angular';

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
    title: string;

    @Input()
    body: string;

    @Input()
    data: { [key: string]: string } = {};

    @Input()
    themeColor: string;

    constructor(private readonly _modalController: ModalController) {}

    dismissModal(): void {
        void this._modalController.dismiss({
            dismissed: true
        });
    }
}
