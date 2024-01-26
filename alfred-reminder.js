ObjC.import('Foundation');
ObjC.import('stdlib');
var window = {} // required for chrono.js to function properly, see https://github.com/wanasit/chrono/issues/34

function run(argv) {
	var query = argv[0],
		results = {},
		jsonResult = {},
		shouldQuit = !isRemindersRunning();
		
	if(query == "help") {
		results = showHelpItems();
	} else {
		results = parseReminderQuery(query);
	}
	
	jsonResult['items'] = results['items'];
	jsonResult['variables'] = {
		"reminders":JSON.stringify(results['reminders']),
		"quitAfter":JSON.stringify(shouldQuit)
	};
	return JSON.stringify(jsonResult);
}

function isRemindersRunning() {
	return Application('Reminders').running();
}

// returns a dictionary corresponding to an Alfred action item
// https://www.alfredapp.com/help/workflows/inputs/script-filter/json/
// arg: Alfred item arg
// valid: true|false whether to enable action
// reminderText: text of the reminder
// date: remind me date
// whenText: text corresponding to the remind me date
// priority: 1|2|3 reminder priority value
//
function getAction(options) {
	var Reminders = Application('Reminders');
  var arg = options['arg'],
    valid = options['valid'],
    icon = "",
    title = "Add Reminder",
    subtitle = "Create a new reminder";

  if(options['reminderText']) subtitle += " to \"" + options['reminderText'] + "\"";
  else if(options['application'] && options['application']['text']) subtitle += " about \"" + options['application']['text'] + "\"";

  if(options['date']) {
    subtitle += " on " + options['date'].toString();
  }

  if(options['whenText']) {
    title = "Remind me " + options['whenText'];
  }

  if(options['application']) {
    var appname = options['application']['appname'];
    icon = options['application']['icon'];
    title += " from " + appname;
  }

  if(options['priority']) {
    switch(parseInt(options['priority'])) {
      case 0:
        break;
      case 1:
        title += " (low priority)"
		subtitle += " (low priority)"
        break;
      case 2:
        title += " (medium priority)"
		subtitle += " (medium priority)"
        break;
      case 3:
        title += " (high priority)"
		subtitle += " (high priority)"
        break;
    }
  }

	if(options['reminderList']) {
		// verify a matching list exists
		lists = Reminders.lists.whose({name:options['reminderList']})
		if(lists.length) {
			subtitle += " in the " + lists[0].name() + " list";
		}	else {
			valid = false;
			title = "Cannot create reminder"
			subtitle = "No list called \"" + options['reminderList'] + "\" was found in Reminders";
			// TODO: maybe add a different icon here
		}
	}

  var item = {title:title, arg:arg, valid:valid, subtitle:subtitle, icon:{path:icon}};
  return item;
}

// returns a dictionary containing data to make a reminder
// arg: Alfred item arg
// reminderText: text of the reminder
// reminderBody: body text for the reminder
// date: remind me date
// list: reminder list name
// priority: 1|2|3 reminder priority value
// application: application name
//
function getReminderData(options) {
  var arg = options['arg'],
    text = options['reminderText'],
    priority = options['priority'],
    body = "",
    date = "",
    application = "",
    list = "";

  if(options['reminderBody']) {
    body = options['reminderBody'];
  }

  if(options['date']) {
    date = options['date'];
  }

  if(options['application']) {
    application = options['application']['appname'];
    if(!text) text = options['application']['text'];
    if(!body) body = options['application']['body'];
  }

  if(options['reminderList']) {
    list = options['reminderList'];
  }

  var data = {arg:arg, text:text, body:body, date:date, list:list, priority:parseInt(priority), application:application}
  return data
}

function parseReminderQuery(query) {
	var originalQuery = query;
	var parsedReminder = {}
	var items = []
	var reminders = []

  // list supported applications along with the associated JXA to fetch information
  var supportedReminderApplications = [
    {appname:"Address Book", icon:"Address Book.png", reminderText:'Application("Contacts").selection()[0].name()', reminderBody:'"addressbook://" + Application("Contacts").selection()[0].id()'},
    {appname:"AdobeAcrobat", icon:"AcrobatPro.png", reminderText:'Application("Adobe Acrobat").activeDoc.name()', reminderBody:'var p = Application("Adobe Acrobat").activeDoc.fileAlias().toString(); if(p) "file://" + escape(p)'},
    {appname:"Chromium", icon:"Chromium.png", reminderText:'Application("Chromium").windows[0].activeTab.title();', reminderBody:'Application("Chromium").windows[0].activeTab.url();'},
    {appname:"Contacts", icon:"Address Book.png", reminderText:'Application("Contacts").selection()[0].name()', reminderBody:'"addressbook://" + Application("Contacts").selection()[0].id()'},
    {appname:"Finder", icon:"Finder.png", reminderText:'Application("Finder").selection()[0].name()', reminderBody:'Application("Finder").selection()[0].url()'},
    {appname:"FoldingText", icon:"App.png", reminderText:'Application("FoldingText").documents[0].name()', reminderBody:'var p = Application("FoldingText").documents[0].path(); if(p) "file://" + escape(p)'},
    {appname:"Brave Browser", icon:"Brave.png", reminderText:'Application("Brave Browser").windows[0].activeTab.title();', reminderBody:'Application("Brave Browser").windows[0].activeTab.url();'},
    {appname:"Microsoft Edge", icon:"Edge.png", reminderText:'Application("Microsoft Edge").windows[0].activeTab.title();', reminderBody:'Application("Microsoft Edge").windows[0].activeTab.url();'},
    {appname:"Google Chrome", icon:"Chrome.png", reminderText:'Application("Google Chrome").windows[0].activeTab.title();', reminderBody:'Application("Google Chrome").windows[0].activeTab.url();'},
    {appname:"Google Chrome Canary", icon:"Chrome Canary.png",  reminderText:'Application("Google Chrome Canary").windows[0].activeTab.title();', reminderBody:'Application("Google Chrome Canary").windows[0].activeTab.url();'},
    {appname:"Mailplane", icon:"Mailplane.png", reminderText:'Application("Mailplane").currenttitle()', reminderBody:'Application("MailPlane").currentmessagetext()'},
    {appname:"Mail", icon:"Mail.png",  reminderText:'var m = Application("Mail").selection()[Application("Mail").selection().length-1]; m.subject() + " (From " + m.sender() + ")"', reminderBody:'var m = Application("Mail").selection()[Application("Mail").selection().length-1]; "message://<" + m.messageId() + ">"'},
    {appname:"Microsoft PowerPoint", icon:"Powerpoint.png", reminderText:'Application("Microsoft PowerPoint").activePresentation.name()', reminderBody:'var p = Application("Microsoft PowerPoint").activePresentation.fullName(); if(p) "file://" + escape(p)'},
    {appname:"Microsoft Word", icon:"MSWord.png", reminderText:'Application("Microsoft Word").activeDocument.name()', reminderBody:'var p = Application("Microsoft Word").activeDocument.posixFullName(); if(p) "file://" + escape(p)'},
    {appname:"Safari", icon:"Safari.png", reminderText:'Application("Safari").windows[0].currentTab.name();', reminderBody:'Application("Safari").windows[0].currentTab.url();'},
    {appname:"TextEdit", icon:"TextEdit.png", reminderText:'Application("TextEdit").documents[0].name()', reminderBody:'var p = Application("TextEdit").documents[0].path(); if(p) "file://" + escape(p)'},
    {appname:"TextMate", icon:"TextMate.png", reminderText:'Application("TextMate").documents[0].name()', reminderBody:'var p = Application("TextMate").documents[0].path(); if(p) "file://" + escape(p)'},
    {appname:"Vienna", icon:"RSS.png", reminderText:'Application("Vienna").currentArticle().title()', reminderBody:'Application("Vienna").currentArticle().link()'},
    {appname:"WebKit", icon:"Safari.png", reminderText:'Application("WebKit").windows[0].currentTab.name();', reminderBody:'Application("WebKit").windows[0].currentTab.url();'},
  ]
  	if(! window.chrono) { 
		//https://github.com/dtinth/JXA-Cookbook/wiki/Importing-Scripts

		//http://www.alfredforum.com/topic/9070-how-to-workflowenvironment-variables/
		//https://www.alfredapp.com/help/workflows/script-environment-variables/
		var chronoPath = $.getenv('alfred_preferences') + "/workflows/" + $.getenv('alfred_workflow_uid') + "/chrono.min.js"


		// uncomment for local testing in script editor
		//var path = app.pathTo(this);
		//var workflowFolder =  $.NSString.alloc.initWithUTF8String(path).stringByDeletingLastPathComponent.js + '/';
		//var chronoPath = workflowFolder + "chrono.min.js"

		console.log(chronoPath)

		var fm = $.NSFileManager.defaultManager;
		var contents = fm.contentsAtPath(chronoPath); // NSData
		contents = $.NSString.alloc.initWithDataEncoding(contents, $.NSUTF8StringEncoding);

		eval(ObjC.unwrap(contents));
	}
	
	// extract list
	var reminderList = "";
	// http://regexr.com/3f03r
	// var listRegex = /(.+) in (.+) list$/i
	// var matches = listRegex.exec(query)
	// if(matches && matches.length == 3) {
	// 	reminderList = matches[2];
	// 	query = matches[1];
	// }
    var listRegex = /(.+) in (.+) list($|\s+)/i;
    var matches = listRegex.exec(query);
    if(matches && matches.length == 4) {
        reminderList = matches[2];
        query = matches[1];
    }
    if (reminderList == "") {
        listRegex = /(.+) @ (.+?)($|\s+)/i;
        matches = listRegex.exec(query);
        if(matches && matches.length == 4) {
            reminderList = matches[2];
            query = matches[1];
        }
    }


	// extract priority
	var priority = "";
  // test for !, !!, !!! at beginning
  // http://regexr.com/3er7r
  var priorityRegex = /^(!{1,3})\s(.+)/i
	var matches = priorityRegex.exec(query)
	if(matches && matches.length == 3) {
    priority = matches[1].length;
    query = matches[2];
  } else {
    // test for !, !!, !!! at end
    // http://regexr.com/3er7u
    var priorityRegex = /\s(.+)\s(!{1,3})$/i
  	var matches = priorityRegex.exec(query)
  	if(matches && matches.length == 3) {
      priority = matches[2].length;
      query = matches[1];
    } else {
      // test for !3, p1, priority 1, etc
    	// http://regexr.com/3er73
    	var priorityRegex = /(.+)\s(priority|p|!)\s*([1-3])\s*$/i
    	var matches = priorityRegex.exec(query)
    	if(matches && matches.length == 4) {
    		priority = matches[3];
    		query = matches[1];
      } else {
        // test for !hi, p med, priority low, etc
      	// http://regexr.com/3er7c
        var priorityRegex = /(.+)\s(priority\s+|p\s*|!\s*)(l|lo|low|m|med|medium|h|hi|high)\s*$/i
      	var matches = priorityRegex.exec(query)
        if(matches && matches.length == 4) {
      		priorityText = matches[3];
          if(priorityText[0]=="l") priority = 1;
          else if(priorityText[0]=="m") priority = 2;
          else if(priorityText[0]=="h") priority = 3;
      		query = matches[1];
        } else {
          // test for hi!, med p, low priority, etc
        	// http://regexr.com/3er7i
          var priorityRegex = /(.+)\s(l|lo|low|m|med|medium|h|hi|high)(\s+priority|\s*p|\s*!)\s*$/i
        	var matches = priorityRegex.exec(query)
          if(matches && matches.length == 4) {
        		priorityText = matches[2];
            if(priorityText[0]=="l") priority = 1;
            else if(priorityText[0]=="m") priority = 2;
            else if(priorityText[0]=="h") priority = 3;
        		query = matches[1];
          }
        }
      }
    }
  }

  if (priority != "") {
    if ($.getenv('reverse_priority') == 1) {
        priority = [0, 9, 5, 1][priority]
    } else {
        priority = [0, 1, 5, 9][priority]
    }
  }

  // extract application
  var application = "",
    reminderBody = "";
  // test for "this" keyword
  // http://regexr.com/3er84
  var thisRegex = /^this$|^this\s(.*)/i
  var matches = thisRegex.exec(query)
  if(matches && matches.length == 2) {
    query = matches[1];
    var app = Application("System Events").applicationProcesses.where({
       frontmost: true
    })[0];
    var currentApplication = app.properties().name;
    console.log(currentApplication);
    application = supportedReminderApplications.find(function (a) {
  		return a.appname == currentApplication;
  	});

    if(!application) {
      // terminate with an unactionable message that current application is not supported
      var item = {title:"Add Reminder", arg:-1, valid:false, subtitle:currentApplication + " is not supported by this workflow at this time", icon:{path:"Instruments.png"}};
      return {items:[item]};
    }

    // get application-specific data
    application['text'] = eval(application['reminderText']);
    console.log(application['text']);
    application['body'] = eval(application['reminderBody'])
    console.log(application['body']);

  }

	results = window.chrono.parse(query);
	var now = new Date();
	
	for (var i = 0; i < results.length; i++) {
		resultText = query.replace(results[i].text,'');
		var d = results[i].start.date(); // Create a Date object
		// If date is in the past, assume intended date is tomorrow
		if (d < now) {
			d.setDate(now.getDate() + 1);
		}
		var reminderText = resultText.trim();
		items.push(getAction({arg:i, valid:true, reminderText:reminderText, date:d, whenText:results[i].text, priority:priority, reminderList:reminderList}));
		reminders.push(getReminderData({arg:i, reminderText:reminderText, reminderBody:reminderBody, date:d, list:"", priority:priority, application:application, reminderList:reminderList}));
	}

	// always submit non-dated item
	items.push(getAction({arg:-1, valid:true, reminderText:query, priority:priority, application:application, reminderList:reminderList}));
	reminders.push(getReminderData({arg:-1, reminderText:query, reminderBody:"", date:"", list:"", priority:priority, application:application, reminderList:reminderList}));

	parsedReminder['items'] = items;
	parsedReminder['reminders'] = reminders;
	
	return parsedReminder;
}


function showHelpItems() {
  var helpItems = [
  	"do something crazy",
	"today release the hamsters into the wild",
	"tomorrow bring about financial ruin upon my enemies",
	"in 5 minutes drop everything",
	"in 2 hours laugh out loud in Reminders list",
	"in 3 days 1 hour pick stuff up off the floor",
	"24/12/13 to forget everything I know about things in movies",
	"12 June 15 to come up with some interesting ideas",
	"31-12-99 23:22 panic about the millennium bug",
	"at 2pm wait for nothing in particular", 
	"next thursday at 15.30 ask some difficult questions",
	"!!! in 2 weeks an important meeting",
	"thursday have a banana medium priority",
	"decide what to have for lunch !lo",
	"make a turkey sandwich p3",
	"this",
  ],
  	parsedReminder = {},
  	items = [],
  	reminders = [];
  
  for (var i = 0; i < helpItems.length; i++) {
  	var parsedReminder = parseReminderQuery(helpItems[i]);
	console.log(helpItems[i]);
	if(parsedReminder['items']) {
		item = parsedReminder['items'][0];
		item['title'] = "r " + helpItems[i];
		item['valid'] = false;
		items.push(item);
	}
	if(parsedReminder['reminders']) {
		reminders.push(parsedReminder['reminders'][0]);
	}
  }
  
  parsedReminder['items'] = items;
  parsedReminder['reminders'] = reminders;
	
  return parsedReminder;
 }