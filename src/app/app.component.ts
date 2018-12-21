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

  eventData: PopupData;

  constructor(public popup: MatDialog) {}

  ngOnInit() {
    this.generateHoursAndMins();
    console.log(this.hours);
    console.log(this.mins);
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
  }

  drawLine(index) {
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
