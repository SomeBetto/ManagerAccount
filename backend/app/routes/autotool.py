import os
import time
import struct
import ctypes
import threading
from flask import Blueprint, jsonify, request

bp = Blueprint('autotool', __name__, url_prefix='/api/autotool')

# Global state for Auto Ress
autoress_enabled = False
ress_count = 0
ress_lock = threading.Lock()

# Template check pixels for the "Accept" button
# Structure: (dx, dy, (r, g, b))
BTN_CHECKS = [
    (34, 14, (255, 244, 204)),
    (56, 16, (255, 244, 204)),
    (72, 16, (255, 244, 204)),
    (4, 8, (247, 225, 177)),
    (98, 8, (248, 222, 167)),
    (20, 8, (255, 223, 154)),
    (86, 22, (206, 173, 72)),
    (14, 22, (198, 165, 67)),
    (46, 4, (116, 107, 85)),
    (82, 4, (116, 107, 85))
]

def log_debug(msg):
    try:
        log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "log", "autoress.log")
        log_dir = os.path.dirname(log_path)
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {msg}\n")
    except Exception:
        pass

def find_in_bgra_buffer(buf, width, height, checks, template_w=100, template_h=24, tolerance=25):
    first_dx, first_dy, (first_r, first_g, first_b) = checks[0]
    other_checks = checks[1:]
    
    for y in range(0, height - template_h):
        for x in range(0, width - template_w):
            idx = ((y + first_dy) * width + x + first_dx) * 4
            if idx + 2 >= len(buf):
                continue
            b = buf[idx]
            g = buf[idx+1]
            r = buf[idx+2]
            
            if abs(r - first_r) <= tolerance and abs(g - first_g) <= tolerance and abs(b - first_b) <= tolerance:
                match_ok = True
                for dx, dy, (tr, tg, tb) in other_checks:
                    oidx = ((y + dy) * width + x + dx) * 4
                    if oidx + 2 >= len(buf):
                        match_ok = False
                        break
                    ob = buf[oidx]
                    og = buf[oidx+1]
                    or_ = buf[oidx+2]
                    
                    if abs(or_ - tr) > tolerance or abs(og - tg) > tolerance or abs(ob - tb) > tolerance:
                        match_ok = False
                        break
                if match_ok:
                    return x, y
    return None

class RECT(ctypes.Structure):
    _fields_ = [
        ("left", ctypes.c_long),
        ("top", ctypes.c_long),
        ("right", ctypes.c_long),
        ("bottom", ctypes.c_long)
    ]

class POINT(ctypes.Structure):
    _fields_ = [
        ("x", ctypes.c_long),
        ("y", ctypes.c_long)
    ]

def get_game_hwnds():
    user32 = ctypes.windll.user32
    WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    hwnds = []
    
    def callback(hwnd, lParam):
        if not user32.IsWindowVisible(hwnd):
            return True
        class_buffer = ctypes.create_unicode_buffer(256)
        user32.GetClassNameW(hwnd, class_buffer, 256)
        class_name = class_buffer.value.lower()
        
        length = user32.GetWindowTextLengthW(hwnd)
        title = ""
        if length > 0:
            buffer = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buffer, length + 1)
            title = buffer.value.lower()
        
        is_manager = (
            "manager" in title or 
            "consolewindowclass" in class_name or 
            "chrome" in class_name or 
            "mozilla" in class_name or 
            "firefox" in class_name or 
            "msedge" in class_name or
            "opera" in class_name
        )
        
        match = (
            ("flyff" in title or "neuz" in title or "login" in title or "neuz" in class_name or "flyff" in class_name)
            and not is_manager
        )
        if match:
            hwnds.append(hwnd)
        return True
        
    user32.EnumWindows(WNDENUMPROC(callback), 0)
    return hwnds

def force_foreground(hwnd):
    user32 = ctypes.windll.user32
    kernel32 = ctypes.windll.kernel32
    
    fg_hwnd = user32.GetForegroundWindow()
    if fg_hwnd == hwnd:
        return True
        
    fg_thread = user32.GetWindowThreadProcessId(fg_hwnd, None)
    my_thread = kernel32.GetCurrentThreadId()
    
    attached = False
    if fg_thread != 0 and my_thread != fg_thread:
        attached = user32.AttachThreadInput(my_thread, fg_thread, True)
        
    user32.keybd_event(0x12, 0, 0, 0)
    user32.keybd_event(0x12, 0, 2, 0)
    
    if user32.IsIconic(hwnd):
        user32.ShowWindow(hwnd, 9)
    else:
        user32.ShowWindow(hwnd, 5)
    time.sleep(0.1)
    
    # Force Z-order to the top using SetWindowPos
    user32.SetWindowPos(hwnd, -1, 0, 0, 0, 0, 0x0002 | 0x0001 | 0x0040) # HWND_TOPMOST, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW
    user32.SetWindowPos(hwnd, -2, 0, 0, 0, 0, 0x0002 | 0x0001 | 0x0040) # HWND_NOTOPMOST
    
    res = user32.SetForegroundWindow(hwnd)
    user32.BringWindowToTop(hwnd)
    user32.SetActiveWindow(hwnd)
    
    if attached:
        user32.AttachThreadInput(my_thread, fg_thread, False)
        
    return res

def autoress_worker():
    global autoress_enabled, ress_count
    user32 = ctypes.windll.user32
    gdi32 = ctypes.windll.gdi32

    # Enable DPI awareness in worker thread for correct coordinate capture
    try:
        user32.SetProcessDPIAware()
    except Exception as ex:
        log_debug(f"SetProcessDPIAware failed: {ex}")

    log_debug("Background Auto Ress worker thread started")

    while True:
        try:
            if not autoress_enabled:
                time.sleep(1.0)
                continue
                
            hwnds = get_game_hwnds()
            for hwnd in hwnds:
                rect = RECT()
                user32.GetClientRect(hwnd, ctypes.byref(rect))
                w = rect.right - rect.left
                h = rect.bottom - rect.top
                if w <= 0 or h <= 0:
                    continue
                
                # Setup client DC
                hwndDC = user32.GetDC(hwnd)
                mfcDC = gdi32.CreateCompatibleDC(hwndDC)
                saveBitMap = gdi32.CreateCompatibleBitmap(hwndDC, w, h)
                gdi32.SelectObject(mfcDC, saveBitMap)
                
                # Perform background capture
                res_capture = gdi32.BitBlt(mfcDC, 0, 0, w, h, hwndDC, 0, 0, 0x00CC0020) # SRCCOPY
                if not res_capture:
                    user32.PrintWindow(hwnd, mfcDC, 1) # PW_CLIENTONLY
                    
                # Read bits
                bmp_header = struct.pack("IiiHHIIiiII", 40, w, -h, 1, 32, 0, w * h * 4, 0, 0, 0, 0)
                buf = ctypes.create_string_buffer(w * h * 4)
                gdi32.GetDIBits(mfcDC, saveBitMap, 0, h, buf, bmp_header, 0)
                
                # Cleanup initial background GDI objects
                gdi32.DeleteObject(saveBitMap)
                gdi32.DeleteDC(mfcDC)
                user32.ReleaseDC(hwnd, hwndDC)
                
                # Check if buffer is empty/black (common for GPU acceleration redirection)
                empty = True
                for val in buf.raw[:4000]:
                    if val != 0:
                        empty = False
                        break
                        
                # Fallback to Screen DC capture if background GDI yielded a black image
                if empty:
                    desktopDC = user32.GetDC(0)
                    mfcDC = gdi32.CreateCompatibleDC(desktopDC)
                    saveBitMap = gdi32.CreateCompatibleBitmap(desktopDC, w, h)
                    gdi32.SelectObject(mfcDC, saveBitMap)
                    
                    pt = POINT(0, 0)
                    user32.ClientToScreen(hwnd, ctypes.byref(pt))
                    screen_x = pt.x
                    screen_y = pt.y
                    
                    gdi32.BitBlt(mfcDC, 0, 0, w, h, desktopDC, screen_x, screen_y, 0x00CC0020)
                    gdi32.GetDIBits(mfcDC, saveBitMap, 0, h, buf, bmp_header, 0)
                    
                    gdi32.DeleteObject(saveBitMap)
                    gdi32.DeleteDC(mfcDC)
                    user32.ReleaseDC(0, desktopDC)
                    
                    # Recheck if now we got data
                    empty = True
                    for val in buf.raw[:4000]:
                        if val != 0:
                            empty = False
                            break
                
                if empty:
                    continue # Skip window if we still got empty frame
                
                # Perform template search in memory
                res_coords = find_in_bgra_buffer(buf.raw, w, h, BTN_CHECKS)
                if res_coords:
                    x_local, y_local = res_coords
                    click_x = x_local + 50
                    click_y = y_local + 12
                    
                    log_debug(f"Detected resurrection window in HWND={hwnd} at client coordinates ({x_local}, {y_local})")
                    
                    orig_fg_hwnd = user32.GetForegroundWindow()
                    orig_cursor_pos = POINT()
                    user32.GetCursorPos(ctypes.byref(orig_cursor_pos))
                    
                    focused = force_foreground(hwnd)
                    time.sleep(0.2) # Let window paint and activate
                    
                    # Safety release for Alt key in case it got stuck during focus transfer
                    user32.keybd_event(0x12, 0, 2, 0) # Alt UP
                    
                    pt = POINT(0, 0)
                    user32.ClientToScreen(hwnd, ctypes.byref(pt))
                    click_screen_x = pt.x + click_x
                    click_screen_y = pt.y + click_y
                    
                    # Move cursor and wait 0.2s for the game engine to update its mouse position
                    user32.SetCursorPos(click_screen_x, click_screen_y)
                    time.sleep(0.2)
                    
                    # Send mouse click with proper press duration
                    user32.mouse_event(0x0002, 0, 0, 0, 0) # LEFTDOWN
                    time.sleep(0.1)
                    user32.mouse_event(0x0004, 0, 0, 0, 0) # LEFTUP
                    
                    # Wait 0.2 seconds to let the game process the release event before restoring focus
                    time.sleep(0.2)
                    
                    # Restore mouse cursor position and active window safely
                    user32.SetCursorPos(orig_cursor_pos.x, orig_cursor_pos.y)
                    if orig_fg_hwnd and orig_fg_hwnd != hwnd:
                        force_foreground(orig_fg_hwnd)
                    
                    with ress_lock:
                        ress_count += 1
                        
                    log_debug(f"Emulated mouse click to HWND={hwnd} at screen ({click_screen_x}, {click_screen_y}). Success={focused}. Total Ress: {ress_count}")
                    time.sleep(2.0)
                    
            time.sleep(0.5)
        except Exception as e:
            log_debug(f"Error in worker loop: {e}")
            time.sleep(2.0)

t = threading.Thread(target=autoress_worker, daemon=True)
t.start()

@bp.route('/status', methods=['GET'])
def get_status():
    global autoress_enabled, ress_count
    return jsonify({
        'enabled': autoress_enabled,
        'count': ress_count
    })

@bp.route('/toggle', methods=['POST'])
def toggle_autoress():
    global autoress_enabled, ress_count
    data = request.json or {}
    enabled = data.get('enabled', False)
    
    autoress_enabled = enabled
    log_debug(f"Autoress toggled to: {autoress_enabled}")
    
    return jsonify({
        'enabled': autoress_enabled,
        'count': ress_count
    })

@bp.route('/test-match', methods=['GET'])
def test_match():
    user32 = ctypes.windll.user32
    gdi32 = ctypes.windll.gdi32
    
    try:
        user32.SetProcessDPIAware()
    except:
        pass

    hwnds = get_game_hwnds()
    results = []
    
    for hwnd in hwnds:
        length = user32.GetWindowTextLengthW(hwnd)
        title = ""
        if length > 0:
            buffer = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buffer, length + 1)
            title = buffer.value
            
        rect = RECT()
        user32.GetClientRect(hwnd, ctypes.byref(rect))
        w = rect.right - rect.left
        h = rect.bottom - rect.top
        
        if w <= 0 or h <= 0:
            results.append({
                'hwnd': hwnd,
                'title': title,
                'status': 'Zero client area'
            })
            continue
            
        # Test background capture
        hwndDC = user32.GetDC(hwnd)
        mfcDC = gdi32.CreateCompatibleDC(hwndDC)
        saveBitMap = gdi32.CreateCompatibleBitmap(hwndDC, w, h)
        gdi32.SelectObject(mfcDC, saveBitMap)
        
        gdi32.BitBlt(mfcDC, 0, 0, w, h, hwndDC, 0, 0, 0x00CC0020)
        
        bmp_header = struct.pack("IiiHHIIiiII", 40, w, -h, 1, 32, 0, w * h * 4, 0, 0, 0, 0)
        buf = ctypes.create_string_buffer(w * h * 4)
        gdi32.GetDIBits(mfcDC, saveBitMap, 0, h, buf, bmp_header, 0)
        
        gdi32.DeleteObject(saveBitMap)
        gdi32.DeleteDC(mfcDC)
        user32.ReleaseDC(hwnd, hwndDC)
        
        empty_bg = True
        for val in buf.raw[:4000]:
            if val != 0:
                empty_bg = False
                break
                
        empty_screen = True
        match_coords = None
        capture_type_used = 'background'
        
        if empty_bg:
            # Fallback test: Screen DC capture with Desktop DC compatibility
            desktopDC = user32.GetDC(0)
            mfcDC = gdi32.CreateCompatibleDC(desktopDC)
            saveBitMap = gdi32.CreateCompatibleBitmap(desktopDC, w, h)
            gdi32.SelectObject(mfcDC, saveBitMap)
            
            pt = POINT(0, 0)
            user32.ClientToScreen(hwnd, ctypes.byref(pt))
            screen_x = pt.x
            screen_y = pt.y
            
            gdi32.BitBlt(mfcDC, 0, 0, w, h, desktopDC, screen_x, screen_y, 0x00CC0020)
            gdi32.GetDIBits(mfcDC, saveBitMap, 0, h, buf, bmp_header, 0)
            
            gdi32.DeleteObject(saveBitMap)
            gdi32.DeleteDC(mfcDC)
            user32.ReleaseDC(0, desktopDC)
            
            capture_type_used = 'screen_fallback'
            empty_screen = True
            for val in buf.raw[:4000]:
                if val != 0:
                    empty_screen = False
                    break
        else:
            empty_screen = False
            
        # Search match if capture succeeded
        if not (empty_bg and empty_screen):
            match_coords = find_in_bgra_buffer(buf.raw, w, h, BTN_CHECKS)
            
        results.append({
            'hwnd': hwnd,
            'title': title,
            'size': f"{w}x{h}",
            'empty_on_background': empty_bg,
            'empty_on_screen_fallback': empty_screen if empty_bg else None,
            'capture_type_used': capture_type_used,
            'match_found': match_coords is not None,
            'match_coords': match_coords
        })
        
    return jsonify({
        'game_windows_count': len(hwnds),
        'windows': results
    })
