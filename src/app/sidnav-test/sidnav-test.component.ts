import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidnav-test',
  templateUrl: './sidnav-test.component.html',
  styleUrls: ['./sidnav-test.component.scss']
})
export class SidnavTestComponent implements OnInit {
  drawerOpen = true
  conentOpen = false

  constructor() { }
  
  ToggleDrawer() {
    if(this.drawerOpen) {
      this.drawerOpen = false
    } else {
    this.drawerOpen = true
    }
  }
  ToggleContent() {
    if(this.conentOpen) {
      this.conentOpen = false
    } else {
    this.conentOpen = true
    }
  }

  ngOnInit() {
  }

}
