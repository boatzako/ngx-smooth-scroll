import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { interval, Subscription } from 'rxjs';

type easingFn = (t: number) => number

/**
 * EasingFunctions - from https://gist.github.com/gre/1650294
 */
const EasingFunctions: { [key: string]: easingFn } = {
  // no easing, no acceleration
  linear: t => t,
  // accelerating from zero velocity
  easeInQuad: t => t * t,
  // decelerating to zero velocity
  easeOutQuad: t => t * (2 - t),
  // acceleration until halfway, then deceleration
  easeInOutQuad: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  // accelerating from zero velocity 
  easeInCubic: t => t * t * t,
  // decelerating to zero velocity 
  easeOutCubic: t => (--t) * t * t + 1,
  // acceleration until halfway, then deceleration 
  easeInOutCubic: t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  // accelerating from zero velocity 
  easeInQuart: t => t * t * t * t,
  // decelerating to zero velocity 
  easeOutQuart: t => 1 - (--t) * t * t * t,
  // acceleration until halfway, then deceleration
  easeInOutQuart: t => t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  // accelerating from zero velocity
  easeInQuint: t => t * t * t * t * t,
  // decelerating to zero velocity
  easeOutQuint: t => 1 + (--t) * t * t * t * t,
  // acceleration until halfway, then deceleration 
  easeInOutQuint: t => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
}

export interface ISmoothScrollOption {
  duration?: number;
  easing?: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart' | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint';
  offset?: number;
}

export class SmoothScrollOption {
  public duration: number;
  public easing: easingFn;
  public offset: number;

  constructor(option: ISmoothScrollOption) {
    this.duration = option.duration || 800;
    this.offset = option.offset || 0;
    this.easing = EasingFunctions[option.easing] || EasingFunctions.easeInOutQuad;
  }
}

interface Cache {
  el: HTMLElement
  sub: Subscription
}

@Injectable({
  providedIn: 'root'
})
export class SmoothScrollService {

  private _caches: Cache[] = []

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  public smoothScroll(height: number, opt: ISmoothScrollOption = {}, el: HTMLElement = this.document.documentElement) {
    if (isPlatformBrowser(this.platformId)) {
      let cache = this._findCache(el)
      if (!cache) {
        cache = { el, sub: null }
        this._caches.push(cache)
      }

      if (cache.sub) {
        cache.sub.unsubscribe()
      }

      const option = new SmoothScrollOption(opt);
      const duration = option.duration;
      const clientTop = el.clientTop || 0
      let begin = window.pageYOffset - clientTop;
      if (!el.isSameNode(this.document.documentElement)) {
        begin = el.scrollTop - clientTop
      }
      const t = 10;
      const tick = 1 / (duration / t);
      height += option.offset;
      const distance = height - begin;
      if (distance === 0) return;
      let time = 0;
      let y: number, current: number;
      cache.sub = interval(t).subscribe(() => {
        y = option.easing(time);
        current = y * distance + begin;
        if (current >= height && distance > 0) {
          current = height;
          cache.sub.unsubscribe()
        }
        if (current < height + tick && distance < 0) {
          current = height;
          cache.sub.unsubscribe()
        }
        if (current < 0 && distance < 0) {
          current = 0;
          cache.sub.unsubscribe()
        }
        el.scrollTo(0, current);
        time += tick;
      })
    }
  }

  public smoothScrollToTop(opt: ISmoothScrollOption = {}, el: HTMLElement = this.document.documentElement) {
    this.smoothScroll(0, opt, el);
  }

  public smoothScrollToAnchor(opt: ISmoothScrollOption = {}, el: HTMLElement = this.document.documentElement) {
    if (isPlatformBrowser(this.platformId)) {
      let eid = window.location.hash;
      if (eid) {
        eid = eid.replace('#', '');
      }
      let target = this.document.getElementById(eid);
      if (target) {
        this.smoothScroll(target.offsetTop - el.offsetTop, opt, el);
      }
    }
  }

  private _findCache(el: HTMLElement): Cache {
    return this._caches.find(h => h.el.isSameNode(el))
  }
}