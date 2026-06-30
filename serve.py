#!/usr/bin/env python3
# Servidor estatico simples para testar o jogo localmente.
# Uso:  python3 serve.py   ->  abra http://localhost:8000/
import http.server, socketserver, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
PORT = 8000
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
print("Servindo em http://localhost:%d/  (Ctrl+C para parar)" % PORT)
socketserver.TCPServer(("", PORT), H).serve_forever()
