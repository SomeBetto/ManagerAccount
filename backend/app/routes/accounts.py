from flask import Blueprint, request, jsonify
from app.excel_db import ExcelDB

bp = Blueprint('accounts', __name__, url_prefix='/api/accounts')

@bp.route('', methods=['POST'])
def create_account():
    data = request.json
    try:
        new_account = {
            'email': data['email'],
            'password': data['password'],
            'pin': data.get('pin'),
            'otp_token': data.get('otp_token')
        }
        inserted = ExcelDB.insert('accounts', new_account)
        return jsonify(inserted), 201
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('', methods=['GET'])
def get_accounts():
    try:
        accounts = ExcelDB.get_all('accounts')
        return jsonify(accounts)
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:id>', methods=['PUT'])
def update_account(id):
    data = request.json
    try:
        account = ExcelDB.get_by_id('accounts', id)
        if not account:
            return jsonify({'error': 'Not found'}), 404
            
        update_data = {}
        if 'email' in data: update_data['email'] = data['email']
        if 'password' in data: update_data['password'] = data['password']
        if 'pin' in data: update_data['pin'] = data['pin']
        if 'otp_token' in data: update_data['otp_token'] = data['otp_token']
        
        updated = ExcelDB.update('accounts', id, update_data)
        return jsonify(updated)
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:id>', methods=['DELETE'])
def delete_account(id):
    try:
        success = ExcelDB.delete('accounts', id)
        if success:
            # Optionally cascade delete related characters? Let's keep it simple for now as per old logic.
            return jsonify({'message': 'Account deleted successfully'})
        return jsonify({'error': 'Not found'}), 404
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/sharing', methods=['GET'])
def get_account_sharing():
    try:
        sharing = ExcelDB.get_all('account_sharing')
        return jsonify(sharing)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:acc_id>/sharing', methods=['POST'])
def save_account_sharing(acc_id):
    try:
        data = request.json or {}
        all_s = ExcelDB.get_all('account_sharing')
        existing = [s for s in all_s if str(s.get('account_id')) == str(acc_id)]
        
        save_data = {
            'account_id': acc_id,
            'status': data.get('status', 'Personal'),
            'borrowed_to': data.get('borrowed_to', ''),
            'notes': data.get('notes', ''),
            'tags': data.get('tags', '')
        }

        if existing:
            updated = ExcelDB.update('account_sharing', existing[0]['id'], save_data)
            return jsonify(updated)
        else:
            inserted = ExcelDB.insert('account_sharing', save_data)
            return jsonify(inserted), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/batch-delete', methods=['POST'])
def batch_delete_accounts():
    data = request.json
    ids = data.get('ids', [])
    if not ids:
        return jsonify({'error': 'No IDs provided'}), 400
    try:
        count = 0
        for i in ids:
            if ExcelDB.delete('accounts', int(i)):

                count += 1
        return jsonify({'message': f'Deleted {count} accounts'})
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/launch', methods=['POST'])
def launch_accounts():
    import os
    import subprocess
    import shlex
    from app.excel_db import get_config_key
    
    data = request.json or {}
    ids = data.get('ids', [])
    if not ids:
        return jsonify({'error': 'No se seleccionaron cuentas.'}), 400
        
    flyff_path = get_config_key('flyff_path')
    if not flyff_path or not os.path.exists(flyff_path):
        return jsonify({'error': 'La ruta del ejecutable de Flyff no está configurada o no existe. Por favor, configúrala en Ajustes.'}), 400
        
    flyff_params = get_config_key('flyff_params') or ''
    
    cmd_args = [flyff_path]
    if flyff_params:
        try:
            cmd_args.extend(shlex.split(flyff_params))
        except Exception:
            cmd_args.extend(flyff_params.split())
            
    launched_count = 0
    errors = []
    
    working_dir = os.path.dirname(flyff_path)
    
    for account_id in ids:
        try:
            # Popen with cwd is critical for resources loading in Flyff.
            # Using subprocess.Popen allows running independent background client instances.
            subprocess.Popen(
                cmd_args,
                cwd=working_dir,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                stdin=subprocess.DEVNULL,
                close_fds=True
            )
            launched_count += 1
        except Exception as e:
            from flask import current_app
            current_app.logger.error(f"Error lanzando Flyff para la cuenta {account_id}: {e}", exc_info=True)
            errors.append(f"Cuenta {account_id}: {str(e)}")
            
    if errors and launched_count == 0:
        return jsonify({'error': 'No se pudo iniciar ningún cliente.', 'details': errors}), 500
        
    return jsonify({
        'message': f'Iniciadas {launched_count} instancias de Flyff con éxito.',
        'launched': launched_count,
        'errors': errors
    }), 200

@bp.route('/<int:id>/autologin', methods=['POST'])
def autologin_account(id):
    try:
        account = ExcelDB.get_by_id('accounts', id)
        if not account:
            return jsonify({'error': 'Not found'}), 404
            
        email = account.get('email', '')
        password = account.get('password', '')
        
        import os
        import subprocess
        import shlex
        from app.excel_db import get_config_key
        
        # Debug Logger for auto-login focus troubleshooting
        def log_debug(msg):
            import time
            try:
                log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "autologin_debug.log")
                with open(log_path, "a", encoding="utf-8") as f:
                    f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {msg}\n")
            except Exception as e:
                pass

        flyff_path = get_config_key('flyff_path')
        flyff_params = get_config_key('flyff_params') or ''

        log_debug("--- NEW AUTO-LOGIN INVOCATION ---")
        log_debug(f"Target Account: ID={id}, Email='{email}'")
        log_debug(f"flyff_path configured: '{flyff_path}' (exists: {os.path.exists(flyff_path) if flyff_path else False})")
        log_debug(f"flyff_params configured: '{flyff_params}'")
        
        import ctypes
        user32 = ctypes.windll.user32
        
        WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
        
        def get_flyff_hwnds():
            hwnds = []
            def callback(hwnd, lParam):
                visible = user32.IsWindowVisible(hwnd)
                
                # Check class name
                class_buffer = ctypes.create_unicode_buffer(256)
                user32.GetClassNameW(hwnd, class_buffer, 256)
                class_name = class_buffer.value.lower()
                
                # Check title
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
                    log_debug(f"Window Match: HWND={hwnd}, Title='{title}', Class='{class_name}', Visible={visible}")
                    if visible:
                        hwnds.append(hwnd)
                return True
            user32.EnumWindows(WNDENUMPROC(callback), 0)
            return hwnds
            
        existing_hwnds = get_flyff_hwnds()
        log_debug(f"Existing Flyff HWNDs before launch: {existing_hwnds}")
        
        # Launch client if path is configured
        if flyff_path and os.path.exists(flyff_path):
            try:
                working_dir = os.path.dirname(flyff_path)
                cmd_args = [flyff_path]
                if flyff_params:
                    try:
                        cmd_args.extend(shlex.split(flyff_params))
                    except Exception:
                        cmd_args.extend(flyff_params.split())
                log_debug(f"Launching client with args: {cmd_args}")
                subprocess.Popen(
                    cmd_args,
                    cwd=working_dir,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    stdin=subprocess.DEVNULL,
                    close_fds=True
                )
            except Exception as e:
                from flask import current_app
                current_app.logger.error(f"Error launching Flyff in autologin: {e}", exc_info=True)
                log_debug(f"Error launching client: {e}")
        
        import threading
        
        def do_autologin():
            import time
            import ctypes
            
            user32 = ctypes.windll.user32
            kernel32 = ctypes.windll.kernel32
            
            log_debug("Background do_autologin thread started")
            
            is_new_window = False
            # Wait for a new window to appear (up to 30 seconds)
            hwnd = None
            log_debug("Waiting for new Flyff window to appear...")
            for i in range(60):
                current_hwnds = get_flyff_hwnds()
                new_hwnds = [h for h in current_hwnds if h not in existing_hwnds]
                if new_hwnds:
                    hwnd = new_hwnds[0]
                    is_new_window = True
                    log_debug(f"New Flyff window detected on iteration {i}: HWND={hwnd}")
                    break
                time.sleep(0.5)
                
            # If no new window appeared, fallback to any existing Flyff window
            if not hwnd:
                log_debug("No new Flyff window detected after 30 seconds. Falling back to any visible Flyff window...")
                current_hwnds = get_flyff_hwnds()
                if current_hwnds:
                    hwnd = current_hwnds[0]
                    is_new_window = False
                    log_debug(f"Fallback window selected: HWND={hwnd}")
                else:
                    log_debug("No visible Flyff windows found at all.")
                    
            # If a window was found, restore, focus and click it
            x, y = 0, 0
            if hwnd:
                log_debug(f"Targeting window HWND={hwnd} for activation")
                log_debug("Sleeping 1.0 second to settle window...")
                time.sleep(1.0)
                
                # Enable DPI awareness for correct coordinate mappings
                try:
                    user32.SetProcessDPIAware()
                    log_debug("DPI awareness enabled successfully")
                except Exception as ex:
                    log_debug(f"SetProcessDPIAware failed: {ex}")
                
                # Bypass Windows focus stealing prevention by emulating a dummy Alt key press
                log_debug("Sending Alt key down/up events to bypass focus block")
                user32.keybd_event(0x12, 0, 0, 0) # Alt down
                user32.keybd_event(0x12, 0, 2, 0) # Alt up
                
                if user32.IsIconic(hwnd):
                    log_debug("Window is minimized, calling ShowWindow with SW_RESTORE")
                    user32.ShowWindow(hwnd, 9)  # SW_RESTORE
                else:
                    log_debug("Window is not minimized, calling ShowWindow with SW_SHOW")
                    user32.ShowWindow(hwnd, 5)  # SW_SHOW
                    
                time.sleep(0.2)
                
                log_debug("Calling SetForegroundWindow, BringWindowToTop, and SetActiveWindow")
                res_fg = user32.SetForegroundWindow(hwnd)
                user32.BringWindowToTop(hwnd)
                time.sleep(0.2)
                user32.SetActiveWindow(hwnd)
                
                log_debug(f"SetForegroundWindow returned: {res_fg}, Active HWND now is: {user32.GetForegroundWindow()}")
                
                time.sleep(1.5)  # Wait for window repaint/activation to settle
                
                # Get window rect
                class RECT(ctypes.Structure):
                    _fields_ = [
                        ("left", ctypes.c_long),
                        ("top", ctypes.c_long),
                        ("right", ctypes.c_long),
                        ("bottom", ctypes.c_long)
                    ]
                rect = RECT()
                user32.GetWindowRect(hwnd, ctypes.byref(rect))
                log_debug(f"Window Rect: left={rect.left}, top={rect.top}, right={rect.right}, bottom={rect.bottom}")
                
                # Calculate center and emulate click
                x = (rect.left + rect.right) // 2
                y = (rect.top + rect.bottom) // 2
                log_debug(f"Moving cursor to ({x}, {y}) and sending mouse click")
                user32.SetCursorPos(x, y)
                time.sleep(0.3)
                user32.mouse_event(0x0002, 0, 0, 0, 0)  # LEFTDOWN
                time.sleep(0.1)
                user32.mouse_event(0x0004, 0, 0, 0, 0)  # LEFTUP
                time.sleep(0.5)
                log_debug("Initial focus click sent. Entering wait-for-Tab state.")
            else:
                log_debug("No target window was found. Emulation fallback delay active.")
                time.sleep(3.0)
                
            # Now wait for the user to press Tab to trigger the credentials writing!
            log_debug("Waiting for user to press TAB to begin credentials writing...")
            tab_pressed = False
            for _ in range(1200):  # Wait up to 120 seconds
                if user32.GetAsyncKeyState(0x09) & 0x8000:
                    tab_pressed = True
                    log_debug("Tab key press detected! Waiting for key release...")
                    while user32.GetAsyncKeyState(0x09) & 0x8000:
                        time.sleep(0.05)
                    log_debug("Tab key released. Settle delay...")
                    time.sleep(0.3)
                    break
                time.sleep(0.1)
                
            if not tab_pressed:
                log_debug("Timed out waiting for Tab key press. Aborting auto-login typing.")
                return
                
            # Bring it to front again and start typing immediately
            if hwnd:
                log_debug("Focusing game client...")
                user32.SetForegroundWindow(hwnd)
                time.sleep(0.3)
                
            # Typing credentials
            INPUT_KEYBOARD = 1
            KEYEVENTF_UNICODE = 0x0004
            KEYEVENTF_KEYUP = 0x0002
            
            class KEYBDINPUT(ctypes.Structure):
                _fields_ = [
                    ("wVk", ctypes.c_ushort),
                    ("wScan", ctypes.c_ushort),
                    ("dwFlags", ctypes.c_ulong),
                    ("time", ctypes.c_ulong),
                    ("dwExtraInfo", ctypes.c_void_p)
                ]
                
            class INPUT_UNION(ctypes.Union):
                _fields_ = [
                    ("ki", KEYBDINPUT),
                    ("dummy", ctypes.c_ubyte * 32)
                ]
                
            class INPUT(ctypes.Structure):
                _fields_ = [
                    ("type", ctypes.c_ulong),
                    ("union", INPUT_UNION)
                ]
                
            user32.SendInput.argtypes = [ctypes.c_uint, ctypes.POINTER(INPUT), ctypes.c_int]
            user32.SendInput.restype = ctypes.c_uint
            
            def send_char(char, up=False):
                flags = KEYEVENTF_UNICODE
                if up:
                    flags |= KEYEVENTF_KEYUP
                inp = INPUT()
                inp.type = INPUT_KEYBOARD
                inp.union.ki.wVk = 0
                inp.union.ki.wScan = ord(char)
                inp.union.ki.dwFlags = flags
                inp.union.ki.time = 0
                inp.union.ki.dwExtraInfo = None
                user32.SendInput(1, ctypes.byref(inp), ctypes.sizeof(inp))
                
            def press_vk(vk):
                user32.keybd_event(vk, 0, 0, 0)
                time.sleep(0.05)
                user32.keybd_event(vk, 0, KEYEVENTF_KEYUP, 0)
                time.sleep(0.05)
                
            # Type email
            for c in email:
                send_char(c)
                time.sleep(0.03)
                send_char(c, True)
                time.sleep(0.03)
                
            time.sleep(0.6)
            # Press Tab
            press_vk(0x09)
            time.sleep(0.6)
            
            # Type password
            for c in password:
                send_char(c)
                time.sleep(0.03)
                send_char(c, True)
                time.sleep(0.03)
                
            time.sleep(0.6)
            # Press Enter
            press_vk(0x0D)
            log_debug("Typing complete.")
            
        t = threading.Thread(target=do_autologin)
        t.start()
        
        return jsonify({'message': 'Auto-login y lanzamiento iniciado. El juego se abrirá, enfocará y logueará automáticamente.'}), 200
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400
