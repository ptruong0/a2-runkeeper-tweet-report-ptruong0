function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	// sort tweets by time
	tweet_array.sort((a, b) => { return a.time - b.time });
	const dateOptions = { 
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC'
	};
	// display earliest and latest date
	$('#firstDate').text(tweet_array[0].time.toLocaleDateString('en-US', dateOptions));
	$('#lastDate').text(tweet_array[tweet_array.length - 1].time.toLocaleDateString('en-US', dateOptions));

	// get category frequencies
	var categoryCounts = {
		completed_event: 0,
		live_event: 0,
		achievement: 0,
		miscellaneous: 0,
		written: 0
	}
	tweet_array.forEach((tweet) => {
		categoryCounts[tweet.source]++;
		if (tweet.written && tweet.source === 'completed_event') {
			categoryCounts.written++;
		}
	})

	// display counts of each category
	$('.completedEvents').text(categoryCounts.completed_event);
	$('.liveEvents').text(categoryCounts.live_event);
	$('.achievements').text(categoryCounts.achievement);
	$('.miscellaneous').text(categoryCounts.miscellaneous);
	$('.written').text(categoryCounts.written);

	// display percentages of each category
	function formatPercentage(num) {
		return (num * 100).toFixed(2) + '%'
	}
	$('.completedEventsPct').text(math.format(categoryCounts.completed_event / tweet_array.length, formatPercentage));
	$('.liveEventsPct').text(math.format(categoryCounts.live_event / tweet_array.length, formatPercentage));
	$('.achievementsPct').text(math.format(categoryCounts.achievement / tweet_array.length, formatPercentage));
	$('.miscellaneousPct').text(math.format(categoryCounts.miscellaneous / tweet_array.length, formatPercentage));
	$('.writtenPct').text(math.format(categoryCounts.written / categoryCounts.completed_event, formatPercentage))
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});