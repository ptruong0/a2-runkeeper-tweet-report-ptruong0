function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function (tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	})
}

function addEventHandlerForSearch() {
	// initial values
	$('#searchCount').text(0);
	$('#searchText').text('');

	$('#textFilter').on('input', () => {
		const query = $("#textFilter").val();
		$('#tweetTable').empty();

		var id = 1;
		if (query.length > 0) {
			// traverse tweets and add table row if query matches
			tweet_array.forEach((tweet) => {
			if (tweet.text.toLowerCase().includes(query.toLowerCase())) {
				$('#tweetTable').append($(tweet.getHTMLTableRow(id)));
				id++;
			}
		})
		}
		
		$('#searchCount').text(id - 1);
		$('#searchText').text(query);
	})
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});