from flask import send_file

def extra_server_init(app):
    @app.route('/:id')
    def mapali_all(id=None):
        return send_file(f'ui/dist/ui/index.html')

    @app.route('/')
    def mapali():
        return send_file(f'ui/dist/ui/index.html')

