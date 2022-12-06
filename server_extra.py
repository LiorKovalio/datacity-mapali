from flask import send_file

def extra_server_init(app):
    @app.route('/m/<id>')
    def mapali_maps(id=None):
        return send_file(f'ui/dist/ui/index.html')

    @app.route('/new')
    def mapali_new():
        return send_file(f'ui/dist/ui/index.html')

    @app.route('/')
    def mapali():
        return send_file(f'ui/dist/ui/index.html')

