var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	mime = require('mime'),
	chatServer = require('./server/chat_server'),
	cache = {};


//error 404
function send404(res) {
	res.writeHead(404, {'Content-Type': 'text/plain;charset=utf-8'});
	res.write("Ошибка 404, файл не найден.");
	res.end();
}


//отправка данных файла
function sendFile(res, filePath, fileContents) {
	res.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath)) + ';charset=utf-8'});
	res.end(fileContents);
}


//использование статических файлов
function serveStatic(res, cache, absPath) {
	//проверка факта кэширования файла в памяти
	if (cache[absPath]) {
		//обслуживание файла, находящегося в памяти
		sendFile(res, absPath, cache[absPath]);
	} else {
		//проверка факта существования файла
		fs.exists(absPath, function (exists) {
			if (exists) {
				fs.readFile(absPath, function (err, data) {
					if (err) {
						send404(res);
					} else {
						cache[absPath] = data;
						//обслуживание файла, считанного с диска
						sendFile(res, absPath, data);
					}
				});
			} else {
				//файла нет
				send404(res);
			}
		});
	}

}


//создаем сервер
var server = http.createServer(function (req, res) {
	var filePath = false;

	if (req.url == '/') {
		//файл по умолчанию
		filePath = 'public/index.html';
	} else {
		//преобразуем url адрес в относительный путь к файлу
		filePath = 'public' + req.url;
	}

	var absPath = './' + filePath;

	//обслуживание статического файла
	serveStatic(res, cache, absPath);
});


server.listen(8080, function() {
	console.log("Сервер запущен по адресу http://localhost:8080/");
});


chatServer.listen(server);