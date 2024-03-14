// import preact
import { h, render, Component } from 'preact';
// import stylesheets for ipad & button
import style from './style';
import style_iphone from '../button/style_iphone';
// import jquery for API calls
import $ from 'jquery';
// import the Button component
import Button from '../button';

import { Link } from 'preact-router/match';

function ToggleAlerts() {
    //This functions in charge of hiding and showing the alerts section, it will either hide it or show it to the user once the alert button is clicked
 
    var x = document.getElementById("alerts");
    //Get the alerts section of the page and save it to a variable called x
 
    if (x.style.display == "none") {
        //This if checks if x is currently showing anything
        x.style.display = "block";
        //If nothing is being shown, if alert button is pressed then the data will be shown
    } else {
        
        x.style.display = "none"; //Else if its already being shown, theres nothing else to show so remains as none
    }
    
}

function getWeather() {
	//This function gets the weather data and displays it in the alerts section
		let url = 'http://api.openweathermap.org/data/2.5/forecast?lat=51.5072&lon=0.1276&appid=33eed092d8386fad1f802f761f4a15ac&units=metric&lang=en';
		//Create a new variable called url and set it to call the operweather API link, data being set to track London weather
		fetch(url)
		//This fetches the data from the OpenWeather API
			.then(resp => {
			
				if(!resp.ok) throw new Error(resp.statusText);
				//If the response from openWeather isnt ok, throw an error with the cause
				return resp.json();
				//If data returned is ok then return it as response and a json file
			})
	 
			.then(resp => {
	 
				console.log(resp);
				//After data has been returned, log the data in the console 
	 
				const DailyReading = new Map();
				//Create a new Map called Daily Reading which will save all the unique days returned by the resp json file
	 
				const noonList = resp.list.filter(item => {
					const itemDate = new Date(item.dt * 1000);
					const hour = itemDate.getHours();
	 
					return hour >= 11 && hour <=13;
				});
	 
				//As the returned data is in a 3 hour interval, its too much useless information so decided to save only the dates and their weather conditions between the hours of 11am - 1pm
	 
				noonList.forEach(item => {
					const itemDate = new Date(item.dt * 1000);
					const itemDay = itemDate.getDate();
					
					if (!DailyReading.has(itemDay)) {
						DailyReading.set(itemDay, item);
					}
				});
	 
				//This will use the noonList variable to check if the Map called DailyReading has saved the date on its map, if not then saves it else moves on.
	 
				DailyReading.forEach((item, day) => {
					console.log(`Day ${day}:`, item);
				});
	 
				//This logs all the saved dates in the console for easier debugging
	 
				let row = document.getElementById('alerts');
	 
				//Gets the alerts section and saves it in a variable called row
				
				
				row.innerHTML = Array.from(DailyReading.values())
	 
					.slice(0, 5)
	 
					.map(day => `
	 
						<div>
	 
						<p style = "font-size:small; color:black;">Day: ${new Date(day.dt * 1000).toLocaleDateString()} Temperature: ${Math.round(day.main.temp)}°C Description: ${day.weather[0].description.charAt(0).toUpperCase() + day.weather[0].description.slice(1)}</p>
							
						</div>
	 
					`).join(' ');
	 
				//This will slice the Map called Daily reading to only display 5 days worth of data, from which we will now post the Day date, temperature of the day and the description of the day
				//This will print a line for each day saved and printed - so in our scenario it will be 5 days 
			})
	 
			.catch(console.err)
			//If cannot fetch catch the error outputted
	 
	}

function jointDisplay() {
 	//This function just calls both the functions into 1 function for more efficent calling.
		ToggleAlerts();
		getWeather();
	}


// Takes a given 24 hour time and turns it into a 12 hour time in format "3:30pm" from "15:50"
function cTime(time){
		// Slices the string into discrete variables of hours, minutes and moon_phase
		let hours = parseInt(time.slice(0,2));
		let minutes = time.slice(-2);
		let moon_phase = "am";

		// Appends the moon phase of am or pm after the 12 hour time.
		if(hours >= 12){
			moon_phase = "pm";
			hours = hours - 12;
		} else if(hours === 0){
			hours = 12;
		}

		// Returns the newly formatted time.
		return hours + ":" + minutes + moon_phase;
	}


export default class Iphone extends Component {s

	// a constructor with initial set states for variables.
	constructor(props){
		super(props);
		this.state.temperature = "";
		this.state.dailyTemperatures = [0,0,0,0,0,0,0]
		this.run_time = "17:00";
	}

	// A call to fetch weather data via OpenWeatherMap
	fetchWeatherData = () => {
		var url = "http://api.openweathermap.org/data/2.5/weather?q=London,uk&units=metric&APPID=013546b0417abb609baa70f7031a8df6";
		$.ajax({
			url: url,
			dataType: "jsonp",
			success : this.parseResponse,
			error : function(req, err){ console.log('API call failed ' + err); }
		})
	}

	// Parses the weather data.
	parseResponse = (parsed_json) => {
		// Takes temperature in ºC and rounds it to 1 d.p.
		var temp_c = parsed_json['main']['temp'].toFixed(1);
		// Humidity to 0 d.p. (integer value) as percentage of humidty would be more helpful as an integer.
		var humidity = parsed_json['main']['humidity'].toFixed(0);
		// wind speed converting m/s to mph at 1 d.p.
		var wind_speed_mph = (parsed_json['wind']['speed'] * 2.23694).toFixed(1);
		// check if 'rain' property exists and if so give the percipitaion to 0 d.p. (integer values).
		var precipitation_mm = (parsed_json['rain'] ? parsed_json['rain']['1h'] : 0).toFixed(0); 

		var feels_like = parsed_json['main']['feels_like'].toFixed(0);

		// Set the state variables mapped to the local variables that were parsed above.
		this.setState({
			temperature: temp_c,
			humidity: humidity,
			wind_speed: wind_speed_mph,
			feels_like: feels_like,
			precipitation: precipitation_mm,
		});

		// once the data is grabbed, fetch data for the week overview.
		this.fetchWeatherData2();
	}
	
	// Fetches the whether data for the purpose of getting a weekly overview of temperatures.
	fetchWeatherData2 = () => {
		var url = "http://api.openweathermap.org/data/2.5/forecast?q=London&units=metric&APPID=013546b0417abb609baa70f7031a8df6";
		$.ajax({
		  url: url,
		  dataType: "jsonp",
		  success: this.parseResponse2,
		  error: function(req, err) {
			console.log('API call failed ' + err);
		  }
		});
	  }

	//   Parses the week's weather data for average temperatures, for the weather overview bar.
	parseResponse2 = (parsed_json) => {
		// Retrives the forecast list from the JSON response fetched..
		var future_weather = parsed_json['list'];
	  
		// Retrieves the current day of the week.
		var currentDay = new Date();
	  
		// Calculates the average temperature for each of the next 7 days using the forecast horuly data available.
		var dailyTemperatures = [];
		
		for (var i = 0; i < 7; i++) {
			
		  //Creates a tempDay counter with the day of the week being looked at.
		  var tempDay = new Date(currentDay);
		  tempDay.setDate(currentDay.getDate() + i);
	  
		  // filter the future_weather for the next day
		  var next_future_weather = future_weather.filter(function(forecast) {
			var forecastDate = new Date(forecast['dt'] * 1000);
			return forecastDate.getDate() == tempDay.getDate() && forecastDate.getMonth() == tempDay.getMonth() && forecastDate.getFullYear() == tempDay.getFullYear();
		  });
	  
		  // Calculates the average temperature for the day in question
		  var totalTemperature = next_future_weather.reduce(function(sum, forecast) {
			return sum + forecast['main']['temp'];
		  }, 0);

		  var averageTemperature = totalTemperature / next_future_weather.length;
	  
		  // Pushes the average temperature of that day to the dailyTemperatures array and rounding to 0 d.p. (nearest integer) for reabablility.
		  dailyTemperatures.push(averageTemperature.toFixed(0));
		}

		// Set the state variable mapped to the dailyTemperatures.
		this.setState({
			dailyTemperatures : dailyTemperatures
		});
	  }
	  
	// Automatically fetches the weather data upon load of the page.
	componentDidMount() {
		this.fetchWeatherData();
	}

	// the main render method for the iphone component
	render() {
		//Check if temperature data is fetched, if so add the sign styling to the page
		const tempStyles = this.state.temp ? `${style.temperature} ${style.filled}` : style.temperature;

		//Gets the current date.
		var currentDate = new Date();


		// Create array of Days of the week to be placed on various parts of the display.
		var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
		var daysFull = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
		// get the index of the current day (day number to pick from the above array where appropiate.)
		var currentDayIndex = currentDate.getDay();
		




		// display all weather data
		return (
			// Inline if statement to change the stylesheet class depending on the weather conditions.
			<div class={(this.state.temperature > 20) ? style.warm : style.container}>
				
				<h2 class = {style.NextRun}>NEXT RUN</h2>
				<h2 class = {style.BestRun}>{daysFull[currentDayIndex]} {cTime(this.run_time)}</h2>

				<div class = {style.statusBar}></div>

				<div class = {style.todaysTemp}>{this.state.feels_like}º</div>

				<div class = {style.calendar}>
				 	{/* All the divs with each day of the week displayed with their apporpiate temperatures. */}
					<div><span class="boldText" id="Today">{days[currentDayIndex]}</span> {Math.round(this.state.temperature)}ºC</div>
					<div><span class="boldText" id="2nd Day">{days[(currentDayIndex + 1) % 7]}</span> {this.state.dailyTemperatures[1]}ºC</div>
					<div><span class="boldText" id="3rd Day">{days[(currentDayIndex + 2) % 7]}</span> {this.state.dailyTemperatures[2]}ºC</div>
					<div><span class="BoldText" id="4th Day">{days[(currentDayIndex + 3) % 7]}</span> {this.state.dailyTemperatures[3]}ºC</div>
					<div><span class="boldText" id="5th Day">{days[(currentDayIndex + 4) % 7]}</span> {this.state.dailyTemperatures[4]}ºC</div>
					<div><span class="boldText" id="6th Day">{days[(currentDayIndex + 5) % 7]}</span> {this.state.dailyTemperatures[5]}ºC</div>
					{/* NOTE: Only the PAID plan of the OpenWeatherAPI has access to weather past 5 days in the future */}
					<div><span class="boldText" id="7th Day">{days[(currentDayIndex + 6) % 7]}</span> {this.state.dailyTemperatures[6]}ºC</div>
				</div>

				<section class = {style.columns}>
					<div class = {style.Box1}>
						{/* Box encaspulating the today forecast panel. */}
						<div class = {style.todayPanel} style="color:black">
							<div style="text-align: left;"><b>TODAY'S</b></div>
							<hr></hr>
							<div style="text-align: left;">Temperature<div style="float: right;">{this.state.temperature}ºC</div></div>
							<hr></hr>
							<div style="text-align: left;">Humidity<div style="float: right;">{this.state.humidity}%</div></div>
							<hr></hr>
							<div style="text-align: left;">Wind<div style="float: right;">{this.state.wind_speed}mph</div></div>
							<hr></hr>
							<div style="text-align: left;">Precipitation<div style="float: right;">{this.state.precipitation}mm</div></div>
						</div>
					</div>
					<div class = {style.Box2}>
						{/* Box encapsulating the 'feels like' temperature*/}
						<div class = {style.feelsLikePanel} style="color:black; text-align: left;">
							<span><b>Feels Like</b><div style="float: right;">{this.state.feels_like}ºC</div></span>
						</div>
						{/* Box encapsulating the run time*/}
						<div class = {style.recommendedPanel} style="color:black; text-align: left;">
							<span><b>Recommended</b><div style="float: right;">{cTime(this.run_time)}</div></span>
						</div>
					</div>

					{/* Box containing the Clothing indicator and relative humidty. */}
					<div class = {style.Box3}>
						<div class = {style.clothesPanel}>
						<div class="row">
							<div class="column">
								{/* In-line if statement to determine whether Jacket or Tee should be recomended. */}
								<img src={(this.state.temperature < 16) ? "../../assets/Images/Jacket.png" :  "../../assets/Images/Tee.png"} style="width:32%"></img>
							</div>
							<div class="column">
								<img src="../../assets/Images/Cloud.png" style="width:32%"></img>
							</div>
							<div class="column">
								<h3>{this.state.humidity}%</h3>
							</div>
							</div>
						</div>
					</div>
				</section>


				{/* The Alerts button */}
				<img src="../../assets/Images/AlertButton.png" alt="Button" onClick={jointDisplay} style="width:15%"/>

				<div id = "alerts" style={"display : none; 	border-radius: 30px 30px 30px 30px;background: rgba(255, 255, 255, 0.5);"} > </div>


				<div class={ style.header }>
					<div class={ style.city }>{ this.state.locate }</div>
					<div class={ style.conditions }>{ this.state.cond }</div>
					<span class={ tempStyles }>{ this.state.temp }</span>
				</div>
				<div class={ style.details }></div>
				
				
			</div>
			
			
			
		);
	}

}
