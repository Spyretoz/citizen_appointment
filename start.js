var mysql 		= require('mysql');
var express 	= require('express');
var session 	= require('express-session');
var bodyParser 	= require('body-parser');
var path 		= require('path');
const bcrypt 	= require('bcryptjs');

var connection = mysql.createConnection({
	host     : 'remotemysql.com',
	user     : 'mxtwQghqk9',
	password : 'T5QcolbEG7',
	database : 'mxtwQghqk9'
});


var app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) 
{
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/register', function(request, response) 
{
	response.sendFile(path.join(__dirname + '/signup.html'));
});

app.get('/appoin-list', function(request, response) 
{
	response.sendFile(path.join(__dirname + '/appointments.html'));
});

app.get('/newappoint', function(request, response) 
{
	response.sendFile(path.join(__dirname + '/create_appointment.html'));
});

app.get('/updata', function(request, response) 
{
	response.sendFile(path.join(__dirname + '/add_data.html'));
});

app.get('/Appointment', function (req, res) 
{
    res.sendFile(path.resolve("Appointment.css"));
});

// $2y$12$VeL65aPUkDKrlSyTXRlRsuyXmgruGWd9cDvjQ9tlUpqS3tC9hfDty
app.post('/auth', function(request, response) 
{
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) 
	{
		connection.query('SELECT * FROM citizen WHERE cit_username = ? AND cit_password = ?', [username, password], function(error, results, fields) 
		{
			if (results.length > 0) 
			{
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/newappoint');
			} 
			else 
			{
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} 
	else 
	{
		response.send('Please enter Username and Password!');
		response.end();
	}
});



// Insert a citizen
app.post('/register', function (req, res)
{
    connection.connect();
    var hash = bcrypt.hashSync(req.body.password, 12);
    var sql = "INSERT INTO citizen VALUES(0,'" + req.body.username + "','" + hash + "','" + req.body.firstname + "','" + req.body.lastname + "','" + req.body.fathersName + "','" + req.body.email + "',null, null, null, null, null, null)";
    console.log(sql);

    connection.query(sql, (err) => 
    {       
        var resultJson;
        if(!err)        
        {
            resultJson = JSON.stringify([{'ADD':'SUCCESS'}]);
            console.log(req.body);
        }
        else
        {
            resultJson = JSON.stringify([{'ADD':'FAIL'}]); 
            console.log("ERROR");
        }
        res.end(resultJson);
    });
    connection.end();

    res.redirect('/');
});


app.get('/appointments', function(request, response) 
{
	var username = request.session.username;

	console.log(username);
	if (request.session.loggedin) 
	{
		connection.query("SELECT * FROM appointment WHERE app_citizen = '" + username + "' AND `accepted`=1;", function(error, results, fields) 
		{
			if (error) throw error;
			console.log(results);
   			response.send(results);       
		});
	}
	else 
	{
		response.send('Please login to view this page!');
	}
});


app.post('/appointment', function(req, res) 
{
	var username = req.session.username;
	console.log(username);
	if (req.session.loggedin) 
	{
    	var sql = "INSERT INTO appointment VALUES(0,'" + req.body.app_time + "','" + req.body.app_date + "','" + username + "','" + req.body.app_carrier + "','" + req.body.app_extraINFO + "',0)";
    	console.log(sql);

    	connection.query(sql, (err) => 
    	{       
        	var resultJson;
        	if(!err)        
        	{
            	resultJson = JSON.stringify([{'ADD':'SUCCESS'}]);
            	console.log(req.body);
            	res.redirect('/appoin-list');
        	}
        	else
        	{
          		resultJson = JSON.stringify([{'ADD':'FAIL'}]); 
            	console.log("ERROR");
        	}
        	res.end(resultJson);
    	});
	} 
	else 
	{
		response.send('Please login to view this page!');
	}
});


app.post('/update', function(req, res) 
{
	var username = req.session.username;
	console.log(username);
	if (req.session.loggedin) 
	{
    	var sql = "UPDATE citizen SET phoneNumber = '" + req.body.phoneNumber + "', birthDate = '" + req.body.birthDate + "', afm = '" + req.body.AFM + "', amka = '" + req.body.AMKA + "', county = '" + req.body.county + "', city = '" + req.body.city + "' WHERE cit_username = '" + username + "';";
    	console.log(sql);

    	connection.query(sql, (err) => 
    	{       
        	var resultJson;
        	if(!err)        
        	{
            	resultJson = JSON.stringify([{'ADD':'SUCCESS'}]);
            	console.log(req.body);
            	res.redirect('/appoin-list');
        	}
        	else
        	{
          		resultJson = JSON.stringify([{'ADD':'FAIL'}]); 
            	console.log("ERROR");
        	}
        	res.end(resultJson);
    	});
	} 
	else 
	{
		response.send('Please login to view this page!');
	}
});



var server = app.listen(8081, function()
{
    var host = server.address().address;
    var port = server.address().port;
    console.log(`Example app listening at http://${host}:${port}`);
});