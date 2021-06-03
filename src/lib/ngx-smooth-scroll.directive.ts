import { Directive, Input, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SmoothScrollService } from './ngx-smooth-scroll.service';

@Directive({
  selector: '[SmoothScroll]'
})
export class SmoothScrollDirective {
  @Input() public container: HTMLElement;
  @Input() public scrollTo: string;
  @Input() public duration: number;
  @Input() public offset: number;
  @Input() public easing: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart' | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint';
  @Input() public showHash: boolean;

  constructor(
    private el: ElementRef,
    private smooth: SmoothScrollService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  @HostListener('click', ['$event'])
  onClick(event: PointerEvent) {
    if (isPlatformBrowser(this.platformId)) {
      let container: HTMLElement = this.container || this.document.documentElement
      let eid = this.el.nativeElement.hash;
      if (eid) {
        if (this.showHash) {
          const href = this.el.nativeElement.href
          const dest = new URL(href)
          const loc = window.location
          if (dest.pathname == loc.pathname) {
            event.preventDefault()

            // Change URL hash without page jump
            history.pushState(null, null, href);
          }
        }
        eid = eid.replace('#', '');
      }

      let target = this.document.getElementById(eid) || this.document.getElementById(this.scrollTo);
      if (target) {
        this.smooth.smoothScroll(this.smooth.findHeight(target, container), { duration: this.duration, easing: this.easing, offset: this.offset }, container);
      }
    }
  }
}
