<template>
  <div id="app">
    <main>
      <div class="location-box" v-if="currentRace != {}">
        <div class="location">{{ currentRace.raceName }}</div>
        <div class="date" v-if="localTime">{{ localTime }}</div>
      </div>
      <div class ="flex-parent jc-center">
        <button class = "margin-right ph-button ph-btn-blue" v-on:click="decrementRaceNum()" type="button">Previous</button>
        <button class = "ph-button ph-btn-blue" v-on:click="incrementRaceNum()" type="button">Next</button>
      </div>
      <div class="flag-wrap">
        <img v-bind:src="flagURL" class="image" v-if="flagURL"/>
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
    const allRaces = await this.getAllRaces();
    const allCountries = await this.getAllCountries(allRaces);
    this.setGeneric('allRaces', allRaces);
    this.setGeneric('allCountries', allCountries);
    this.setGeneric('geo', JSON.parse(geoJson));
    this.updateValues()
    let map;
  },
  methods: {

    incrementRaceNum() {
      if (parseInt(this.raceNum) < 22) {
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
    
    updateValues() {
      this.setGeneric('currentRace', this.allRaces.MRData.RaceTable.Races[this.raceNum]);
      let country = this.currentRace.Circuit.Location.country;
      let dateString = `${this.currentRace.date} ${this.currentRace.time}`
      const locTime = new Date(dateString.replace(" ", "T"));

      this.setGeneric('localTime', locTime.toString());
      this.setGeneric('layout', [{"x":4,"y":0,"w":4,"h":2,"i":this.currentRace.raceName},{"x":5,"y":0,"w":2,"h":2,"i":locTime}])
      if (country == 'UK') {
        country = 'United Kingdom';
      } else if (country == 'USA') {
        country = 'United States';
      } else if (country == 'UAE') {
        country = 'United Arab Emirates';
      }
      this.setGeneric('countryInfo', this.allCountries[country]);
      this.setGeneric('center', [this.currentRace.Circuit.Location.lat, this.currentRace.Circuit.Location.long]);
      this.setGeneric('flagURL', this.allCountries[country].flags.svg);
    },

    async getAllCountries (races) {
      let allCountries = [];
      let outputJson = {}
      for (let i = 0; i < races.MRData.RaceTable.Races.length; i++) {
        const country = races.MRData.RaceTable.Races[i].Circuit.Location.country;
        if (country == 'UK') {
          country = 'United Kingdom';
        } else if (country == 'USA') {
          country = 'United States';
        } else if (country == 'UAE') {
          country = 'United Arab Emirates';
        };
        allCountries.push(country);
      }
      const countryResp = await fetch(`${this.country_url_base}${allCountries.join(", ")}`);
      const countryJson = await countryResp.json();
      for (let j = 0; j < countryJson.length; j++) {
        outputJson[countryJson[j].name.common] = countryJson[j];
      }
      return outputJson;
    },

    async getGeo (fileName) {
      this.geo = (JSON.parse(require(fileName)));
    },
    
    async fetchCountry (country) {
      const countryResp = await fetch(`${this.country_url_base}${country}`);
      const countryJson = await countryResp.json();
      return countryJson;
    },
    async getAllRaces() {
      const response = await fetch(this.f1_allRace_url);
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
  position: absolute;
  top: 37%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.flag-wrap .image{
  margin: 0 auto;
  display: inline-block;
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


