from flask import Blueprint, request, jsonify
import base64
import cv2
import numpy as np
import zxingcpp

bp = Blueprint('otp', __name__, url_prefix='/api/otp')

@bp.route('/decode-qr', methods=['POST'])
def decode_qr():
    try:
        data = request.json or {}
        image_data_url = data.get('image')

        if not image_data_url:
            return jsonify({'error': 'No se proporcionó imagen'}), 400

        if ',' in image_data_url:
            header, encoded = image_data_url.split(',', 1)
        else:
            encoded = image_data_url

        img_bytes = base64.b64decode(encoded)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'error': 'No se pudo decodificar el formato de la imagen'}), 400

        # Try zxingcpp on original image
        results = zxingcpp.read_barcodes(img)

        # Fallback tries: Grayscale, resized, inverted threshold
        if not results:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            results = zxingcpp.read_barcodes(gray)

        if not results:
            # Try scaling image if low/high resolution
            h, w = img.shape[:2]
            resized = cv2.resize(img, (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)
            results = zxingcpp.read_barcodes(resized)

        if results:
            for result in results:
                if result.text:
                    return jsonify({'status': 'success', 'data': result.text})

        return jsonify({'error': 'No QR code found'}), 404
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
