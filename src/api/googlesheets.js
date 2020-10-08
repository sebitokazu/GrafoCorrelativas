<script
	async
	defer
	src="https://apis.google.com/js/api.js"
	onload="this.onload=function(){};handleClientLoad()"
	onreadystatechange="if (this.readyState === 'complete') this.onload()"
></script>;

export default {
	makeApiCall(sheet_id, range) {
		var params = {
			// The ID of the spreadsheet to retrieve data from.
			spreadsheetId: sheet_id, // TODO: Update placeholder value.

			// The A1 notation of the values to retrieve.
			range: range, // TODO: Update placeholder value.

			// How values should be represented in the output.
			// The default render option is ValueRenderOption.FORMATTED_VALUE.
			valueRenderOption: "", // TODO: Update placeholder value.

			// How dates, times, and durations should be represented in the output.
			// This is ignored if value_render_option is
			// FORMATTED_VALUE.
			// The default dateTime render option is [DateTimeRenderOption.SERIAL_NUMBER].
			dateTimeRenderOption: "", // TODO: Update placeholder value.

			majorDimension: ROWS
		};

		var request = gapi.client.sheets.spreadsheets.values.get(params);
		request.then(
			function(response) {
				// TODO: Change code below to process the `response` object:
				console.log(response.result);
			},
			function(reason) {
				console.error("error: " + reason.result.error.message);
			}
		);
	},
	initClient() {
		var API_KEY = "AIzaSyCJ9Cw65Ew0mNERD0kidnE9vbQfnyHKCVY"; // TODO: Update placeholder with desired API key.

		var CLIENT_ID =
			"1002093058328-hr1aeptpa9hg6shctbbrdp69ekbies4f.apps.googleusercontent.com"; // TODO: Update placeholder with desired client ID.

		// TODO: Authorize using one of the following scopes:
		//   'https://www.googleapis.com/auth/drive'
		//   'https://www.googleapis.com/auth/drive.file'
		//   'https://www.googleapis.com/auth/drive.readonly'
		//   'https://www.googleapis.com/auth/spreadsheets'
		//   'https://www.googleapis.com/auth/spreadsheets.readonly'
		var SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

		gapi.client
			.init({
				apiKey: API_KEY,
				clientId: CLIENT_ID,
				scope: SCOPE,
				discoveryDocs: [
					"https://sheets.googleapis.com/$discovery/rest?version=v4"
				]
			})
			.then(function() {
				gapi.auth2
					.getAuthInstance()
					.isSignedIn.listen(updateSignInStatus);
				updateSignInStatus(
					gapi.auth2.getAuthInstance().isSignedIn.get()
				);
			});
	},

	handleClientLoad() {
		gapi.load("client:auth2", initClient);
	},

	updateSignInStatus(isSignedIn) {
		if (isSignedIn) {
			makeApiCall();
		}
	},

	handleSignInClick(event) {
		gapi.auth2.getAuthInstance().signIn();
	},

	handleSignOutClick(event) {
		gapi.auth2.getAuthInstance().signOut();
	}
};
