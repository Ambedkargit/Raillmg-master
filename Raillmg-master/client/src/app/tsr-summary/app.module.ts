import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { TsrSummaryComponent } from './tsr-summary/tsr-summary.component';
import { ConnectService } from './connect.service'; // Import the ConnectService

@NgModule({
  declarations: [
    AppComponent,
    TsrSummaryComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    ConnectService // Provide the ConnectService here
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

