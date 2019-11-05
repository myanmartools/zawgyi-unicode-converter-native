/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { NavLinkItem } from './nav-link-item';
import { SocialSharingOptions } from './social-sharing-options';
import { StoreAppUrlInfo } from './store-app-url-info';

export interface AppConfig {
    appName: string;
    appVersion: string;
    appThemeColor: string;
    navLinks: NavLinkItem[];
    storeAppUrlInfo: StoreAppUrlInfo;
    socialSharing: SocialSharingOptions;
    facebookAppId?: string;
    privacyUrl: string;
}
