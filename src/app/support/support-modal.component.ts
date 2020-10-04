/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { Component } from '@angular/core';

import { ModalController } from '@ionic/angular';

/**
 * The app support modal component.
 */
@Component({
    selector: 'app-support-modal',
    templateUrl: 'support-modal.component.html'
})
export class SupportModalComponent {
    constructor(private readonly _modalController: ModalController) {}

    dismissModal(): void {
        void this._modalController.dismiss({
            dismissed: true
        });
    }
}
