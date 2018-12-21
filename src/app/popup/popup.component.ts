import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { PopupData } from '../app.component';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {

  // Make end time dropdown a cascadding dropdown

  public startTime;

  public endTime;

  constructor(
    public dailogRef: MatDialogRef<PopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopupData) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dailogRef.close();
  }

  onStartTimeSelection() {

  }

  onEndtimeSelection() {}

}
