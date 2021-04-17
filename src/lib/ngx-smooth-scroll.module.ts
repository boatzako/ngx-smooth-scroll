import { NgModule } from '@angular/core';
import { SmoothScrollService } from './ngx-smooth-scroll.service';
import { SmoothScrollDirective } from './ngx-smooth-scroll.directive';

@NgModule({
  declarations: [SmoothScrollDirective],
  providers: [SmoothScrollService],
  exports: [SmoothScrollDirective]
})
export class NgxSmoothScrollModule { }
