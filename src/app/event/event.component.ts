import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CurrencyIndex } from '@angular/common/src/i18n/locale_data';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit, OnChanges {

  @Input() eventData;

  @Input() currentIndex;

  @Input() rowValue;

  constructor() { }

  ngOnInit() {
    console.log('OnInit', this.eventData);
    console.log('OnInit', this.currentIndex);
    console.log('OnInit', this.rowValue);
  }

  ngOnChanges() {
    console.log('OnChanges', this.eventData);
    console.log('OnChanges', this.currentIndex);
    console.log('OnChanges', this.rowValue);
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
    // const currentRowIndex = this.eventData.time.indexOf(this.rowValue);
    // if (currentRowIndex >= this.eventData.startTimeIndex && currentRowIndex <= this.eventData.endTimeIndex) {
    //   return true;
    // }
    return false;
  }

  cancelEvent() {
    this.checkIfEvent(true);
  }

}
