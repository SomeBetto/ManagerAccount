import ctypes

def init_dpi_awareness():
    # 1. Try Per Monitor V2 (Windows 10 1703+)
    try:
        user32 = ctypes.windll.user32
        user32.SetProcessDpiAwarenessContext.argtypes = [ctypes.c_void_p]
        if user32.SetProcessDpiAwarenessContext(-4):
            return True
    except Exception:
        pass

    # 2. Try Per Monitor (Windows 8.1+)
    try:
        shcore = ctypes.windll.shcore
        if shcore.SetProcessDpiAwareness(2) == 0:
            return True
    except Exception:
        pass

    # 3. Try System Aware (Windows Vista+)
    try:
        if ctypes.windll.user32.SetProcessDPIAware():
            return True
    except Exception:
        pass

    return False

init_dpi_awareness()

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

