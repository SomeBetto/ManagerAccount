import os
import time
import ctypes
import threading
from flask import Blueprint, jsonify, request

bp = Blueprint('buffpang', __name__, url_prefix='/api/buffpang')

# Win32 Constants
WM_ACTIVATE = 0x0006
WM_NCACTIVATE = 0x0086
WA_ACTIVE = 1

WM_KEYDOWN = 0x0100
WM_KEYUP = 0x0101
WM_CHAR = 0x0102
WM_SYSKEYDOWN = 0x0104
WM_SYSKEYUP = 0x0105
VK_MENU = 0x12
VK_SPACE = 0x20

# Virtual Key Mapping Dictionary
KEY_MAP = {
    '1': 0x31, '2': 0x32, '3': 0x33, '4': 0x34, '5': 0x35,
    '6': 0x36, '7': 0x37, '8': 0x38, '9': 0x39, '0': 0x30,
    'f1': 0x70, 'f2': 0x71, 'f3': 0x72, 'f4': 0x73, 'f5': 0x74,
    'f6': 0x75, 'f7': 0x76, 'f8': 0x77, 'f9': 0x78, 'f10': 0x79,
    'space': VK_SPACE, 'espacio': VK_SPACE,
    'alt+1': 0x31, 'alt+2': 0x32, 'alt+3': 0x33, 'alt+4': 0x34, 'alt+5': 0x35,
    'alt+6': 0x36, 'alt+7': 0x37, 'alt+8': 0x38, 'alt+9': 0x39, 'alt+0': 0x30
}

# Win32 SendInput Structures
class KEYBDINPUT(ctypes.Structure):
    _fields_ = [
        ("wVk", ctypes.c_ushort),
        ("wScan", ctypes.c_ushort),
        ("dwFlags", ctypes.c_ulong),
        ("time", ctypes.c_ulong),
        ("dwExtraInfo", ctypes.POINTER(ctypes.c_ulong))
    ]

class HARDWAREINPUT(ctypes.Structure):
    _fields_ = [
        ("uMsg", ctypes.c_ulong),
        ("wParamL", ctypes.c_ushort),
        ("wParamH", ctypes.c_ushort)
    ]

class MOUSEINPUT(ctypes.Structure):
    _fields_ = [
        ("dx", ctypes.c_long),
        ("dy", ctypes.c_long),
        ("mouseData", ctypes.c_ulong),
        ("dwFlags", ctypes.c_ulong),
        ("time", ctypes.c_ulong),
        ("dwExtraInfo", ctypes.POINTER(ctypes.c_ulong))
    ]

class INPUT_UNION(ctypes.Union):
    _fields_ = [
        ("ki", KEYBDINPUT),
        ("mi", MOUSEINPUT),
        ("hi", HARDWAREINPUT)
    ]

class INPUT(ctypes.Structure):
    _fields_ = [
        ("type", ctypes.c_ulong),
        ("union", INPUT_UNION)
    ]

KEYEVENTF_KEYUP = 0x0002
KEYEVENTF_SCANCODE = 0x0008

# Global State for Tasks
active_tasks = {}
tasks_lock = threading.Lock()
task_counter = 0

def log_debug(msg):
    try:
        log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "log", "buffpang.log")
        log_dir = os.path.dirname(log_path)
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {msg}\n")
    except Exception:
        pass

def send_input_key(vk_code, scan_code, is_keyup=False):
    """Sends native hardware keyboard event using SendInput API."""
    user32 = ctypes.windll.user32
    flags = KEYEVENTF_SCANCODE
    if is_keyup:
        flags |= KEYEVENTF_KEYUP
        
    inp = INPUT()
    inp.type = 1 # INPUT_KEYBOARD
    inp.union.ki.wVk = vk_code
    inp.union.ki.wScan = scan_code
    inp.union.ki.dwFlags = flags
    inp.union.ki.time = 0
    inp.union.ki.dwExtraInfo = None
    
    user32.SendInput(1, ctypes.byref(inp), ctypes.sizeof(INPUT))

def get_flyff_clients():
    """Enumerates running Flyff clients and returns list of dicts with PID, HWND, and Title."""
    clients = []
    try:
        user32 = ctypes.windll.user32
        WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
        
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
                title = buffer.value
            
            title_lower = title.lower()
            
            is_manager = (
                "manager" in title_lower or 
                "consolewindowclass" in class_name or 
                "chrome" in class_name or 
                "mozilla" in class_name or 
                "firefox" in class_name or 
                "msedge" in class_name or
                "opera" in class_name
            )
            
            match = (
                ("flyff" in title_lower or "neuz" in title_lower or "login" in title_lower or "neuz" in class_name or "flyff" in class_name)
                and not is_manager
            )
            
            if match:
                pid = ctypes.c_ulong()
                user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
                clients.append({
                    'hwnd': int(hwnd),
                    'pid': int(pid.value),
                    'title': title if title else f"Flyff Client (PID {pid.value})",
                    'class_name': class_buffer.value
                })
            return True
            
        user32.EnumWindows(WNDENUMPROC(callback), 0)
    except Exception as e:
        log_debug(f"Error enumerating Flyff clients: {e}")
        
    return clients

def force_foreground(hwnd):
    """Brings specified window handle to top and foreground without sending extra ALT key press."""
    user32 = ctypes.windll.user32
    kernel32 = ctypes.windll.kernel32
    
    try:
        if not user32.IsWindow(hwnd):
            return False
            
        fg_hwnd = user32.GetForegroundWindow()
        if fg_hwnd == hwnd:
            return True
            
        fg_thread = user32.GetWindowThreadProcessId(fg_hwnd, None)
        my_thread = kernel32.GetCurrentThreadId()
        
        attached = False
        if fg_thread != 0 and my_thread != fg_thread:
            attached = user32.AttachThreadInput(my_thread, fg_thread, True)
            
        if user32.IsIconic(hwnd):
            user32.ShowWindow(hwnd, 9)
        else:
            user32.ShowWindow(hwnd, 5)
        time.sleep(0.08)
        
        user32.SetWindowPos(hwnd, -1, 0, 0, 0, 0, 0x0002 | 0x0001 | 0x0040)
        user32.SetWindowPos(hwnd, -2, 0, 0, 0, 0, 0x0002 | 0x0001 | 0x0040)
        
        res = user32.SetForegroundWindow(hwnd)
        user32.BringWindowToTop(hwnd)
        user32.SetActiveWindow(hwnd)
        
        if attached:
            user32.AttachThreadInput(my_thread, fg_thread, False)
            
        return bool(res)
    except Exception as e:
        log_debug(f"Error bringing window to foreground: {e}")
        return False

def send_key_advanced(hwnd, key_str, method='background'):
    """
    Sends key to specified Flyff Neuz.exe HWND:
    - 'background': Direct PostMessage/SendMessage with OEM scan codes to Neuz.exe.
    - 'focus': Quick focus switch + physical SendInput.
    """
    user32 = ctypes.windll.user32
    kernel32 = ctypes.windll.kernel32
    
    key_clean = key_str.strip().lower()
    is_alt = key_clean.startswith('alt+')
    vk_code = KEY_MAP.get(key_clean)
    if not vk_code:
        log_debug(f"Invalid key code for string: {key_str}")
        return False
        
    scan_code = user32.MapVirtualKeyW(vk_code, 0) # MAPVK_VK_TO_VSC
    
    try:
        if method == 'focus':
            orig_fg = user32.GetForegroundWindow()
            if orig_fg != hwnd:
                force_foreground(hwnd)
                time.sleep(0.12)
                
            log_debug(f"Executing physical key '{key_str}' (VK {hex(vk_code)}, Scan {hex(scan_code)}) on focused HWND {hwnd}")
            if is_alt:
                send_input_key(VK_MENU, 0x38, False)
                user32.keybd_event(VK_MENU, 0x38, 0, 0)
                time.sleep(0.04)
                send_input_key(vk_code, scan_code, False)
                user32.keybd_event(vk_code, scan_code, 0, 0)
                time.sleep(0.10)
                send_input_key(vk_code, scan_code, True)
                user32.keybd_event(vk_code, scan_code, 2, 0)
                time.sleep(0.04)
                send_input_key(VK_MENU, 0x38, True)
                user32.keybd_event(VK_MENU, 0x38, 2, 0)
            else:
                send_input_key(vk_code, scan_code, False)
                user32.keybd_event(vk_code, scan_code, 0, 0)
                time.sleep(0.10)
                send_input_key(vk_code, scan_code, True)
                user32.keybd_event(vk_code, scan_code, 2, 0)
                
            time.sleep(0.06)
            if orig_fg and orig_fg != hwnd and user32.IsWindow(orig_fg):
                force_foreground(orig_fg)
            return True
            
        else:
            # Neuz.exe Classic Flyff Background Execution
            if user32.IsIconic(hwnd):
                user32.ShowWindow(hwnd, 4) # SW_SHOWNOACTIVATE
                
            target_thread = user32.GetWindowThreadProcessId(hwnd, None)
            my_thread = kernel32.GetCurrentThreadId()
            
            attached = False
            if target_thread != 0 and my_thread != target_thread:
                attached = user32.AttachThreadInput(my_thread, target_thread, True)
                
            try:
                # Activate internal Neuz.exe input handling without taking mouse focus
                user32.SendMessageW(hwnd, WM_NCACTIVATE, 1, 0)
                user32.SendMessageW(hwnd, WM_ACTIVATE, WA_ACTIVE, 0)
                
                # Collect main HWND and any child viewports
                targets = [hwnd]
                child_hwnds = []
                WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
                def child_cb(chwnd, lParam):
                    child_hwnds.append(chwnd)
                    return True
                user32.EnumChildWindows(hwnd, WNDENUMPROC(child_cb), 0)
                targets.extend(child_hwnds)
                
                lparam_down = 0x00000001 | (scan_code << 16)
                lparam_up = 0xC0000001 | (scan_code << 16)
                
                for thwnd in targets:
                    if is_alt:
                        lparam_sysdown = 0x20000001 | (scan_code << 16)
                        lparam_sysup = 0xE0000001 | (scan_code << 16)
                        user32.PostMessageW(thwnd, WM_SYSKEYDOWN, vk_code, lparam_sysdown)
                        user32.SendMessageW(thwnd, WM_SYSKEYDOWN, vk_code, lparam_sysdown)
                        time.sleep(0.06)
                        user32.PostMessageW(thwnd, WM_SYSKEYUP, vk_code, lparam_sysup)
                        user32.SendMessageW(thwnd, WM_SYSKEYUP, vk_code, lparam_sysup)
                    else:
                        # Send Key Down to Neuz window procedure
                        user32.PostMessageW(thwnd, WM_KEYDOWN, vk_code, lparam_down)
                        user32.SendMessageW(thwnd, WM_KEYDOWN, vk_code, lparam_down)
                        
                        # NOTE: WM_CHAR must ONLY be sent for Space (0x20) or Digits (0x30..0x39).
                        # Function Keys F1-F10 (0x70..0x79) MUST NOT send WM_CHAR as 0x71 is ASCII 'q'!
                        if vk_code == VK_SPACE or (0x30 <= vk_code <= 0x39):
                            user32.PostMessageW(thwnd, WM_CHAR, vk_code, lparam_down)
                            user32.SendMessageW(thwnd, WM_CHAR, vk_code, lparam_down)
                        
                        time.sleep(0.08) # Press duration
                        
                        # Send Key Up
                        user32.PostMessageW(thwnd, WM_KEYUP, vk_code, lparam_up)
                        user32.SendMessageW(thwnd, WM_KEYUP, vk_code, lparam_up)
                
                log_debug(f"Flyff Neuz background key '{key_str}' (VK {hex(vk_code)}, Scan {hex(scan_code)}) executed on HWND {hwnd}")
                return True
            finally:
                if attached:
                    user32.AttachThreadInput(my_thread, target_thread, False)

    except Exception as e:
        log_debug(f"Error in send_key_advanced ({key_str}, method={method}): {e}")
        return False

def send_key_down_advanced(hwnd, key_str, method='background'):
    user32 = ctypes.windll.user32
    kernel32 = ctypes.windll.kernel32
    
    key_clean = key_str.strip().lower()
    is_alt = key_clean.startswith('alt+')
    vk_code = KEY_MAP.get(key_clean)
    if not vk_code: return False
    scan_code = user32.MapVirtualKeyW(vk_code, 0)
    
    try:
        if method == 'focus':
            orig_fg = user32.GetForegroundWindow()
            if orig_fg != hwnd:
                force_foreground(hwnd)
                time.sleep(0.12)
            if is_alt:
                send_input_key(VK_MENU, 0x38, False)
                user32.keybd_event(VK_MENU, 0x38, 0, 0)
                time.sleep(0.03)
                send_input_key(vk_code, scan_code, False)
                user32.keybd_event(vk_code, scan_code, 0, 0)
            else:
                send_input_key(vk_code, scan_code, False)
                user32.keybd_event(vk_code, scan_code, 0, 0)
            return True
        else:
            target_thread = user32.GetWindowThreadProcessId(hwnd, None)
            my_thread = kernel32.GetCurrentThreadId()
            attached = False
            if target_thread != 0 and my_thread != target_thread:
                attached = user32.AttachThreadInput(my_thread, target_thread, True)
            try:
                user32.SendMessageW(hwnd, WM_NCACTIVATE, 1, 0)
                user32.SendMessageW(hwnd, WM_ACTIVATE, WA_ACTIVE, 0)
                
                targets = [hwnd]
                child_hwnds = []
                WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
                def child_cb(chwnd, lParam):
                    child_hwnds.append(chwnd)
                    return True
                user32.EnumChildWindows(hwnd, WNDENUMPROC(child_cb), 0)
                targets.extend(child_hwnds)
                
                for thwnd in targets:
                    if is_alt:
                        lparam_sysdown = 0x20000001 | (scan_code << 16)
                        user32.PostMessageW(thwnd, WM_SYSKEYDOWN, vk_code, lparam_sysdown)
                        user32.SendMessageW(thwnd, WM_SYSKEYDOWN, vk_code, lparam_sysdown)
                    else:
                        lparam_down = 0x00000001 | (scan_code << 16)
                        user32.PostMessageW(thwnd, WM_KEYDOWN, vk_code, lparam_down)
                        user32.SendMessageW(thwnd, WM_KEYDOWN, vk_code, lparam_down)
                        if vk_code == VK_SPACE or (0x30 <= vk_code <= 0x39):
                            user32.PostMessageW(thwnd, WM_CHAR, vk_code, lparam_down)
                            user32.SendMessageW(thwnd, WM_CHAR, vk_code, lparam_down)
                return True
            finally:
                if attached:
                    user32.AttachThreadInput(my_thread, target_thread, False)
    except Exception as e:
        log_debug(f"Error in send_key_down_advanced: {e}")
        return False

def send_key_up_advanced(hwnd, key_str, method='background'):
    user32 = ctypes.windll.user32
    kernel32 = ctypes.windll.kernel32
    
    key_clean = key_str.strip().lower()
    is_alt = key_clean.startswith('alt+')
    vk_code = KEY_MAP.get(key_clean)
    if not vk_code: return False
    scan_code = user32.MapVirtualKeyW(vk_code, 0)
    
    try:
        if method == 'focus':
            if is_alt:
                send_input_key(vk_code, scan_code, True)
                user32.keybd_event(vk_code, scan_code, 2, 0)
                send_input_key(VK_MENU, 0x38, True)
                user32.keybd_event(VK_MENU, 0x38, 2, 0)
            else:
                send_input_key(vk_code, scan_code, True)
                user32.keybd_event(vk_code, scan_code, 2, 0)
            return True
        else:
            target_thread = user32.GetWindowThreadProcessId(hwnd, None)
            my_thread = kernel32.GetCurrentThreadId()
            attached = False
            if target_thread != 0 and my_thread != target_thread:
                attached = user32.AttachThreadInput(my_thread, target_thread, True)
            try:
                targets = [hwnd]
                child_hwnds = []
                WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
                def child_cb(chwnd, lParam):
                    child_hwnds.append(chwnd)
                    return True
                user32.EnumChildWindows(hwnd, WNDENUMPROC(child_cb), 0)
                targets.extend(child_hwnds)
                
                for thwnd in targets:
                    if is_alt:
                        lparam_sysup = 0xE0000001 | (scan_code << 16)
                        user32.PostMessageW(thwnd, WM_SYSKEYUP, vk_code, lparam_sysup)
                        user32.SendMessageW(thwnd, WM_SYSKEYUP, vk_code, lparam_sysup)
                    else:
                        lparam_up = 0xC0000001 | (scan_code << 16)
                        user32.PostMessageW(thwnd, WM_KEYUP, vk_code, lparam_up)
                        user32.SendMessageW(thwnd, WM_KEYUP, vk_code, lparam_up)
                return True
            finally:
                if attached:
                    user32.AttachThreadInput(my_thread, target_thread, False)
    except Exception as e:
        log_debug(f"Error in send_key_up_advanced: {e}")
        return False

def task_worker(task_id):
    """Background worker thread for sending or holding configured keys."""
    log_debug(f"Task worker #{task_id} started")
    user32 = ctypes.windll.user32
    
    last_held_key = None
    last_held_hwnd = None
    last_held_method = 'background'

    try:
        while True:
            with tasks_lock:
                task = active_tasks.get(task_id)
                if not task or not task.get('running', False):
                    break
                hwnd = task['hwnd']
                keys = task['keys']
                interval = task.get('interval', 1.0)
                mode = task.get('mode', 'single')
                method = task.get('method', 'background')
                hold_duration = float(task.get('hold_duration', 0))
                
            if not user32.IsWindow(hwnd):
                log_debug(f"Window {hwnd} no longer valid. Stopping task #{task_id}")
                with tasks_lock:
                    if task_id in active_tasks:
                        active_tasks[task_id]['running'] = False
                break
                
            if mode == 'hold':
                # Hold mode: keep key pressed
                kstr = keys[0].get('key', '') if keys else ''
                if kstr:
                    last_held_key = kstr
                    last_held_hwnd = hwnd
                    last_held_method = method
                    held_time = 0.0
                    
                    log_debug(f"Holding key '{kstr}' down (method={method}) for task #{task_id} on HWND {hwnd}")
                    while True:
                        with tasks_lock:
                            if not active_tasks.get(task_id, {}).get('running', False):
                                break
                        if not user32.IsWindow(hwnd):
                            break
                            
                        send_key_down_advanced(hwnd, kstr, method)
                        time.sleep(0.05)
                        held_time += 0.05
                        
                        if hold_duration > 0 and held_time >= hold_duration:
                            break
                            
                    send_key_up_advanced(hwnd, kstr, method)
                    log_debug(f"Released held key '{kstr}' for task #{task_id}")
                    
                    if hold_duration > 0 and interval > 0:
                        sleep_needed = max(0.1, interval)
                        steps = int(sleep_needed / 0.1)
                        for _ in range(steps):
                            with tasks_lock:
                                if not active_tasks.get(task_id, {}).get('running', False):
                                    break
                            time.sleep(0.1)
                            
            elif mode == 'single':
                # Single key repeatedly every `interval` seconds
                for kitem in keys:
                    kstr = kitem.get('key', '')
                    if kstr:
                        send_key_advanced(hwnd, kstr, method)
                sleep_needed = max(0.1, interval)
                steps = int(sleep_needed / 0.1)
                for _ in range(steps):
                    with tasks_lock:
                        if not active_tasks.get(task_id, {}).get('running', False):
                            break
                    time.sleep(0.1)
            else:
                # Sequence of keys with delay between each key
                for kitem in keys:
                    with tasks_lock:
                        if not active_tasks.get(task_id, {}).get('running', False):
                            break
                    kstr = kitem.get('key', '')
                    kdelay = float(kitem.get('delay', 0.5))
                    if kstr:
                        send_key_advanced(hwnd, kstr, method)
                    time.sleep(max(0.05, kdelay))
                    
                sleep_needed = max(0.1, interval)
                steps = int(sleep_needed / 0.1)
                for _ in range(steps):
                    with tasks_lock:
                        if not active_tasks.get(task_id, {}).get('running', False):
                            break
                    time.sleep(0.1)
    finally:
        if last_held_key and last_held_hwnd and user32.IsWindow(last_held_hwnd):
            send_key_up_advanced(last_held_hwnd, last_held_key, last_held_method)
            log_debug(f"Safety key release sent for task #{task_id}")
            
    log_debug(f"Task worker #{task_id} stopped")

# API Routes
@bp.route('/clients', methods=['GET'])
def list_clients():
    """List open Flyff clients by PID and HWND."""
    clients = get_flyff_clients()
    return jsonify({
        'status': 'success',
        'count': len(clients),
        'clients': clients
    })

@bp.route('/show', methods=['POST'])
def show_client():
    """Brings selected Flyff client window to foreground."""
    data = request.json or {}
    hwnd = data.get('hwnd')
    pid = data.get('pid')
    
    if not hwnd:
        clients = get_flyff_clients()
        for c in clients:
            if c['pid'] == pid:
                hwnd = c['hwnd']
                break
                
    if not hwnd:
        return jsonify({'status': 'error', 'message': 'Cliente no encontrado o HWND no especificado.'}), 400
        
    success = force_foreground(int(hwnd))
    if success:
        return jsonify({'status': 'success', 'message': f'Ventana HWND {hwnd} (PID {pid}) traída al frente.'})
    else:
        return jsonify({'status': 'error', 'message': 'No se pudo enfocar la ventana seleccionada.'}), 500

@bp.route('/tasks', methods=['GET'])
def get_tasks():
    """Returns current active tasks."""
    with tasks_lock:
        task_list = []
        for tid, tinfo in active_tasks.items():
            task_list.append({
                'id': tid,
                'name': tinfo['name'],
                'pid': tinfo['pid'],
                'hwnd': tinfo['hwnd'],
                'running': tinfo['running'],
                'mode': tinfo['mode'],
                'method': tinfo.get('method', 'background'),
                'interval': tinfo['interval'],
                'hold_duration': tinfo.get('hold_duration', 0),
                'keys': tinfo['keys'],
                'toggle_key': tinfo.get('toggle_key', ''),
                'auto_enabled': tinfo.get('auto_enabled', False)
            })
        return jsonify({'status': 'success', 'tasks': task_list})

@bp.route('/tasks/start', methods=['POST'])
def start_task():
    """Creates and starts a new hotkey automation task without deleting existing ones."""
    global task_counter
    data = request.json or {}
    
    pid = data.get('pid')
    hwnd = data.get('hwnd')
    name = data.get('name', f"Buff Job PID {pid}")
    mode = data.get('mode', 'single')
    method = data.get('method', 'background')
    interval = float(data.get('interval', 2.0))
    hold_duration = float(data.get('hold_duration', 0.0))
    keys = data.get('keys', [])
    toggle_key = data.get('toggle_key', '')
    auto_enabled = bool(data.get('auto_enabled', False))
    
    if not hwnd or not keys:
        return jsonify({'status': 'error', 'message': 'Parámetros inválidos. Debe proporcionar HWND y al menos una tecla.'}), 400
        
    with tasks_lock:
        task_counter += 1
        task_id = task_counter
        
        task_data = {
            'id': task_id,
            'pid': pid,
            'hwnd': hwnd,
            'name': name,
            'mode': mode,
            'method': method,
            'interval': interval,
            'hold_duration': hold_duration,
            'keys': keys,
            'toggle_key': toggle_key,
            'auto_enabled': auto_enabled,
            'running': True
        }
        
        worker_thread = threading.Thread(target=task_worker, args=(task_id,), daemon=True)
        task_data['thread'] = worker_thread
        active_tasks[task_id] = task_data
        worker_thread.start()
        
        log_debug(f"Started task #{task_id} ('{name}') for PID {pid} (HWND {hwnd}), mode '{mode}', method '{method}', keys {keys}")
        
        return jsonify({
            'status': 'success',
            'message': f'Tarea #{task_id} ("{name}") iniciada para PID {pid}.',
            'task_id': task_id
        })

@bp.route('/tasks/stop', methods=['POST'])
def stop_task():
    """Stops a running task by task_id."""
    data = request.json or {}
    task_id = data.get('task_id')
    
    with tasks_lock:
        if task_id is None:
            for tid in active_tasks:
                active_tasks[tid]['running'] = False
            return jsonify({'status': 'success', 'message': 'Todas las tareas han sido detenidas.'})
            
        if task_id in active_tasks:
            active_tasks[task_id]['running'] = False
            return jsonify({'status': 'success', 'message': f'Tarea #{task_id} detenida.'})
        else:
            return jsonify({'status': 'error', 'message': f'Tarea #{task_id} no encontrada.'}), 404

@bp.route('/tasks/delete', methods=['POST'])
def delete_task():
    """Deletes a task completely from active_tasks dictionary."""
    data = request.json or {}
    task_id = data.get('task_id')
    
    with tasks_lock:
        if task_id in active_tasks:
            active_tasks[task_id]['running'] = False
            active_tasks.pop(task_id, None)
            return jsonify({'status': 'success', 'message': f'Tarea #{task_id} eliminada.'})
        else:
            return jsonify({'status': 'error', 'message': f'Tarea #{task_id} no encontrada.'}), 404

@bp.route('/tasks/toggle', methods=['POST'])
def toggle_task():
    """Toggles task running state (Start/Pause)."""
    data = request.json or {}
    task_id = data.get('task_id')
    
    with tasks_lock:
        if task_id in active_tasks:
            current = active_tasks[task_id]['running']
            new_state = not current
            active_tasks[task_id]['running'] = new_state
            
            if new_state:
                thread = active_tasks[task_id].get('thread')
                if not thread or not thread.is_alive():
                    worker_thread = threading.Thread(target=task_worker, args=(task_id,), daemon=True)
                    active_tasks[task_id]['thread'] = worker_thread
                    worker_thread.start()
                    
            return jsonify({
                'status': 'success',
                'running': new_state,
                'message': f"Tarea #{task_id} {'activada' if new_state else 'pausada'}."
            })
        else:
            return jsonify({'status': 'error', 'message': 'Tarea no encontrada.'}), 404
