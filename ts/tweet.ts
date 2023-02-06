class Tweet {
    private text: string;
    time: Date;

    constructor(tweet_text: string, tweet_time: string) {
        this.text = tweet_text;
        this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
    }

    //returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source(): string {
        if (this.text.startsWith('Just completed') || this.text.startsWith('Just posted')) {
            return 'completed_event';
        } else if (this.text.startsWith('Watch my')) {
            return 'live_event';
        } else if (this.text.startsWith('Achieved')) {
            return 'achievement';
        }
        return 'miscellaneous';
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written(): boolean {
        if (this.source === 'miscellaneous') {
            return true;
        } else if (this.source != 'completed_event') {
            return false;
        }

        var splitText = this.text.split(' ')
        // longer than default text -> human written
        const DEFAULT_TWEET_LENGTH = 14
        if (splitText.length > DEFAULT_TWEET_LENGTH) {
            return true;
        } 
        else if (splitText.length > 2) {
            var strippedText = splitText.slice(0, -2).join(' ');
            // default ending text
            if (strippedText.endsWith(' with @Runkeeper. Check it out!')) {
                return false;
            }
        }
        
        return true;
    }

    get writtenText(): string {
        if (!this.written) {
            return "";
        }

        var splitText = this.text.split(' ');

        // remove text around written part
        if (splitText.length > 13 || this.source === 'miscellaneous') {
            var strippedText = splitText.slice(0, -2).join(' ');
            strippedText = strippedText.replace(' with @Runkeeper. Check it out!', '');
            strippedText = strippedText.replace(/Just (completed|posted) (an|a) \S+ (mi|km) \w+/, '');
            strippedText = strippedText.replace(/Just posted (an|a) (\w+\s)+in \S+/, '');
            strippedText = strippedText.replace('-', '');
            strippedText = strippedText.trimStart().trimEnd();
            
            return strippedText;
        } 
        return "";
    }

    get activityType(): string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        // get rid of link and "#Runkeeper" at end
        var splitText = this.text.split(' ')
        var strippedText = splitText.slice(0, -2).join(' ');

        // get rid of "with Runkeeper. Check it out!" + emojis
        strippedText = strippedText.replace(/ with [@]?Runkeeper. Check it/, '')
        strippedText = strippedText.replace(/out!/, '')
        strippedText = strippedText.replace(/\u266b \u266a/, '');

        // remove text around the activity name
        if (strippedText.match(/Just posted (an|a) (.*\s)+in \S+/)) {
            strippedText = strippedText.replace(/Just posted (an|a)/, '').replace(/in \S+/, '')
            if (strippedText.match(/\S+ (mi|km) \w+/)) {
                strippedText = strippedText.replace(/\S+ (mi|km)/, '')
            }
        } else {
            strippedText = strippedText.replace(/Just (completed|posted) (an|a) \S+ (mi|km)/, '');
        }

        strippedText = strippedText.split('-')[0];
        strippedText = strippedText.trimStart().trimEnd();

        return strippedText;
    }

    get distance(): number {
        if (this.source != 'completed_event') {
            return 0;
        }
        var splitText = this.text.split(' ')
        var strippedText = splitText.slice(0, -2).join(' ');
        strippedText = strippedText.replace(' with @Runkeeper. Check it out!', '')

        // remove text around numeric value
        if (!strippedText.match(/Just posted (an|a) (.*\s)+in \S+/)) {
            strippedText = strippedText.replace(/Just (completed|posted) (an|a) /, '')
            var strippedTextSplit = strippedText.split(' ');

            // convert to miles if km
            const KM_IN_MILE = 1.609
            if (strippedTextSplit.length >= 2) {
                return strippedTextSplit[1] == 'mi' ? parseFloat(strippedTextSplit[0]) : parseFloat(strippedTextSplit[0]) / KM_IN_MILE;
            }
        } 
        return 0;
    }

    get dayOfWeek(): string {
        const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        return DAY_NAMES[this.time.getDay()]
    }

    getHTMLTableRow(rowNumber: number): string {
        var splitText = this.text.split(' ')

        // extract link
        var strippedText = splitText.slice(0, -2).join(' ');
        var link = splitText.slice(-2, -1).join(' ');
        if (this.source === 'live_event') {
            strippedText = splitText.slice(0, -3).join(' ');
            link = splitText.slice(-3, -2).join(' ');
        } 
        var ending = this.source === 'live_event' ? '#RKLive #Runkeeper' : '#Runkeeper'

        return `<tr>
        <td>${rowNumber}</td>
        <td>${this.activityType}</td>
        <td>${strippedText} <a href=${link} target="_blank">${link}</a> ${ending}</td>
        </tr>`;
    }
}