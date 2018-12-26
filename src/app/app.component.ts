import { Component, OnInit, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';

import { PopupComponent } from './popup/popup.component';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';
import { AlertComponent } from './alert/alert.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterContentChecked {

  public eventName = '(No title)';
  public eventStartTime: TimeObj;
  public eventEndTime: TimeObj;

  public hours: Array<any> = [];
  public mins: Array<any> = [];
  public time: Array<any> = [];
  public hourly: Array<any> = [];

  public eventData: PopupData;

  public localStorageVariable = 'data';

  public checkedEvents: Array<any> = [];

  public eventsArray: Array<any> = [];

  /*
   * Variables related to DOM
   */

  public eventHeight: number;

  public eventTop: number;

  public eventLeft = 0;

  public eventWidth = 100;

  public overlayTop = 50;

  public isOverlaping = false;

  public default1HourRowLength = 49;

  public default5MinRowLength = this.default1HourRowLength / 12;

  constructor(public dailog: MatDialog, private _cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.generateHoursAndMins();
    const localData = localStorage.getItem(this.localStorageVariable);
    if (localData === 'undefined' || localData === null) {
      const dataToStore = [];
      localStorage.setItem(this.localStorageVariable, JSON.stringify(dataToStore));
    } else {
      this.eventsArray = JSON.parse(localData);
    }
  }

  /**
   * @function openPopup is used to open the popup to create a event.
   */
  openPopup(): void {
    const openPopup = this.dailog.open(PopupComponent, {
      width: '500px',
      height: '300px',
      data: {
        eventName: this.eventName,
        eventStartTime: this.eventStartTime,
        eventEndTime: this.eventEndTime,
        hours: this.hours,
        mins: this.mins,
        time: this.time,
      }
    });

    openPopup.afterClosed().subscribe(eventData => {
      if (eventData === undefined) {
        return null;
      }
      this.eventData = eventData;
      this.calculateNewEventLength(this.eventData);
    });
  }

  /**
   * @function showAlert used to give a alert to the user when already added event is added again.
   */
  showAlert(): void {
    this.dailog.open(AlertComponent);
  }

  /**
   * @function calculateNewEventLength is a fire & forget function.
   * This function is used to add required data to current event and store it in local storage.
   * @param data is the current event basic data.
   */
  calculateNewEventLength(data): void {
    if (this.isAlreadyExist(data)) {
      this.showAlert();
      return null;
    }
    const dataToStore = this.eventsArray;
    const startTime = data.eventStartTime;
    const endTime = data.eventEndTime;
    const indexOfStartTime = this.time.indexOf(startTime);
    const indexofEndTime = this.time.indexOf(endTime);
    const length = indexofEndTime - indexOfStartTime;
    this.eventData.eventLength = length;
    this.eventData.startTimeIndex = indexOfStartTime;
    this.eventData.endTimeIndex = indexofEndTime;
    this.eventData.isOverlapEvent = this.checkIfOverlaping(data);
    this.eventData.eventLeft = 0;
    this.eventData.eventWidth = 100;
    if (this.eventData.isOverlapEvent) {
      this.eventData.eventLeft = this.setEventLeft(data);
      this.eventData.eventWidth = this.setEventWidth(data);
    }
    dataToStore.push(this.eventData);
    localStorage.setItem(this.localStorageVariable, JSON.stringify(dataToStore));
  }

  /**
   * This function is used to set the left, a style property of the event.
   * @param event is the current event.
   */
  setEventLeft(event): number {
    const data = localStorage.getItem(this.localStorageVariable);
    const localData = JSON.parse(data);
    const parentEvent = localData.find(obj => {
      return this._oneInAnotherCondition1(event, obj) ||
      this._oneInAnotherCondition2(event, obj) ||
      this._partialOverlapCondition1(event, obj) ||
      this._partialOverlapCondition2(event, obj);
    });
    return parentEvent.eventLeft + 15;
  }

  /**
   * This function is used to set the width, a style property of the event.
   * @param event is the current event.
   */
  setEventWidth(event): number {
    const data = localStorage.getItem(this.localStorageVariable);
    const localData = JSON.parse(data);
    const parentEvent = localData.find(obj => {
      return this._oneInAnotherCondition1(event, obj) ||
      this._oneInAnotherCondition2(event, obj) ||
      this._partialOverlapCondition1(event, obj) ||
      this._partialOverlapCondition2(event, obj);
    });
    return parentEvent.eventWidth - 15;
  }

  /**
   * This function is used to delete the events that are added.
   * @param event current event data.
   */
  deleteEvent(event): void {
    const data = localStorage.getItem(this.localStorageVariable);
    const localData = JSON.parse(data);
    const updatedArray = localData.filter(obj => {
      return !this._isExistCondition(event, obj);
    });
    localStorage.setItem(this.localStorageVariable, JSON.stringify(updatedArray));
    this.eventsArray = updatedArray;
  }

  /**
   * This function will generate the basic static data that is required.
   */
  generateHoursAndMins(): void {
    for (let i = 0; i < 24; i++) {
      i < 10 ? this.hours.push('0' + i) : this.hours.push(i.toString());
    }
    for (let i = 0; i <= 55; i++) {
      if (i % 5 === 0) {
        i < 10 ? this.mins.push('0' + i) : this.mins.push(i.toString());
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

  ngAfterContentChecked() {
    this._cdRef.detectChanges();
  }

  /**
   * This is the MAIN function of this component.
   * Event is created in the view only when this function @returns true.
   * @param index is the index of current time in global variable time.
   * @param currentEvent this is the event that to be shown.
   */
  checkAndShowEvent(index, currentEvent) {
    if (currentEvent.startTimeIndex === index) {
      if (currentEvent.isOverlapEvent) {
        this.eventLeft = currentEvent.eventLeft;
        this.eventWidth = currentEvent.eventWidth;
      } else {
        this.eventLeft = 0;
        this.eventWidth = 100;
      }
      const eventLength = currentEvent.eventLength;
      this.eventHeight = eventLength * this.default5MinRowLength;
      this.eventTop = this.overlayTop + (this.default5MinRowLength * index);
      const checkIfAlreadyAdded = this.isAlreadyExist(currentEvent);
      if (!checkIfAlreadyAdded) {
        this.checkedEvents.push(currentEvent);
      }
      return true;
    }
    this.eventHeight = this.default5MinRowLength;
    return false;
  }

  /**
   * This function checks if an event is overlaping.
   * @param event ic the current event data
   */
  checkIfOverlaping(event) {
    return this.checkedEvents.some(obj => {
      if (this.isOneInAnother(event) || this.isSomePartOverlaping(event)) {
        this.isOverlaping = true;
        return true;
      }
      this.isOverlaping = false;
      return false;
    });
  }

  /**
   * This is a anonymous function that @returns a condition.
   */
  private _oneInAnotherCondition1 = (event, checkingObj) =>
    event.startTimeIndex >= checkingObj.startTimeIndex && event.endTimeIndex < checkingObj.endTimeIndex

  /**
   * This is a anonymous function that @returns a condition.
   */
  private _oneInAnotherCondition2 = (event, checkingObj) =>
    event.endTimeIndex <= checkingObj.endTimeIndex && event.startTimeIndex > checkingObj.startTimeIndex

  /**
   * This function checks if an event is present in another event.
   * @param event is the current event data
   */
  isOneInAnother(event) {
    return this.checkedEvents.some(obj => {
      if (this._oneInAnotherCondition1(event, obj)) {
        return true;
      }
      if (this._oneInAnotherCondition2(event, obj)) {
        return true;
      }
      return false;
    });
  }

  /**
   * This is a anonymous function that @returns a condition.
   */
  private _partialOverlapCondition1 = (event, checkingObj) =>
    event.startTimeIndex >= checkingObj.startTimeIndex && event.startTimeIndex < checkingObj.endTimeIndex &&
    event.endTimeIndex > checkingObj.endTimeIndex

  /**
   * This is a anonymous function that @returns a condition.
   */
  private _partialOverlapCondition2 = (event, checkingObj) =>
    event.endTimeIndex <= checkingObj.endTimeIndex && event.endTimeIndex > checkingObj.startTimeIndex && event.startTimeIndex < checkingObj.startTimeIndex

  /**
   * This function checks if an events is partialy overlaping on another event.
   * @param event is the current event data.
   */
  isSomePartOverlaping(event) {
    return this.checkedEvents.some(obj => {
      if (this._partialOverlapCondition1(event, obj)) {
        return true;
      }
      if (this._partialOverlapCondition2(event, obj)) {
        return true;
      }
      return false;
    });
  }

  /**
   * This is a anonymous function that @returns a condition.
   */
  private _isExistCondition = (event, checkingObj) =>
    event.startTimeIndex === checkingObj.startTimeIndex && event.endTimeIndex === checkingObj.endTimeIndex

  /**
   * This function checks if provided event is already created.
   * @param event is the current event data.
   */
  isAlreadyExist(event) {
    const eventStartIndex = this.time.indexOf(event.eventStartTime);
    const eventEndIndex = this.time.indexOf(event.eventEndTime);
    return this.checkedEvents.some(obj => {
      return eventStartIndex === obj.startTimeIndex && eventEndIndex === obj.endTimeIndex;
    });
  }

  /**
   * Unused @function
   * @function generateFilteredArray is created to filter the current events array from the already added events.
   */
  generateFilteredArray(eventsArray): Array<any> {
    return eventsArray.reduce((newArray, event) => {
      if (this.checkedEvents.length > 0) {
        const filter = this.checkedEvents.some(obj => {
          return obj.startTimeIndex === event.startTimeIndex && obj.endTimeIndex === event.endTimeIndex;
        });
        if (!filter) {
          newArray.push(event);
          return newArray;
        }
        return newArray;
      }
      newArray.push(event);
      return newArray;
    }, []);
  }

  /**
   * Unused @function
   * @function findNextHourIndex is created to find the index of next hour to current events start index.
   */
  findNextHourIndex(index) {
    const allNextHours = this.hourly.filter(hour => {
      const hourIndex = this.time.indexOf(hour);
      return hourIndex > index;
    });
    const allNextHourIndexes = allNextHours.map(hour => {
      return this.time.indexOf(hour);
    });
    const nextHourIndex = Math.min(...allNextHourIndexes);
    return nextHourIndex;
  }

  /**
   * Unused @function
   * @function findLastHourINdex is created to find the index of last passed hour ro current events start time index.
   */
  findLastHourINdex(index) {
    const nextHourIndex = this.findNextHourIndex(index);
    return nextHourIndex - 1;
  }

  /**
   * Unused @function
   * @function findIsHourStart is created to check if current event index is at the start of an hour.
   */
  findIsHourStart(currentTime): boolean  {
    let isHourStart: boolean;
    const filterHourly = this.hourly.filter(hour => hour === currentTime);
    if (filterHourly.length > 0) {
      isHourStart = true;
    } else {
      isHourStart = false;
    }
    return isHourStart;
  }

}

export interface PopupData {
  eventName: string;
  eventStartTime: TimeObj;
  eventEndTime: TimeObj;
  startTimeIndex: number;
  endTimeIndex: number;
  eventLength: number;
  isOverlapEvent: boolean;
  eventLeft: number;
  eventWidth: number;
  hours: Array<any>;
  mins: Array<any>;
  time: Array<any>;
}

export interface TimeObj {
  hours: any;
  mins: any;
}
