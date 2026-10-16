"""Servidor local do jogo (só arquivos estáticos).

Rodar:  python server.py   ->  http://localhost:8000
"""
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')  # senão o navegador mostra versão velha do jogo
        super().end_headers()


if __name__ == '__main__':
    pasta = os.path.dirname(os.path.abspath(__file__))
    print('Jogo rodando em http://localhost:8000')
    ThreadingHTTPServer(('', 8000), partial(Handler, directory=pasta)).serve_forever()
