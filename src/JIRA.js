/**
 * Created by dbeckerfl on 10/14/17.
 *
 *
 *
 */
var Client = require('node-rest-client').Client;
var b64 = require('base-64');
const baseUrl = "https://jira-voice.atlassian.net/rest/"
var userMapping = {
    "Anthony": "admin",
    "Daniel": "dbecker.fl",
    "Will": "willepp"
};


class JIRA {

    constructor(username, password) {
        this.client = new Client();
        this.auth = b64.encode(username + ":" + password);
    }

    addComment(issueID, body, callback) {
        var postArgs = {
            headers: {
                // Do authorization for this request
                "Authorization": "Basic " + this.auth,
                "Content-Type": "application/json"
            },
            data: {
                "body": body
            }
        }

        this.client.post(baseUrl + "api/2/issue/" + issueID + "/comment",
            postArgs, function(data, response) {
                console.log('status code of addComment:', response.statusCode);
                if (!!callback) {
                    callback(data);
                }
        });
        return "Added comment: '" + body +"' to issue: " + issueID;
    }

    assign(issueID, assignee, callback) {
        var putArgs = {
            headers: {
                // Do authorization for this request
                "Authorization": "Basic " + this.auth,
                "Content-Type": "application/json"
            },
            data: {
                "name": userMapping[assignee]
            }
        };

        this.client.put(baseUrl + "api/2/issue/" + issueID + "/assignee",
            putArgs, function(data, response) {
                console.log('status code of assign:', response.statusCode);
                if (!!callback) {
                    callback(data);
                };
        });
        return "Assigning issue: " + issueID + " to " + userMapping[assignee];
    }

    getTransitions(issueID, callback) {
        var getArgs = {
            headers: {
                // Do authorization for this request
                "Authorization": "Basic " + this.auth,
                "Content-Type": "application/json"
            },
            data: {
                "expand": "transitions.fields"
            }
        };
        this.client.get(baseUrl + "api/2/issue/" + issueID + "/transitions",
            getArgs, function(data, response) {
                //console.log(data.transitions[3]);
                //console.log(data.transitions);
                if (!!callback) {
                        callback(data);
                    };
                });
        return "Got transitions";
    }

    // Sends message to people in list teamMembers, watchers,
    // and voters of this issue
    notifyOnIssue(issueId, subject, textBody, teamMembers,callback) {
        if (!subject) {
            subject = "Issue update";
        }

        var postArgs = {
            headers: {
                // Do authorization for this request
                "Authorization": "Basic " + this.auth,
                "Content-Type": "application/json"
            },
            data: {
                "subject": subject,
                "textBody": textBody,
                "users": []
            }
        };

        if (teamMembers != null) {
            for(var i = 0; i < teamMembers.length;i++) {
                console.log("Sending message to " + teamMembers[i]);
                postArgs.data.users.push({
                    "name": userMapping[teamMembers[i]],
                    "active": true
                });
            }
        }
        console.log(postArgs.data.users);


        this.client.post(baseUrl + "api/2/issue/" + issueId + "/notify",
            postArgs, function(data, response) {
                console.log('status code of notifyOnIssue:', response.statusCode);
                if (!!callback) {
                    callback(data);
                };
        });

        return "Query all"
    }

    queryAll(assignee, callback) {
        var searchArgs = {
            headers: {
                // Do authorization for this request
                "Authorization": "Basic " + this.auth,
                "Content-Type": "application/json"
            },
            data: {
                // Provide additional data for the JIRA search. You can modify the JQL to search for whatever you want.
                jql: "assignee=" + assignee
            }
        };
        this.client.post(baseUrl + "api/2/search", searchArgs, function(searchResult, response) {
                console.log('status code on queryAll:', response.statusCode);
                if (!!callback) {
                    callback(searchResult);
                };
        });

        return "Query all"
    }

    transition(issueID, columnId, callback) {
        var postArgs = {
            headers: {
                // Do authorization for this request
                "Authorization": "Basic " + this.auth,
                "Content-Type": "application/json"
            },
            data: {
                "transition": {
                    "id": "21"
                },
            }
        };

        this.client.post(baseUrl + "api/2/issue/" + issueID +
            "/transitions",
            postArgs, function(data, response) {
                console.log('status code on transition:', response.statusCode);
                    if (!!callback) {
                        callback(data);
                    };
        });
        return "Issue " + issueID + " has been moved to column " + columnId;
    }

    updateDescription(issueID, description, callback) {
        var putArgs = {
            headers: {
                // Do authorization for this request
                "Authorization": "Basic " + this.auth,
                "Content-Type": "application/json"
            },
            data: {
                "update": {
                    "description": [
                        {
                            "set": description
                        }
                    ],
                }
            }
        };

        this.client.put(baseUrl + "api/2/issue/" + issueID,
            putArgs, function(data, response) {
                console.log('status code on updateDescription:', response.statusCode);
                if (!!callback) {
                    callback(data);
                };
        });
        return "In issue " + issueID + ", set description to " + description;
    }

    /*updateLabels(issueID, labels, values) {
        var putArgs = {
            headers: {
                    // Set the cookie from the session information
                    "Authorization": "Basic " + this.auth,
                    "Content-Type": "application/json"
            },
            data: {
                    "update": {
                        "labels"[
                        ]
                    }
            }
        };


        this.client.put(baseUrl + "api/2/issue/" + issueID,
            putArgs, function(data, response) {
            console.log('status code:', response.statusCode);
            //callback(data);
        });
        return "In issue " + issueID + ", set label to " + label;
    }*/

    updateSummary(issueID, summary, callback) {
        var putArgs = {
            headers: {
                    // Do authorization for this request
                    "Authorization": "Basic " + this.auth,
                    "Content-Type": "application/json"
            },
            data: {
                "update": {
                    "summary": [
                        {
                            "set": summary
                        }
                    ],
                }
            }
        };

        this.client.put(baseUrl + "api/2/issue/" + issueID,
            putArgs, function(data, response) {
                console.log('status code on updateSummary:', response.statusCode);
                if (!!callback) {
                    callback(data);
                };
        });
        return "In issue " + issueID + ", set summary to " + summary;
    }

}
exports.JIRA = JIRA;


/* Get the session information and store it in a cookie in the header
var searchArgs = {
        headers: {
                // Set the cookie from the session information
                cookie: session.name + '=' + session.value,
                "Content-Type": "application/json"
        },
        data: {
                // Provide additional data for the JIRA search. You can modify the JQL to search for whatever you want.
                jql: "type=Story"
        }
};
// Make the request return the search results, passing the header information including the cookie.
client.post(baseUrl + "api/2/search", searchArgs, function(searchResult, response) {
        console.log('status code:', response.statusCode);
        console.log('search result:', searchResult);
}); */