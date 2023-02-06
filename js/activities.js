function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	var activityData = {};

	// can hardcode this
	// var weekendDist = 0;
	// var totalCount = 0;
	// var totalDist = 0;
	// var weekendCount = 0;
	// tweet_array.forEach((tweet) => {
	// 	const activity = tweet.activityType;
	// 	if (tweet.source == 'completed_event' && tweet.distance > 0) {
	// 		if (activity in activityData) {
	// 			activityData[activity].count++;
	// 			activityData[activity].totalDist += tweet.distance;
	// 		} else {
	// 			activityData[activity] = {
	// 				count: 1,
	// 				totalDist: tweet.distance,
	// 			};
	// 		}
	// 		// if (tweet.isWeekend) {
	// 		// 	weekendDist += tweet.distance;
	// 		// 	weekendCount++;
	// 		// } 
	// 		// totalDist += tweet.distance;
	// 		// totalCount++;
	// 	}
	// })

	// get counts of each activity
	tweet_array.forEach((tweet) => {
		const activity = tweet.activityType;
		if (tweet.source == 'completed_event') {
			if (activity in activityData) {
				activityData[activity]++;
			} else {
				activityData[activity] = 1;
			}
		}
	})
	
	// sort and get top 3 common activities
	const topActivities = [...Object.keys(activityData)];
	topActivities.sort((a, b) => activityData[b] - activityData[a]);
	$('#numberActivities').text(Object.keys(activityData).length);
	$('#firstMost').text(topActivities[0]);
	$('#secondMost').text(topActivities[1]);
	$('#thirdMost').text(topActivities[2]);

	// can hard-code this
	// var topDistances = activityKeys;
	// const max = topDistances.reduce((a, b) => { return activityData[a].totalDist / activityData[a].count > activityData[b].totalDist / activityData[b].count ? a : b })
	// const min = topDistances.reduce((a, b) => { return activityData[a].totalDist / activityData[a].count < activityData[b].totalDist / activityData[b].count ? a : b })

	// $('#longestActivityType').text(max);
	// $('#shortestActivityType').text(min);
	// $('#weekdayOrWeekendLonger').text(	weekendDist / weekendCount > (totalDist - weekendDist) / (totalCount - weekendCount) ? 'the weekend' : 'the weekday');


	// activity counts bar graph
	const bar_data = Object.keys(activityData).map((key) => {
		return {
			activity: key,
			count: activityData[key]
		}
	})
	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": bar_data
	  },
		"mark": "bar",
		"encoding": {
			"x": {
				"field": "activity"
			},
			"y": {
				"field": "count",
				"type": "quantitative"
			}
		}
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	// extract relevant data from tweets for scatterplot
	const dist_data = tweet_array.filter(tweet => tweet.activityType === topActivities[0] || tweet.activityType === topActivities[1] || tweet.activityType === topActivities[2])
	.map((tweet) => {
		return {
			activity: tweet.activityType,
			dayOfWeek: tweet.dayOfWeek,
			distance: tweet.distance
		}
	});

	// day of week / distance scatterplot
	distance_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the distances of hte top 3 activities on each day of the week.",
	  "data": {
	    "values": dist_data
	  },
		"mark": "point",
		"width": 400,
  	"height": 300,
		"encoding": {
			"x": {
				"field": "dayOfWeek",
				"sort": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
			},
			"y": {
				"field": "distance",
				"type": "quantitative"
			},
			"color": {"field": "activity", "type": "nominal"},
		}
	};
	vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});

	// same scatterplot, but with mean aggregates
	distance_vis_means_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the mean distances of the top 3 activities on each day of the week.",
	  "data": {
	    "values": dist_data
	  },
		"mark": "point",
		"width": 400,
  	"height": 300,
		"encoding": {
			"x": {
				"field": "dayOfWeek",
				"sort": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
			},
			"y": {
				"field": "distance",
				"aggregate": "mean",
				"type": "quantitative"
			},
			"color": {"field": "activity", "type": "nominal"},
		}
	};
	vegaEmbed('#distanceVisAggregated', distance_vis_means_spec, {actions:false});
	$('#distanceVisAggregated').hide();		// hide mean graph at first

	// answer questions
	$('#longestActivityType').text('bike');
	$('#shortestActivityType').text('walk');
	$('#weekdayOrWeekendLonger').text('the weekend');
}

function addButtonHandler() {
	// toggle graph view
	$('#aggregate').click(() => {
		if ($('#aggregate').text() === 'Show means') {
			$('#aggregate').text('Show all activities');
			$("#distanceVis").hide();
			$("#distanceVisAggregated").show();
		} else {
			$('#aggregate').text('Show means');
			$("#distanceVisAggregated").hide();
			$("#distanceVis").show();
		}
	})
}


//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addButtonHandler();
	loadSavedRunkeeperTweets().then(parseTweets);
});