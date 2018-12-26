import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CurrencyIndex } from '@angular/common/src/i18n/locale_data';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit, OnChanges {

  @Input() eventData;

  @Input() timeData;

  @Input() rowValue;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
  }

  checkIfEvent(returnValue?: boolean) {
    if (returnValue) {
      return false;
    } else if (this.eventData !== undefined) {
      const currentRowIndex = this.eventData.time.indexOf(this.rowValue);
      if (currentRowIndex >= this.eventData.startTimeIndex && currentRowIndex <= this.eventData.endTimeIndex) {
        return true;
      }
    }
    return false;
  }

  cancelEvent() {
    this.checkIfEvent(true);
  }

}
