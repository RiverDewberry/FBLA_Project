all: server

server:
	npx http-server --mimetypes ./mime.types -c-1 -o -p 9999
	#this starts up a temporary http-server for testing purposes
