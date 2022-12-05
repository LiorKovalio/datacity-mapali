from flask import send_file

def extra_server_init(app):
    @app.route('/')
    def mapali(subpath=None):
        return send_file(f'ui/dist/ui/mapali/index.html')
