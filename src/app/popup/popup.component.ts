import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { PopupData } from '../app.component';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {

  public timeArray;

  public endTimeArray;

  /**
   * Form Control variables
   */
  eventNameFormControl: FormControl = new FormControl('', Validators.required);

  startTimeFormControl: FormControl = new FormControl('', Validators.required);

  endTimeFormControl: FormControl = new FormControl('', Validators.required);

  addNewForm: FormGroup = new FormGroup({
    eventName: this.eventNameFormControl,
    startTime: this.startTimeFormControl,
    endTime: this.endTimeFormControl
  });

  constructor(
    public dailogRef: MatDialogRef<PopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopupData) { }

  ngOnInit() {
    this.timeArray = this.data.time;
  }

  onNoClick(): void {
    this.dailogRef.close();
  }

  /**
   * @function onStartTimeSelection is used to create a filtered end time list.
   * @param startTimeIndex is the selected start time considered to create a filtered end time list.
   */
  onStartTimeSelection(startTimeIndex) {
    const filteredArray = this.timeArray.filter((time, index) => {
      return index > startTimeIndex;
    });
    this.endTimeArray = filteredArray;
  }

}
