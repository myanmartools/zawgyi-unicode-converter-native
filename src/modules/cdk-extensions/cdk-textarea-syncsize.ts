/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    Directive,
    DoCheck,
    ElementRef,
    HostListener,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    Optional
} from '@angular/core';

import { Subject, fromEvent } from 'rxjs';
import { auditTime, takeUntil } from 'rxjs/operators';

export function coerceNumberProperty(value: unknown): number;
export function coerceNumberProperty<D>(value: unknown, fallback: D): number | D;
export function coerceNumberProperty(value: unknown, fallbackValue = 0): number {
    return _isNumberValue(value) ? Number(value) : fallbackValue;
}

export function _isNumberValue(value: unknown): boolean {
    return !isNaN(parseFloat(value as string)) && !isNaN(Number(value));
}

/**
 * Directive for Syncing two text area.
 */
@Directive({
    selector: 'textarea[cdkTextareaSyncSize]',
    exportAs: 'cdkTextareaSyncSize',
    host: {
        class: 'cdk-textarea-syncsize',
        // Textarea elements that have the directive applied should have a single row by default.
        // Browsers normally show two rows by default and therefore this limits the minRows binding.
        rows: '1'
        // '(input)': '_noopInputHandler()'
    }
})
export class CdkTextareaSyncSize implements AfterViewInit, DoCheck, OnDestroy {
    _cachedHeight = -1;

    protected _document?: Document;

    private _previousValue?: string;
    private _initialHeight?: string | null;
    private readonly _destroyed = new Subject<void>();

    private _minRows?: number;
    private _maxRows?: number;
    private _enabled = true;

    private _previousMinRows = -1;

    private readonly _textareaElement: HTMLTextAreaElement;

    @Input('cdkAutosizeMinRows')
    get minRows(): number {
        return this._minRows != null ? this._minRows : this.getMinRowsAutoHeight();
    }
    set minRows(value: number) {
        this._minRows = coerceNumberProperty(value);
        this.setMinHeight();
    }

    @Input('cdkAutosizeMaxRows')
    get maxRows(): number {
        return this._maxRows != null ? this._maxRows : 0;
    }
    set maxRows(value: number) {
        this._maxRows = coerceNumberProperty(value);
        this.setMaxHeight();
    }

    @Input('cdkTextareaSyncSize')
    get enabled(): boolean {
        return this._enabled;
    }
    set enabled(value: boolean) {
        value = coerceBooleanProperty(value);

        if (this._enabled !== value) {
            this._enabled = value;
            if (this._enabled) {
                if (this._platform.isBrowser) {
                    this.resizeToFitContent(true);
                } else {
                    this.cacheTextareaLineHeightNonBrowser();
                }
            } else {
                this.reset();
            }
        }
    }

    @Input('secondCdkTextareaSyncSize')
    get secondCdkTextareaSyncSize(): CdkTextareaSyncSize | undefined {
        return this._secondCdkTextareaSyncSize;
    }
    set secondCdkTextareaSyncSize(value: CdkTextareaSyncSize | undefined) {
        this._secondCdkTextareaSyncSize = value;
    }

    private _measuringClass: string;
    private readonly _lineHeightMeasuringClass: 'cdk-textarea-syncsize-lineheight-measuring';
    private _cachedLineHeight?: number;
    private _secondCdkTextareaSyncSize?: CdkTextareaSyncSize;

    constructor(
        private readonly _elementRef: ElementRef<HTMLElement>,
        private readonly _platform: Platform,
        private readonly _ngZone: NgZone,
        /** @breaking-change 11.0.0 make document required */
        @Optional() @Inject(DOCUMENT) document?: Document
    ) {
        this._document = document;

        this._textareaElement = this._elementRef.nativeElement as HTMLTextAreaElement;
        this._measuringClass = _platform.FIREFOX
            ? 'cdk-textarea-autosize-measuring-firefox'
            : 'cdk-textarea-autosize-measuring';
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    @HostListener('input') _noopInputHandler() {
        // no-op handler that ensures we're running change detection on input events.
    }

    ngAfterViewInit(): void {
        if (this._platform.isBrowser) {
            // Remember the height which we started with in case autosizing is disabled
            this._initialHeight = this._textareaElement.style.height;

            this.resizeToFitContent();

            this._ngZone.runOutsideAngular(() => {
                const window = this.getWindow();

                fromEvent(window, 'resize')
                    .pipe(auditTime(16), takeUntil(this._destroyed))
                    .subscribe(() => {
                        this.resizeToFitContent(true);
                    });
            });
        } else {
            // Custom
            this.cacheTextareaLineHeightNonBrowser();
        }
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.complete();
    }

    ngDoCheck(): void {
        if (this._platform.isBrowser) {
            this.resizeToFitContent();
        }
    }

    resizeToFitContent(force = false, suggestedMinHeight = -1): void {
        if (!this._enabled) {
            return;
        }

        this.cacheTextareaLineHeight();

        if (!this._cachedLineHeight) {
            return;
        }

        const textarea = this._elementRef.nativeElement as HTMLTextAreaElement;
        const value = textarea.value;

        if (!force && this.minRows === this._previousMinRows && value === this._previousValue) {
            return;
        }

        const placeholderText = textarea.placeholder;
        textarea.classList.add(this._measuringClass);
        textarea.placeholder = '';

        // The measuring class includes a 2px padding to workaround an issue with Chrome,
        // so we account for that extra space here by subtracting 4 (2px top + 2px bottom).
        // const height = textarea.scrollHeight - 4;
        let height = textarea.scrollHeight;

        if (height < suggestedMinHeight) {
            height = suggestedMinHeight;
        }

        let heightChanged = false;
        if (height !== this._cachedHeight) {
            textarea.style.height = `${height}px`;
            this._cachedHeight = height;
            heightChanged = true;
        }

        textarea.classList.remove(this._measuringClass);
        textarea.placeholder = placeholderText;

        if (heightChanged && this.secondCdkTextareaSyncSize && suggestedMinHeight <= 0) {
            this.secondCdkTextareaSyncSize.resizeToFitContent(true, height);

            if (
                this.secondCdkTextareaSyncSize._cachedHeight > 0 &&
                this.secondCdkTextareaSyncSize._cachedHeight > height
            ) {
                const newHeight = this.secondCdkTextareaSyncSize._cachedHeight;
                textarea.style.height = `${newHeight}px`;
                this._cachedHeight = newHeight;
            }
        }

        if (heightChanged) {
            this._ngZone.runOutsideAngular(() => {
                if (typeof requestAnimationFrame !== 'undefined') {
                    requestAnimationFrame(() => {
                        this.scrollToCaretPosition(textarea);
                    });
                } else {
                    setTimeout(() => {
                        this.scrollToCaretPosition(textarea);
                    });
                }
            });
        }

        this._previousValue = value;
        this._previousMinRows = this.minRows;
    }

    reset(): void {
        if (this._initialHeight == null) {
            return;
        }
        this._textareaElement.style.height = this._initialHeight;
    }

    private getMinRowsAutoHeight(): number {
        if (this._platform.isBrowser) {
            return window.innerHeight > 960 ? 10 : window.innerHeight > 600 ? 8 : window.innerHeight > 400 ? 6 : 4;
        } else {
            return 8;
        }
    }

    private scrollToCaretPosition(textarea: HTMLTextAreaElement): void {
        const { selectionStart, selectionEnd } = textarea;
        const document = this.getDocument();

        if (!this._destroyed.isStopped && document.activeElement === textarea) {
            textarea.setSelectionRange(selectionStart, selectionEnd);
        }
    }

    // To fix not working when setting height values in css class
    private cacheTextareaLineHeight(): void {
        if (this._cachedLineHeight) {
            return;
        }

        const textareaClone = this._textareaElement.cloneNode(false) as HTMLTextAreaElement;
        textareaClone.rows = 1;

        textareaClone.style.position = 'absolute';
        textareaClone.style.visibility = 'hidden';
        textareaClone.style.border = 'none';
        textareaClone.style.padding = '0';
        textareaClone.style.height = '';
        textareaClone.style.minHeight = '';
        textareaClone.style.maxHeight = '';

        textareaClone.style.overflow = 'hidden';

        if (this._textareaElement.parentNode) {
            this._textareaElement.parentNode.appendChild(textareaClone);
            textareaClone.classList.add(this._lineHeightMeasuringClass);
        }

        this._cachedLineHeight = textareaClone.clientHeight;
        textareaClone.classList.remove(this._lineHeightMeasuringClass);

        if (this._textareaElement.parentNode) {
            this._textareaElement.parentNode.removeChild(textareaClone);
        }

        this.setMinHeight();
        this.setMaxHeight();
    }

    private cacheTextareaLineHeightNonBrowser(): void {
        if (this._cachedLineHeight) {
            return;
        }

        // To use input property
        this._cachedLineHeight = 22;

        this.setMinHeight();
        this.setMaxHeight();
    }

    private setMinHeight(): void {
        const minHeight = this.minRows && this._cachedLineHeight ? `${this.minRows * this._cachedLineHeight}px` : null;

        if (minHeight) {
            this._textareaElement.style.minHeight = minHeight;
        }
    }

    private setMaxHeight(): void {
        const maxHeight = this.maxRows && this._cachedLineHeight ? `${this.maxRows * this._cachedLineHeight}px` : null;

        if (maxHeight) {
            this._textareaElement.style.maxHeight = maxHeight;
        }
    }

    private getWindow(): Window {
        const doc = this.getDocument();

        return doc.defaultView || window;
    }

    private getDocument(): Document {
        return this._document || document;
    }
}
