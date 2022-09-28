<template>
  <div id="app">
    <main>
      <div class="flag-wrap jc-center">
        <img v-bind:src="flagURL" class="image" v-if="flagURL"/>
      </div>
      <div class="location-box" v-if="currentRace != {}">
        <div class="location">{{ currentRace.raceName }}</div>
        <div class="date" v-if="localTime">
          <ol>
            <li>
              {{ practice1 }}
            </li>
            <li>
              {{ session2 }}
            </li>
            <li>
              {{ session3 }}
            </li>
            <li>
              {{ session4 }}
            </li>
            <li>
              {{ localTime }}
            </li>
          </ol>
        </div>
      </div>
      <div class ="flex-parent jc-center">
        <button class = "margin-right ph-button ph-btn-blue" v-on:click="decrementRaceNum()" type="button">Previous</button>
        <button class = "ph-button ph-btn-blue" v-on:click="incrementRaceNum()" type="button">Next</button>
      </div>
      <div id = "map" class = "mapContainer" v-if="flagURL" style="height: 50%; width: 50% margin: 0 auto;" >
        <l-map :center="center"
          :zoom="zoom"
          class="map"
          ref="map"
          @update:zoom="zoomUpdated"
          @update:center="centerUpdated">
          <l-tile-layer :url="url"></l-tile-layer>
          <l-geo-json :geojson="geo" v-if="geo != {}"></l-geo-json>
        </l-map>
      </div>
    </main>
  </div>
</template>

<link rel="stylesheet" href="https://unpkg.com/@raruto/leaflet-elevation@1.7.6/dist/leaflet-elevation.min.css" />
<script src="https://unpkg.com/@raruto/leaflet-elevation@1.7.6/dist/leaflet-elevation.min.js"></script>    
<script>

import { LMap, LTileLayer, LGeoJson } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';
import geoJson from './assets/circuits/f1-circuits.geojson'
import VueGridLayout from 'vue-grid-layout';

export default {
  name: 'App',
  components : {
    LMap,
    LTileLayer, 
    LGeoJson,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  },
  data() {
    return {
      f1_allRace_url: "https://ergast.com/api/f1/2022.json",
      f1_nextRace_url: "https://ergast.com/api/f1/current/next.json",
      country_url_base: "https://restcountries.com/v3.1/name/",
      query: "",
      geo: {},
      nextRace: {},
      currentRace: {},
      raceNum: 0,
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      center: [],
      zoom: 13,
      countryInfo: {},
      flagURL: "",
      localTime: "",
      layout: []
    }
  },
  mounted:async function(){
    const nextRace = await this.getNextRace();
    const allRaces = await this.getAllRaces();
    this.setGeneric('allRaces', allRaces);
    this.setGeneric('raceNum', nextRace.MRData.RaceTable.Races[0].round - 1);
    this.setGeneric('geo', JSON.parse(geoJson));
    this.updateValues()
    let map;
  },
  methods: {

    async getCountryInfo(country) {
      if (country == "Netherlands") {
        country = "Holland";
      }
      const nextCountryInfo = await this.fetchCountry(country);
      this.countryInfo = nextCountryInfo;
    },

    incrementRaceNum() {
      if (parseInt(this.raceNum) < 21) {
        this.raceNum+=1;
        this.updateValues();
      }
    },

    decrementRaceNum() {
      if (parseInt(this.raceNum) > 0) {
        this.raceNum-=1;
        this.updateValues();
      }
    },
    
    async updateValues() {
      this.setGeneric('currentRace', this.allRaces.MRData.RaceTable.Races[this.raceNum]);
      let country = this.currentRace.Circuit.Location.country;
      if (country == "UK") {
        country = "Great Britain";
      }
      console.log(country);
      await this.getCountryInfo(country);
      let secondSessionDate;
      let thirdSessionDate;
      let fourthSessionDate;
      let dateString = `${this.currentRace.date} ${this.currentRace.time}`
      let practice1Date = `${this.currentRace.FirstPractice.date} ${this.currentRace.FirstPractice.time}`
      let practice2Date = `${this.currentRace.SecondPractice.date} ${this.currentRace.SecondPractice.time}`
      let practice3Date = `${this.currentRace.ThirdPractice.date} ${this.currentRace.ThirdPractice.time}`
      let qualifyingDate = `${this.currentRace.Qualifying.date} ${this.currentRace.Qualifying.time}`
      if (this.currentRace.hasOwnProperty("Sprint")) {
        secondSessionDate = `Qualifying: ${this.currentRace.Qualifying.date} ${this.currentRace.Qualifying.time}`;
        thirdSessionDate = `Practice 2: ${this.currentRace.SecondPractice.date} ${this.currentRace.SecondPractice.time}`;
        fourthSessionDate = `Sprint: ${this.currentRace.Sprint.date} ${this.currentRace.Sprint.time}`
        const secondSessionTime = new Date(secondSessionDate.replace(" ", "T"));
        const thirdSessionTime = new Date(thirdSessionDate.replace(" ", "T"));
        const fourthSessionTime = new Date(fourthSessionDate.replace(" ", "T"));
        this.setGeneric('session2', "Qualifying: " + secondSessionTime.toString());
        this.setGeneric('session3', "Practice 2: " + thirdSessionTime.toString());
        this.setGeneric('session4', "Sprint: " + fourthSessionTime.toString());
      } else {
        secondSessionDate = `${this.currentRace.SecondPractice.date} ${this.currentRace.SecondPractice.time}`;
        thirdSessionDate = `${this.currentRace.ThirdPractice.date} ${this.currentRace.ThirdPractice.time}`;
        fourthSessionDate = `${this.currentRace.Qualifying.date} ${this.currentRace.Qualifying.time}`;
        const secondSessionTime = new Date(secondSessionDate.replace(" ", "T"));
        const thirdSessionTime = new Date(thirdSessionDate.replace(" ", "T"));
        const fourthSessionTime = new Date(fourthSessionDate.replace(" ", "T"));
        this.setGeneric('session2', "Practice 2: " + secondSessionTime.toString());
        this.setGeneric('session3', "Practice 3: " + thirdSessionTime.toString());
        this.setGeneric('session4', "Qualifying: " + fourthSessionTime.toString());
        console.log(secondSessionTime.toString());
      }
      const locTime = new Date(dateString.replace(" ", "T"));
      const practice1Time = new Date(practice1Date.replace(" ", "T"));
      const secondSessionTime = new Date(secondSessionDate.replace(" ", "T"));
      const thirdSessionTime = new Date(thirdSessionDate.replace(" ", "T"));
      const fourthSessionTime = new Date(fourthSessionDate.replace(" ", "T"));

      this.setGeneric('localTime', "Race: " + locTime.toString());
      this.setGeneric('practice1', "Practice 1: " + practice1Time.toString());

      this.setGeneric('layout', [{"x":4,"y":0,"w":4,"h":2,"i":this.currentRace.raceName},{"x":5,"y":0,"w":2,"h":2,"i":locTime}])

      //this.setGeneric('countryInfo', this.allCountries[country]);
      this.setGeneric('center', [this.currentRace.Circuit.Location.lat, this.currentRace.Circuit.Location.long]);
      this.setGeneric('flagURL', this.countryInfo[0].flags.svg);
    },

    // async getAllCountries (races) {
    //   let allCountries = [];
    //   let outputJson = {}
    //   for (let i = 0; i < races.MRData.RaceTable.Races.length; i++) {
    //     const country = races.MRData.RaceTable.Races[i].Circuit.Location.country;
    //     allCountries.push(country);
    //   }
    //   const countryResp = await fetch(`${this.country_url_base}${allCountries.join(", ")}`);
    //   const countryJson = await countryResp.json();
    //   for (let j = 0; j < countryJson.length; j++) {
    //     outputJson[countryJson[j].name.common] = countryJson[j];
    //   }
    //   return outputJson;
    // },

    async getGeo (fileName) {
      this.geo = (JSON.parse(require(fileName)));
    },
    
    async fetchCountry (country) {
      if (country =="UK") {
        country = "Great Britain";
      }
      const countryResp = await fetch(`${this.country_url_base}${country}`);
      const countryJson = await countryResp.json();
      return countryJson;
    },

    async getAllRaces() {
      const response = await fetch(this.f1_allRace_url);
      const parsedResponse = await response.json();
      return parsedResponse;
    },

    async getNextRace() {
      const response = await fetch(this.f1_nextRace_url);
      const parsedResponse = await response.json();
      return parsedResponse;
    },

    setWeather (results) {
      this.weather = results
    },
    setGeneric (key, value) {
      this[key] = value;
    },
    setNextRace (results) {
      this.nextRace = results
    },
    setBackground (flagURL) {
      const app = document.getElementById('app');
      app.style.backgroundImage = "url('" + flagURL + "')";
    },
    dateBuilder () {
      let d = new Date();
      let months = ["January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"];
      let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
      "Saturday"];

      let day = days[d.getDay()];
      let date = d.getDate();
      let month = months[d.getMonth()];
      let year = d.getFullYear();

      return `${day} ${date} ${month} ${year}`
    },

    zoomUpdated (zoom) {
    this.zoom = zoom;
    },
    centerUpdated (center) {
     this.center = center;
    }
  }

}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  touch-action: manipulation;

}

body{
  font-family: 'montserrat', sans-serif;
}

#app {
  background-image: null;
  background-size: cover;
  background-position: bottom;
  transition: 0.4s;
}

main {
  min-height: 100vh;
  padding: 25px;

  background-image:  linear-gradient(to top, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.75));
}

ol li{
  list-style: none;
}

.location-box .location {
  color: #FFF;
  font-size: 4vh;
  font-weight: 500;
  text-align: center;
  text-shadow: 1px 3px rgba(0, 0, 0, 0.25);
}

.location-box .date, .location-box .time {
  color: #FFF;
  font-size: 2vh;
  font-weight: 300;
  font-style: italic;
  text-align: center;
  text-shadow: 1px 3px rgba(0, 0, 0, 0.25);
}

.flex-parent {
  display: flex;
  margin-top: 10px
}

.jc-center {
  justify-content: center;
}

button.margin-right {
  margin-right: 20px;
}
/*
    Name:           ph-buttons
    Description: 	Pixcil Hub Buttons
    Author: 		   Pixcils®
    Version: 	  	1.0
*/

/*Main button class
==========================*/
.ph-button {
	
    border-style: solid;
    border-width: 0px 0px 3px;
    box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.1) inset;
    color: #FFFFFF;	   
    border-radius: 6px;
    cursor: pointer;
    font-style: normal;
    overflow: hidden;
    text-align: center;
    text-decoration: none;
    text-overflow: ellipsis;
    transition: all 200ms ease-in-out 0s;
    white-space: nowrap;	
    font-family: "Gotham Rounded A","Gotham Rounded B",Helvetica,Arial,sans-serif;
    font-weight: 700;	
    height: 6vh;
    width: 24vw;
    font-size: 2vh;
    max-width: 100%;
	
}
/*Blue
==========================*/
.ph-btn-blue {

    border-color: #326E99;
    background-color: #3F8ABF;
}

.ph-btn-blue:hover, .ph-btn-blue:focus, .ph-btn-blue:active {
    background-color: #397CAC;
    border-color: #326E99;   
}

.flag-wrap {
  /* position: absolute; */
  margin: auto;
  top: 37%;
  left: 50%;
  /* transform: translate(-50%, -50%); */
}

.flag-wrap .image{
  margin: 0 auto;
  display: block;
  height: 20vh;
}

.mapContainer {
  position: absolute;
  top: 75%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  overflow :hidden
}

l-map {
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

</style>


