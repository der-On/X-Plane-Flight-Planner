from BaseHTTPServer import HTTPServer,BaseHTTPRequestHandler
from urlparse import urlparse

lat = 0;
lon = 0;
heading = 0;

# define server
global httpd
httpd = None

class server(HTTPServer):
  allow_reuse_address = True

class request(BaseHTTPRequestHandler):
  def do_GET(self):
    global lat
    global lon
    global heading
    res = str({'lat':lat,'lon':lon,'heading':heading})

    if('?' in self.path):
      req = self.path.split('?')[1].split(' ')[0]
      params = dict([part.split('=') for part in req.split('&')])
      if('lat' in params):
        lat = float(params['lat'])
      if('lon' in params):
        lon = float(params['lon'])
      if('heading' in params):
        heading = float(params['heading'])
      if('callback' in params):
        res = params['callback']+'('+res+')'

    self.send_response(200)
    #self.send_header('Connection','keep-alive')
    self.send_header('Content-Length',str(len(res)))
    self.send_header('Content-Type', 'application/json; charset=utf-8')
    self.end_headers()
    self.wfile.write(res)
    return

def run(server_class=HTTPServer, handler_class=BaseHTTPRequestHandler):
  global httpd
  server_address = ('', 3001)
  httpd = server_class(server_address, handler_class)
  httpd.serve_forever()

def stop():
  global httpd
  httpd.socket.close()

run(server_class=server,handler_class=request)
