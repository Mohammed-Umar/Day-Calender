/*
Add a logic in this component to compare the currentIndex with colspan.
Add 12 td's in eventComponent
Save the events data somewhere
when events overlap devide one td into to td's one small and one big and even merge td's
*/
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { PopupComponent } from './popup/popup.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  eventName: string;
  eventStartTime: TimeObj;
  eventEndTime: TimeObj;

  newEventLength: any;

  hours: Array<any> = [];
  mins: Array<any> = [];
  time: Array<any> = [];
  hourly: Array<any> = [];

  colspan = 1;

  eventData: PopupData;

  localStorageData: Array<any> = [];

  localStorageVariable = 'data';

  timeData = {
    hours: this.hours,
    mins: this.mins,
    hourly: this.hourly,
    time: this.time
  };

  constructor(public popup: MatDialog) {}

  ngOnInit() {
    localStorage.setItem(this.localStorageVariable, JSON.stringify(this.localStorageData));
    this.generateHoursAndMins();
    console.log(this.hours);
    console.log(this.mins);
    console.log(this.hourly);
    // const localData = localStorage.getItem(this.localStorageVariable);
    // const data = JSON.parse(localData);
    // console.log(data);

    // if (data.length === 0 ) {
    //   console.log(data.length);
    // }
  }

  openPopup(): void {
    const openPopup = this.popup.open(PopupComponent, {
      width: '500px',
      data: {
        eventName: this.eventName,
        eventStartTime: this.eventStartTime,
        eventEndTime: this.eventEndTime,
        hours: this.hours,
        mins: this.mins,
        time: this.time,
      }
    });

    // this function should exicute only on new event & make all fields of event form mandatory.
    openPopup.afterClosed().subscribe(eventData => {
      console.log('One event is added');
      this.eventData = eventData;
      console.log('Start Time', this.eventData.eventStartTime);
      console.log('End Time', this.eventData.eventEndTime);
      this.calculateNewEventLength(this.eventData);
    });
  }

  calculateNewEventLength(data) {
    const startTime = data.eventStartTime;
    const endTime = data.eventEndTime;
    const indexOfStartTime = this.time.indexOf(startTime);
    const indexofEndTime = this.time.indexOf(endTime);
    const length = indexofEndTime - indexOfStartTime;
    this.eventData.eventLength = length;
    this.eventData.startTimeIndex = indexOfStartTime;
    this.eventData.endTimeIndex = indexofEndTime;
    console.log('length of the event is:::', length);
    this.localStorageData.push(this.eventData);
    localStorage.setItem(this.localStorageVariable, JSON.stringify(this.localStorageData));
    this.time = this.time.map((e) => e);
    // this.handleRowspan(this.eventData);
  }

  handleRowspan(data) {
    const eventStartIndex = data.startTimeIndex;
    const eventEndIndex = data.endTimeIndex;
    const length = this.time.length;
    const x = eventStartIndex / 12;
  }

  generateHoursAndMins() {
    for (let i = 0; i < 24; i++) {
      i < 10 ? this.hours.push('0' + i) : this.hours.push(i.toString());
      // this.hours[i] = i;
    }
    for (let i = 0; i <= 55; i++) {
      if (i % 5 === 0) {
        i < 10 ? this.mins.push('0' + i) : this.mins.push(i.toString());
        // this.mins.push(i);
      }
    }
    for (let i = 0; i < this.hours.length; i++) {
      for (let j = 0; j < this.mins.length; j++) {
        this.time.push(this.hours[i] + ':' + this.mins[j]);
      }
    }
    for (let i = 0; i < this.time.length; i++) {
      if (i % 12 === 0) {
        this.hourly.push(this.time[i]);
      }
    }
  }

  provideRowspan(currentValue) {
    if (this.eventData === undefined) {
      return 1;
    }
    const currentRowIndex = this.eventData.time.indexOf(currentValue);
    const nextRowIndex = currentRowIndex + 12;
    const eventStartIndex = this.eventData.startTimeIndex;
    const eventEndIndex = this.eventData.endTimeIndex;
    // starttime is between the currentIndex and NexINdex and endTime is greater than nextIndex then rowspan = 2 or else 1
    if (eventStartIndex >= currentRowIndex && eventEndIndex > nextRowIndex) {
      return 2;
    }
    // if (currentRowIndex >= eventStartIndex && currentRowIndex <= eventEndIndex) {
      // start at 18
      // end at 30
      // current is 24
      // then rowspan should be 2
    // }
    return 1;

  }

  divide(currentRowTime) {
    if (this.colspan > 1) {
      this.colspan--;
      return false;
    }
    const currentRowIndex = this.time.indexOf(currentRowTime);
    const nextRowIndex = currentRowIndex + 12;
    const localData = localStorage.getItem(this.localStorageVariable);
    const data = JSON.parse(localData);
    if (data.length > 0 ) {
      data.map(event => {
        const eventStartIndex = event.startTimeIndex;
        const eventEndIndex = event.endTimeIndex;
        const eventLength = event.eventLength;

        if (currentRowIndex > eventEndIndex) {
          this.colspan = 1;
          return true;
        }

        if ( currentRowIndex >= eventStartIndex && currentRowIndex < eventEndIndex) {
          const x = this.hourly.filter(elm => {
            const i = this.time.indexOf(elm);
            return i < eventEndIndex && i > eventStartIndex;
          });
          const spanLength = x.length;
          console.log('x..................', x);
          this.colspan = spanLength === 0 ? 1 : spanLength + 1;
          console.log('colspan........', this.colspan);
          return true;
        }
      });
      return true;
    }
    // if (this.eventData !== undefined) {
    //   const eventStartIndex = this.eventData.startTimeIndex;
    //   const eventEndIndex = this.eventData.endTimeIndex;
    //   const eventLength = this.eventData.eventLength;
    //   // const nextRowIndex = currentRowIndex + 12;

    //   if (currentRowIndex > eventEndIndex) {
    //     return true;
    //   }

    //   if ( currentRowIndex >= eventStartIndex && currentRowIndex < eventEndIndex) {
    //     const x = this.hourly.filter(elm => {
    //       const i = this.time.indexOf(elm);
    //       return i < eventEndIndex && i > eventStartIndex;
    //     });
    //     const spanLength = x.length;
    //     console.log('x..................', x);
    //     this.colspan = spanLength === 0 ? 1 : spanLength + 1;
    //     console.log('colspan........', this.colspan);
    //     return true;
    //   }
    //   // if ( index % 12 === 0 ) {

    //     // const i = 0;

    //     // while (i < eventEndIndex) {

    //     // }


    //     // if (eventStartIndex >= currentRowIndex && eventEndIndex > nextRowIndex) {

    //     // }
    //   // }
    // }
    this.colspan = 1;
    return true;
    // return index % 12 === 0 ? true : false;
  }

  showHour(currentRowTime) {
    return true;
  }
  // set rowspan in this function
  drawLine(index) {
    if (this.eventData !== undefined) {
      const eventStartIndex = this.eventData.startTimeIndex;
      const eventEndIndex = this.eventData.endTimeIndex;
      // const currentRowIndex = index / 12;
      if ( index % 12 === 0 ) {
        const nextRowIndex = index + 12;
        if (eventStartIndex >= index && eventEndIndex > nextRowIndex) {
          this.colspan = 2;
          console.log('colspan........', this.colspan);
        }
      }
    }
    return index % 12 === 0 ? true : false;
  }
}

export interface PopupData {
  eventName: string;
  eventStartTime: TimeObj;
  eventEndTime: TimeObj;
  startTimeIndex: number;
  endTimeIndex: number;
  hours: Array<any>;
  mins: Array<any>;
  time: Array<any>;
  eventLength: number;
}

export interface TimeObj {
  hours: any;
  mins: any;
}
