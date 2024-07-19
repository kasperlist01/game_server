from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='/app/frontend/build')


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    full_path = os.path.join(app.static_folder, path)
    print("Requested path:", path)
    print("Full path:", full_path)
    if path and os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
