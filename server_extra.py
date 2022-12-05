from flask import send_file

def extra_server_init(app):
    @app.route('/')
    @app.route('/<path:path>')
    def mapali(subpath=None):
        return send_file(f'ui/dist/ui/index.html')
