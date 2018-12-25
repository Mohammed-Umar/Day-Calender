/*
Add a logic in this component to compare the currentIndex with rowSpan.
Add 12 td's in eventComponent
Save the events data somewhere
when events overlap devide one td into to td's one small and one big and even merge td's
*/
import { Component, OnInit, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';

import { PopupComponent } from './popup/popup.component';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterContentChecked {
  eventName = '(No title)';
  eventStartTime: TimeObj;
  eventEndTime: TimeObj;

  newEventLength: any;

  hours: Array<any> = [];
  mins: Array<any> = [];
  time: Array<any> = [];
  hourly: Array<any> = [];

  eventRowSpan = 1;

  timeRowSpan = 1;

  eventData: PopupData;

  eventsArray: Array<any> = [];

  localStorageVariable = 'data';

  toCheckEvents: Array<any> = [];

  checkedEvents: Array<any> = [];

  eventsArrayNew: Array<any> = [];

  /*
   * Variables related to DOM
   */

  eventHeight: number;

  eventTop: number;

  eventLeft = 0;

  eventWidth = 100;

  overlayTop = 50;

  isOverlaping = false;

  // Temp Variables

  lastEventIndex;

  xTime;

  default1HourRowLength = 49;

  default5MinRowLength = this.default1HourRowLength / 12;

  x = 0;

  // haveEvents = false;

  timeData = {
    hours: this.hours,
    mins: this.mins,
    hourly: this.hourly,
    time: this.time
  };

  constructor(public popup: MatDialog, private _cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.generateHoursAndMins();
    const localData = localStorage.getItem(this.localStorageVariable);
    if (localData === 'undefined' || localData === null) {
      const dataToStore = [];
      localStorage.setItem(this.localStorageVariable, JSON.stringify(dataToStore));
    } else {
      this.eventsArrayNew = JSON.parse(localData);
    }
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
    // if (this.isAlreadyExist(data)) {

    // }
    const dataToStore = this.eventsArrayNew;
    const startTime = data.eventStartTime;
    const endTime = data.eventEndTime;
    const indexOfStartTime = this.time.indexOf(startTime);
    const indexofEndTime = this.time.indexOf(endTime);
    const length = indexofEndTime - indexOfStartTime;
    this.eventData.eventLength = length;
    this.eventData.startTimeIndex = indexOfStartTime;
    this.eventData.endTimeIndex = indexofEndTime;
    this.eventData.isOverlapEvent = this.checkIfOverlaping(data);
    this.eventData.eventLeft = this.eventLeft;
    this.eventData.eventWidth = this.eventWidth;
    console.log('length of the event is:::', length);
    dataToStore.push(this.eventData);
    localStorage.setItem(this.localStorageVariable, JSON.stringify(dataToStore));
    // this.time = this.time.map((e) => e);
  }

  haveEvents() {
    const data = localStorage.getItem(this.localStorageVariable);
    const localData = JSON.parse(data);
    return localData.length > 0 ? true : false;
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

  ngAfterContentChecked() {
    this._cdRef.detectChanges();
  }

  generateFilteredArray(eventsArray) {
    return eventsArray.reduce( (newArray, event) => {
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

  checkAndShowEvent(index, currentEvent) {
    if (currentEvent.startTimeIndex === index) {
      if (currentEvent.isOverlapEvent) {
        this.eventLeft = this.eventLeft + 15;
        this.eventWidth = this.eventWidth - 15;
      } else {
        this.eventLeft = 0;
        this.eventWidth = 100;
      }
      const eventLength = currentEvent.eventLength;
      this.eventHeight = eventLength * this.default5MinRowLength;
      this.eventTop = this.overlayTop + (this.default5MinRowLength * index);
      console.log('eventLength & event', eventLength, event);
      console.log('function ran', this.x++);
      this.checkedEvents.push(currentEvent);
      this.lastEventIndex = index;
      return true;
    }
    this.eventHeight = this.default5MinRowLength;
    return false;
  }
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

  isOneInAnother(event) {
    return this.checkedEvents.some(obj => {
      if (event.startTimeIndex >= obj.startTimeIndex && event.endTimeIndex < obj.endTimeIndex) {
        return true;
      }
      if (event.endTimeIndex <= obj.endTimeIndex && event.startTimeIndex > obj.startTimeIndex) {
        return true;
      }
      return false;
    });
  }

  isSomePartOverlaping(event) {
    return this.checkedEvents.some(obj => {
      if (event.startTimeIndex >= obj.startTimeIndex && event.startTimeIndex < obj.endTimeIndex && event.endTimeIndex > obj.endTimeIndex) {
        return true;
      }
      if (event.endTimeIndex <= obj.endTimeIndex && event.endTimeIndex > obj.startTimeIndex && event.startTimeIndex < obj.startTimeIndex) {
        return true;
      }
      return false;
    });
  }

  isAlreadyExist(event) {
    return this.checkedEvents.some(obj => {
      return event.startTimeIndex === obj.startTimeIndex && event.endTimeIndex === obj.endTimeIndex;
    });
  }

  /*

           this.isOverlaping = this.checkedEvents.some(checkedEvent => {
          if (currentEvent.startTimeIndex >= checkedEvent.startTimeIndex &&
            currentEvent.startTimeIndex < checkedEvent.endTimeIndex) {
              if (currentEvent.endTimeIndex !== checkedEvent.endTimeIndex &&
                currentEvent.startTimeIndex !== checkedEvent.startTimeIndex) {
                  return true;
                } else {
                  return false;
                }
            }
            // return false;
        });

  */

  isCheckedEvent(index) {
    const isEventChecked = this.checkedEvents.some(obj => {
      return obj.startTimeIndex === index;
    });
    return isEventChecked;
  }

  findNextHourIndex(index) {
    const allNextHours = this.hourly.filter( hour => {
      const hourIndex = this.time.indexOf(hour);
      return hourIndex > index;
    });
    const allNextHourIndexes = allNextHours.map(hour => {
      return this.time.indexOf(hour);
    });
    const nextHourIndex = Math.min(...allNextHourIndexes);
    return nextHourIndex;
  }

  findLastHourINdex(index) {
    const nextHourIndex = this.findNextHourIndex(index);
    return nextHourIndex - 1;
  }

  findIsHourStart(currentTime) {
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
  hours: Array<any>;
  mins: Array<any>;
  time: Array<any>;
  eventLength: number;
  isOverlapEvent: boolean;
  eventLeft: number;
  eventWidth: number;
}

export interface TimeObj {
  hours: any;
  mins: any;
}




  // showHour(currentRowTime, timeIndex) {
  //   // if (this.timeRowSpan > 1) {
  //   //   this.timeRowSpan --;
  //   //   return false;
  //   // }
  //   const x = this.hourly.map(hour => {
  //     const hourIndex = this.time.indexOf(hour);
  //     if (timeIndex === hourIndex) {
  //       this.timeRowSpan = 12;
  //       return 12;
  //     }
  //     // return true;
  //   });
  //   return x;
  // }


    // // set eventRowSpan in this function
    // drawLine(index) {
    //   if (this.eventData !== undefined) {
    //     const eventStartIndex = this.eventData.startTimeIndex;
    //     const eventEndIndex = this.eventData.endTimeIndex;
    //     // const currentRowIndex = index / 12;
    //     if ( index % 12 === 0 ) {
    //       const nextRowIndex = index + 12;
    //       if (eventStartIndex >= index && eventEndIndex > nextRowIndex) {
    //         this.eventRowSpan = 2;
    //         console.log('eventRowSpan........', this.eventRowSpan);
    //       }
    //     }
    //   }
    //   return index % 12 === 0 ? true : false;
    // }

    // divide(currentRowTime, rowIndex) {
    //   if (this.eventRowSpan > 1) {
    //     this.eventRowSpan--;
    //     return false;
    //   }
    //   // const currentRowIndex = this.time.indexOf(currentRowTime);
    //   // const nextRowIndex = currentRowIndex + 12;
    //   const localData = localStorage.getItem(this.localStorageVariable);
    //   const data = JSON.parse(localData);
    //   let dataLength = data.length;
    //   if (dataLength > 0 ) {
    //     data.map(event => {
    //       const eventStartIndex = event.startTimeIndex;
    //       const eventEndIndex = event.endTimeIndex;
    //       const eventLength = event.eventLength;
    //       const allNextHours = this.hourly.filter( hour => {
    //         const hourIndex = this.time.indexOf(hour);
    //         return hourIndex > rowIndex;
    //       });
    //       const nextHour = Math.min(...allNextHours);
    //       const nextHourIndex = this.time.indexOf(nextHour);
    //       const filterHourly = this.hourly.filter(hour => hour === currentRowTime);
    //       let isHourStart: boolean;
    //       if (filterHourly.length > 0) {
    //         isHourStart = true;
    //       } else {
    //         isHourStart = false;
    //       }
    //       if (rowIndex > eventStartIndex && rowIndex < eventEndIndex) {
    //         // dataLength --;
    //         return true;
    //       }
    //       if (nextHourIndex < eventStartIndex) {
    //         this.hourlySpan(rowIndex);
    //         return true;
    //       }
    //       if (rowIndex < eventStartIndex && eventStartIndex < nextHourIndex) {
    //         this.eventRowSpan = eventStartIndex - rowIndex;
    //         // dataLength --;
    //         return true;
    //       }
    //       // if (rowIndex === eventStartIndex) {
    //       //   this.eventRowSpan = eventLength + 1;
    //       //   dataLength --;
    //       //   return true;
    //       // }
    //       if (rowIndex === eventEndIndex && !isHourStart) {
    //         this.eventRowSpan = nextHourIndex - rowIndex;
    //         // dataLength --;
    //         return true;
    //       }
    //       // if (rowIndex > eventEndIndex) {
    //       //   this.eventRowSpan = 1;
    //       //   return true;
    //       // }

    //       // if ( rowIndex >= eventStartIndex && rowIndex < eventEndIndex) {
    //       //   const x = this.hourly.filter(elm => {
    //       //     const i = this.time.indexOf(elm);
    //       //     return i < eventEndIndex && i > eventStartIndex;
    //       //   });
    //       //   const spanLength = x.length;
    //       //   console.log('x..................', x);
    //       //   this.eventRowSpan = spanLength === 0 ? 1 : spanLength + 1;
    //       //   console.log('eventRowSpan........', this.eventRowSpan);
    //       //   return true;
    //       // }
    //     });
    //     // return true;
    //   } else {
    //     // const x = this.hourly.map(hour => {
    //     //   const hourIndex = this.time.indexOf(hour);
    //     //   if (rowIndex === hourIndex) {
    //     //     this.eventRowSpan = 12;
    //     //   }
    //     //   // return true;
    //     // });
    //     this.hourlySpan(rowIndex);
    //     return true;
    //   }
    //   // this.eventRowSpan = 1;
    //   // return true;
    // }

      // showEvents(currentTime, index) {
  //   if (this.eventRowSpan > 1) {
  //     this.eventRowSpan --;
  //     return false;
  //   }
  //   const localData = localStorage.getItem(this.localStorageVariable);
  //   const data = JSON.parse(localData);
  //   // this.toCheckEvents = data;
  //   const filteredArray = this.generateFilteredArray(data);
  //   const datalength = this.toCheckEvents.length;
  //   if (datalength > 0) {
  //     return this.eventSpan(this.toCheckEvents, filteredArray, currentTime, index);
  //     // return true;
  //   }
  //   return this.hourlySpan(index);
  // }


    // // after changing span for 1 event that event must not be checked again
  // eventSpan(checkList, filteredArray, currentRowTime, currentTimeIndex): boolean {
  //   return checkList.map(event => {
  //     const eventStartIndex = event.startTimeIndex;
  //     const eventEndIndex = event.endTimeIndex;
  //     const eventLength = event.eventLength;
  //     const nextHourIndex = this.findNextHourIndex(currentTimeIndex);
  //     const lastHourINdex = this.findLastHourINdex(currentTimeIndex);
  //     const isHourStart = this.findIsHourStart(currentRowTime);
  //     const nextHourAfterEventStart = this.findNextHourIndex(eventStartIndex);
  //     const nextHourAfterEventEnd = this.findNextHourIndex(eventEndIndex);
  //     const isEventChecked = this.checkedEvents.some(obj => {
  //       return obj.startTimeIndex === event.startTimeIndex && obj.endTimeIndex === event.endTimeIndex;
  //     });
  //     if (isEventChecked && isHourStart && currentTimeIndex >= eventEndIndex) {
  //       return this.hourlySpan(currentTimeIndex);
  //     }
  //     if (isEventChecked && !isHourStart && currentTimeIndex === eventEndIndex) {
  //       this.eventRowSpan = currentTimeIndex - nextHourIndex;
  //       return true;
  //     }
  //     if (currentTimeIndex < eventStartIndex && nextHourIndex <= eventStartIndex) {
  //       return this.hourlySpan(currentTimeIndex);
  //     }
  //     // if (currentTimeIndex === eventStartIndex && !isHourStart) {

  //     // }
  //     if (isHourStart && eventStartIndex < nextHourIndex && eventStartIndex !== currentTimeIndex && eventStartIndex > currentTimeIndex) {
  //       this.eventRowSpan = (eventStartIndex - currentTimeIndex) ;
  //       return true;
  //     }
  //     if (isEventChecked && !isHourStart && eventEndIndex === currentTimeIndex) {
  //       this.eventRowSpan = currentTimeIndex - nextHourIndex;
  //       return true;
  //     }
  //     if ( currentTimeIndex === eventStartIndex) {
  //       console.log('checkList', this.toCheckEvents);
  //       console.log('before', this.eventRowSpan);
  //       this.eventRowSpan = eventLength;
  //       // this.toCheckEvents.pop();
  //       this.checkedEvents.push(event);
  //       console.log('after', this.eventRowSpan);
  //       console.log('checkList', this.toCheckEvents);
  //       return true;
  //     }
  //     // if (currentTimeIndex === eventEndIndex + 1 && ) {}

  //     // if (currentRowTime < eventStartIndex && nextHourIndex < eventStartIndex) {
  //     //   return this.hourlySpan(currentRowTime);
  //     // }
  //     // if (eventStartIndex < nextHourIndex) {
  //     //   this.eventRowSpan = eventLength + 1;
  //     //   return true;
  //     // }
  //     // if (currentTimeIndex > eventStartIndex && currentTimeIndex < eventEndIndex) {
  //     //   // dataLength --;
  //     //   return true;
  //     // }
  //     // if (nextHourIndex < eventStartIndex) {
  //     //   return this.hourlySpan(currentTimeIndex);
  //     // }
  //     // if (currentTimeIndex < eventStartIndex && eventStartIndex < nextHourIndex) {
  //     //   this.eventRowSpan = eventStartIndex - currentTimeIndex;
  //     //   // dataLength --;
  //     //   return true;
  //     // }
  //     // // if (currentTimeIndex === eventStartIndex) {
  //     // //   this.eventRowSpan = eventLength + 1;
  //     // //   dataLength --;
  //     // //   return true;
  //     // // }
  //     // if (currentTimeIndex === eventEndIndex && !isHourStart) {
  //     //   this.eventRowSpan = nextHourIndex - currentTimeIndex;
  //     //   // dataLength --;
  //     //   return true;
  //     // }
  //   });
  // }

    // showAllEvents(index) {
  //   const data = localStorage.getItem(this.localStorageVariable);
  //   const localData = JSON.parse(data);
  //   this.toCheckEvents = localData;
  //   // let filteredArray = localData;
  //   // if (this.lastEventIndex !== index) {
  //   //   filteredArray = this.generateFilteredArray(localData);
  //   // }
  //   // const dataLength = localData.length;
  //   // for (let i = 0; i < dataLength; i++) {
  //   //   this.xTime = localData[i].startTimeIndex;
  //   //   if (localData[i].startTimeIndex === index) {
  //   //     const eventLength = localData[i].eventLength;
  //   //     this.eventHeight = eventLength * this.default5MinRowLength;
  //   //     this.eventTop = this.overlayTop + (this.default5MinRowLength * index);
  //   //     console.log('eventLength & event', eventLength, event);
  //   //     console.log('function ran', this.x++);
  //   //     this.checkedEvents.push(localData[i]);
  //   //     this.lastEventIndex = index;
  //   //     return true;
  //   //   }
  //   //   this.eventHeight = this.default5MinRowLength;
  //   //   return false;
  //   // }
  //   /////////
  //   let filteredArray = localData;
  //   if (this.lastEventIndex !== index) {
  //     filteredArray = this.generateFilteredArray(localData);
  //   }
  //   // const filteredArray = this.generateFilteredArray(localData);
  //   const filteredLength = filteredArray.length;
  //   const dataLength = localData.length;
  //   for (let i = 0; i < filteredLength; i++) {
  //     this.xTime = filteredArray[i].startTimeIndex;
  //     if (filteredArray[i].startTimeIndex === index) {
  //       const eventLength = filteredArray[i].eventLength;
  //       this.eventHeight = eventLength * this.default5MinRowLength;
  //       this.eventTop = this.overlayTop + (this.default5MinRowLength * index);
  //       console.log('eventLength & event', eventLength, event);
  //       console.log('function ran', this.x++);
  //       this.checkedEvents.push(filteredArray[i]);
  //       this.lastEventIndex = index;
  //       return true;
  //     }
  //     this.eventHeight = this.default5MinRowLength;
  //     return false;
  //   }
  //   this.eventHeight = this.default5MinRowLength;
  //   return false;
  //   /////////
  //   // const checkEvent = localData.map(event => {
  //   //   this.xTime = event.startTimeIndex;
  //   //   const isEventChecked = this.checkedEvents.some(obj => {
  //   //     return obj.startTimeIndex === event.startTimeIndex && obj.endTimeIndex === event.endTimeIndex;
  //   //   });
  //   //   if (event.startTimeIndex === index) {
  //   //     const lastIndex = event.endTimeIndex;
  //   //     const eventLength = event.eventLength;
  //   //     this.eventHeight = eventLength * this.default5MinRowLength;
  //   //     this.eventTop = this.overlayTop + (this.default5MinRowLength * index);
  //   //     console.log('eventLength & event', eventLength, event);
  //   //     console.log('function ran', this.x++);
  //   //     this.checkedEvents.push(event);
  //   //     this.lastEventIndex = index;
  //   //     return true;
  //   //   }
  //   //   this.eventHeight = this.default5MinRowLength;
  //   //   return false;
  //   // });
  //   // return checkEvent[0];
  // }

    // hourlySpan(rowIndex) {
  //   // const x = this.hourly.map(hour => {
  //   //   const hourIndex = this.time.indexOf(hour);
  //   //   if (rowIndex === hourIndex) {
  //   //     this.eventRowSpan = 12;
  //   //   }
  //   // });
  //   const hourlyIndexes = this.hourly.map(hour => {
  //     return this.time.indexOf(hour);
  //   });
  //   const checkCurrentIndex = hourlyIndexes.filter(i => i === rowIndex);
  //   if (checkCurrentIndex.length > 0) {
  //       this.eventRowSpan = 12;
  //       return true;
  //   }
  //   return false;
  // }

  // provideRowspan(currentValue) {
  //   if (this.eventData === undefined) {
  //     return 1;
  //   }
  //   const currentRowIndex = this.eventData.time.indexOf(currentValue);
  //   const nextRowIndex = currentRowIndex + 12;
  //   const eventStartIndex = this.eventData.startTimeIndex;
  //   const eventEndIndex = this.eventData.endTimeIndex;
  //   // starttime is between the currentIndex and NexINdex and endTime is greater than nextIndex then rowspan = 2 or else 1
  //   if (eventStartIndex >= currentRowIndex && eventEndIndex > nextRowIndex) {
  //     return 2;
  //   }
  //   // if (currentRowIndex >= eventStartIndex && currentRowIndex <= eventEndIndex) {
  //     // start at 18
  //     // end at 30
  //     // current is 24
  //     // then rowspan should be 2
  //   // }
  //   return 1;
  // }

  // handleRowspan(data) {
  //   const eventStartIndex = data.startTimeIndex;
  //   const eventEndIndex = data.endTimeIndex;
  //   const length = this.time.length;
  //   const x = eventStartIndex / 12;
  // }
