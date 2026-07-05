import os
import re
import struct
from flask import Blueprint, jsonify, send_file, current_app
from app.excel_db import get_config_key

bp = Blueprint('fashion', __name__, url_prefix='/api/fashion')

def get_flyff_directory():
    flyff_path = get_config_key('flyff_path')
    if not flyff_path or not os.path.exists(flyff_path):
        return None
    if os.path.isfile(flyff_path):
        return os.path.dirname(flyff_path)
    return flyff_path

def find_client_file(flyff_dir, target_name):
    """Searches case-insensitively for a file in Flyff dir, Resource/ or resource/ folders."""
    search_dirs = [
        flyff_dir,
        os.path.join(flyff_dir, 'Resource'),
        os.path.join(flyff_dir, 'resource'),
        os.path.join(flyff_dir, 'Client'),
        os.path.join(flyff_dir, 'client')
    ]
    target_lower = target_name.lower()
    
    for directory in search_dirs:
        if not os.path.exists(directory):
            continue
        try:
            for file in os.listdir(directory):
                if file.lower() == target_lower:
                    return os.path.join(directory, file)
        except Exception as e:
            current_app.logger.warning(f"Error reading directory {directory}: {e}")
            continue
            
    # Try recursive search up to 2 levels deep
    for root, dirs, files in os.walk(flyff_dir):
        depth = root[len(flyff_dir):].count(os.sep)
        if depth > 2:
            del dirs[:]
            continue
        for file in files:
            if file.lower() == target_lower:
                return os.path.join(root, file)
                
    return None

def extract_file_from_res(res_path, target_filename):
    """Parses a Flyff .res container file, decrypts its header, and extracts the target file bytes."""
    if not os.path.exists(res_path):
        return None
    try:
        with open(res_path, 'rb') as f:
            hdr_bytes = f.read(6)
            if len(hdr_bytes) < 6:
                return None
            crypt_key, is_crypt, hdr_size = struct.unpack('<BBI', hdr_bytes)
            
            # Decryption table mapping for fast translate
            dec_table = bytearray(256)
            for val in range(256):
                dec_val = (~val & 0xFF) ^ crypt_key
                dec_table[val] = ((dec_val << 4) & 0xF0) | ((dec_val >> 4) & 0x0F)
                
            hdr_data = f.read(hdr_size)
            if len(hdr_data) < hdr_size:
                return None
            dec_hdr = hdr_data.translate(dec_table)
            
            num_files = struct.unpack('<H', dec_hdr[7:9])[0]
            
            idx = 9
            for _ in range(num_files):
                if idx + 2 > len(dec_hdr):
                    break
                name_len = struct.unpack('<H', dec_hdr[idx:idx+2])[0]
                idx += 2
                
                if idx + name_len + 12 > len(dec_hdr):
                    break
                name = dec_hdr[idx:idx+name_len].decode('ascii', errors='ignore')
                idx += name_len
                
                size, timestamp, offset = struct.unpack('<III', dec_hdr[idx:idx+12])
                idx += 12
                
                if name.lower() == target_filename.lower():
                    f.seek(offset)
                    file_bytes = f.read(size)
                    if is_crypt:
                        file_bytes = file_bytes.translate(dec_table)
                    return file_bytes
    except Exception as e:
        current_app.logger.error(f"Error parsing res archive {res_path} for {target_filename}: {e}")
    return None

def parse_txt_txt_content(content_str):
    """Parses propItem.txt.txt string content into a mapping of ID string -> Human readable name."""
    name_map = {}
    if not content_str:
        return name_map

    for line in content_str.splitlines():
        line = line.strip()
        if not line or line.startswith('//'):
            continue
        parts = line.split('\t')
        if len(parts) >= 2:
            name_map[parts[0].strip()] = parts[1].strip()
        else:
            parts = line.split(' ', 1)
            if len(parts) >= 2:
                name_map[parts[0].strip()] = parts[1].strip()
                
    return name_map

@bp.route('/items', methods=['GET'])
def get_flyff_client_items():
    flyff_dir = get_flyff_directory()
    if not flyff_dir:
        return jsonify({'error': 'Flyff client folder not configured or not found. Please check Settings.'}), 404

    # Categorized storage
    categories = {
        'head': [],
        'suit': [],
        'gloves': [],
        'shoes': [],
        'cloak': [],
        'weapon': []
    }

    # Helper mapping for slot keys
    slot_mapping = {
        'PARTS_CAP': 'head',
        'IK3_HAT': 'head',
        'PARTS_UPPER': 'suit',
        'IK3_SUIT': 'suit',
        'PARTS_HAND': 'gloves',
        'IK3_GLOVE': 'gloves',
        'PARTS_FOOT': 'shoes',
        'IK3_SHOES': 'shoes',
        'PARTS_CLOAK': 'cloak',
        'IK3_CLOAK': 'cloak',
        'PARTS_RWEAPON': 'weapon',
        'PARTS_LWEAPON': 'weapon',
        'IK3_SWORD': 'weapon',
        'IK3_BOW': 'weapon',
        'IK3_AXE': 'weapon',
        'IK3_WAND': 'weapon',
        'IK3_SHIELD': 'weapon',
        'IK3_SWD': 'weapon'
    }

    # Method 1: Try reading loose files first (propItem.txt)
    prop_item_path = find_client_file(flyff_dir, 'propItem.txt')
    prop_txt_path = find_client_file(flyff_dir, 'propItem.txt.txt')

    item_content = ""
    txt_content = ""

    if prop_item_path:
        # Load names list
        encodings = ['utf-8', 'latin-1', 'cp1252', 'euc-kr', 'gbk']
        if prop_txt_path:
            for enc in encodings:
                try:
                    with open(prop_txt_path, 'r', encoding=enc, errors='ignore') as f:
                        txt_content = f.read()
                        break
                except:
                    continue
        # Load items database
        for enc in encodings:
            try:
                with open(prop_item_path, 'r', encoding=enc, errors='ignore') as f:
                    item_content = f.read()
                    break
            except:
                continue

    # Method 2: Fallback to reading packed files in dataSub2.res (Spec_Item.txt)
    is_spec_format = False
    if not item_content:
        data_sub2_path = find_client_file(flyff_dir, 'dataSub2.res')
        if data_sub2_path:
            current_app.logger.info(f"Loose propItem.txt not found. Attempting to parse packed files from {data_sub2_path}...")
            
            # Extract Spec_Item.txt
            spec_bytes = extract_file_from_res(data_sub2_path, 'Spec_Item.txt')
            if spec_bytes:
                item_content = spec_bytes.decode('utf-8', errors='ignore')
                is_spec_format = True
            
            # Extract propItem.txt.txt
            txt_bytes = extract_file_from_res(data_sub2_path, 'propItem.txt.txt')
            if txt_bytes:
                txt_content = txt_bytes.decode('utf-8', errors='ignore')

    if not item_content:
        return jsonify({'error': 'Could not find propItem.txt or Spec_Item.txt in the Flyff folder (loose or packed).'}), 404

    # Parse names dictionary
    name_map = parse_txt_txt_content(txt_content)

    clean_lines = []
    for line in item_content.splitlines():
        line_strip = line.strip()
        if line_strip.startswith('//') or not line_strip:
            continue
        # strip inline comment
        if '//' in line:
            line = line.split('//')[0]
        clean_lines.append(line)

    parsed_count = 0

    if is_spec_format:
        # Spec_Item.txt TSV column-based format parsing
        for line in clean_lines:
            parts = line.strip().split('\t')
            if len(parts) < 20:
                continue
                
            code = parts[1]
            name_key = parts[2]
            parts_type = parts[18] # Col 18 is parts slot dwParts
            
            # Check slot mapping
            slot = None
            for key_slot, val_slot in slot_mapping.items():
                if key_slot in parts_type:
                    slot = val_slot
                    break
            
            if not slot:
                continue

            # Item ID from Col 0 (often prefixed with level or group flag)
            # In Spec_Item.txt, we generate an ID hash or extract it
            # We can hash the item code to produce a unique numeric ID for frontend selectors
            item_id = abs(hash(code)) % 10000000

            # Map readable name
            readable_name = name_map.get(name_key) if name_key else None
            if not readable_name:
                readable_name = code.replace('II_ARM_M_', '').replace('II_ARM_F_', '').replace('II_WEP_', '').replace('II_ARM_', '').replace('_', ' ')
            
            if 'IDS_PROPITEM_TXT' in readable_name or readable_name.startswith('II_'):
                continue

            # Derive exact compiled .o3d model filename based on texture icon in Col 132
            model_file = ""
            icon_file = parts[132].replace('"', '').strip() if len(parts) > 132 else ""
            if icon_file:
                base_icon = os.path.splitext(icon_file)[0]
                if base_icon.startswith("itm_"):
                    clean_name = base_icon[4:]
                    # capitalize
                    clean_name = clean_name[0].upper() + clean_name[1:] if clean_name else ""
                    if slot in ['head', 'suit', 'gloves', 'shoes']:
                        gender_prefix = "f" if "SEX_FEMALE" in line else "m"
                        if clean_name.lower().startswith('m') or clean_name.lower().startswith('f'):
                            model_file = f"Part_{clean_name}.o3d"
                        else:
                            model_file = f"Part_{gender_prefix}{clean_name}.o3d"
                    else:
                        model_file = f"Item_{clean_name}.o3d"

            categories[slot].append({
                'id': item_id,
                'code': code,
                'name': readable_name,
                'model': model_file,
                'slot': slot
            })
            parsed_count += 1
    else:
        # Traditional propItem.txt formatting
        clean_content = "\n".join(clean_lines)
        blocks = re.findall(r'([A-Za-z0-9_]+)\s*\{\s*([^}]+)\}', clean_content)
        
        if len(blocks) > 20:
            for code, body in blocks:
                properties = {}
                for line in body.splitlines():
                    line = line.strip()
                    if not line:
                        continue
                    parts = re.split(r'\s+', line)
                    if len(parts) >= 2:
                        key = parts[0]
                        val = " ".join(parts[1:]).replace('"', '').strip()
                        properties[key] = val
                
                item_id = properties.get('ID') or properties.get('dwID')
                name_key = properties.get('NAME') or properties.get('szName')
                parts_type = properties.get('dwParts') or properties.get('dwItemKind3')
                model_file = properties.get('szModel')
                
                if not item_id or not parts_type:
                    continue
                    
                slot = None
                for key_slot, val_slot in slot_mapping.items():
                    if key_slot in parts_type:
                        slot = val_slot
                        break
                
                if not slot:
                    continue

                readable_name = name_map.get(name_key) if name_key else None
                if not readable_name:
                    readable_name = code.replace('II_ARM_M_', '').replace('II_ARM_F_', '').replace('II_WEP_', '').replace('II_ARM_', '').replace('_', ' ')
                
                if 'IDS_PROPITEM_TXT' in readable_name or readable_name.startswith('II_'):
                    continue
                    
                categories[slot].append({
                    'id': int(item_id),
                    'code': code,
                    'name': readable_name,
                    'model': model_file or '',
                    'slot': slot
                })
                parsed_count += 1
        else:
            # Heuristic line-by-line fallback
            for line in clean_lines:
                parts = re.split(r'\s+', line.strip())
                if len(parts) < 4:
                    continue
                item_id, code, slot, model_file, name_key = None, None, None, '', None
                for index, token in enumerate(parts):
                    if index == 0 and token.isdigit():
                        item_id = token
                    elif token.startswith('II_'):
                        code = token
                    elif token.startswith('IDS_PROPITEM_'):
                        name_key = token
                    elif token in slot_mapping:
                        slot = slot_mapping[token]
                    elif token.lower().endswith('.o3d') or token.lower().endswith('.obj') or token.lower().endswith('.glb'):
                        model_file = token

                if item_id and slot:
                    readable_name = name_map.get(name_key) if name_key else None
                    if not readable_name and code:
                        readable_name = code.replace('II_ARM_', '').replace('II_WEP_', '').replace('_', ' ')
                    if not readable_name:
                        readable_name = f"Item #{item_id}"
                    if 'IDS_PROPITEM_TXT' in readable_name or readable_name.startswith('II_'):
                        continue

                    categories[slot].append({
                        'id': int(item_id),
                        'code': code or f"ITEM_{item_id}",
                        'name': readable_name,
                        'model': model_file,
                        'slot': slot
                    })
                    parsed_count += 1

    # Remove duplicates and sort alphabetical
    for slot in categories:
        seen_names = set()
        unique_items = []
        for item in categories[slot]:
            if item['name'] not in seen_names:
                seen_names.add(item['name'])
                unique_items.append(item)
        
        categories[slot] = sorted(unique_items, key=lambda x: x['name'])

    total_parsed = sum(len(items) for items in categories.values())
    current_app.logger.info(f"Loaded {total_parsed} fashion items from local Flyff (loose or decrypted from .res).")

    return jsonify({
        'status': 'success',
        'count': total_parsed,
        'categories': categories
    })

import io

def convert_o3d_to_obj(o3d_bytes):
    try:
        stream = io.BytesIO(o3d_bytes)
        name_len = stream.read(1)[0]
        stream.seek(name_len, os.SEEK_CUR)
        
        version, unknown1 = struct.unpack('<ii', stream.read(8))
        stream.seek(24, os.SEEK_CUR) # element1
        if version == 0x16:
            stream.seek(24, os.SEEK_CUR) # element2
            
        stream.seek(8, os.SEEK_CUR) # unk2, unk3
        stream.seek(16, os.SEEK_CUR)
        stream.seek(24, os.SEEK_CUR) # bbMin, bbMax
        
        unk4 = struct.unpack('<f', stream.read(4))[0]
        flag1, flag2 = struct.unpack('<ii', stream.read(8))
        stream.seek(flag2 * 12, os.SEEK_CUR)
        
        mesh_type, lod_flag, unk5, total_mesh_count, mesh_count = struct.unpack('<iiiii', stream.read(20))
        
        obj_lines = []
        v_offset = 1
        vt_offset = 1
        vn_offset = 1
        
        for m in range(mesh_count):
            has_bones, n_count3 = struct.unpack('<ii', stream.read(8))
            stream.seek(n_count3 * 4, os.SEEK_CUR)
            
            # Read unknown1, nTerminator and the extra integer (12 bytes total)
            unknown1, n_terminator, extra_int = struct.unpack('<iii', stream.read(12))
            
            stream.seek(64, os.SEEK_CUR) # transform
            stream.seek(24, os.SEEK_CUR) # bbMin, bbMax
            stream.seek(12, os.SEEK_CUR) # opacity, bump, rigid
            stream.seek(28, os.SEEK_CUR) # skip 28
            
            v_list_size, vertex_count, f_list_size, index_count = struct.unpack('<iiii', stream.read(16))
            
            # Read vertexList
            stream.seek(v_list_size * 12, os.SEEK_CUR)
            
            vertices = []
            normals = []
            uvs = []
            
            for v in range(vertex_count):
                pos = struct.unpack('<fff', stream.read(12))
                vertices.append(pos)
                if has_bones == 1:
                    stream.seek(12, os.SEEK_CUR)
                norm = struct.unpack('<fff', stream.read(12))
                normals.append(norm)
                uv = struct.unpack('<ff', stream.read(8))
                uvs.append(uv)
                
            indices = []
            for idx in range(index_count):
                indices.append(struct.unpack('<H', stream.read(2))[0])
                
            stream.seek(vertex_count * 2, os.SEEK_CUR) # skip triangles
            
            has_physique = struct.unpack('<i', stream.read(4))[0]
            if has_physique != 0:
                stream.seek(v_list_size * 4, os.SEEK_CUR)
                
            has_materials = struct.unpack('<i', stream.read(4))[0]
            texture_filename = ""
            if has_materials != 0:
                mat_count = struct.unpack('<i', stream.read(4))[0]
                if mat_count == 0:
                    mat_count = 1
                for _ in range(mat_count):
                    stream.seek(68, os.SEEK_CUR)
                    tex_name_len = struct.unpack('<i', stream.read(4))[0]
                    tex_name_bytes = stream.read(tex_name_len)
                    texture_filename = tex_name_bytes.decode('ascii', errors='ignore').strip()
                    
            mat_id_count = struct.unpack('<i', stream.read(4))[0]
            if mat_id_count > 0:
                for _ in range(mat_id_count):
                    stream.seek(20, os.SEEK_CUR)
                    used_bone_count = struct.unpack('<i', stream.read(4))[0]
                    stream.seek(used_bone_count * 4, os.SEEK_CUR)
            
            obj_lines.append(f"# Mesh {m}")
            if texture_filename:
                obj_lines.append(f"# Texture: {texture_filename}")
            for v in vertices:
                obj_lines.append(f"v {-v[0]} {v[1]} {v[2]}")
            for uv in uvs:
                obj_lines.append(f"vt {uv[0]} {1.0 - uv[1]}")
            for norm in normals:
                obj_lines.append(f"vn {-norm[0]} {norm[1]} {norm[2]}")
                
            for j in range(0, index_count, 3):
                if j + 2 < index_count:
                    idx1 = indices[j] + v_offset
                    idx2 = indices[j+1] + v_offset
                    idx3 = indices[j+2] + v_offset
                    
                    vt1 = indices[j] + vt_offset
                    vt2 = indices[j+1] + vt_offset
                    vt3 = indices[j+2] + vt_offset
                    
                    vn1 = indices[j] + vn_offset
                    vn2 = indices[j+1] + vn_offset
                    vn3 = indices[j+2] + vn_offset
                    
                    obj_lines.append(f"f {idx1}/{vt1}/{vn1} {idx2}/{vt2}/{vn2} {idx3}/{vt3}/{vn3}")
                    
            v_offset += vertex_count
            vt_offset += vertex_count
            vn_offset += vertex_count
            
        return "\n".join(obj_lines)
    except Exception as e:
        current_app.logger.error(f"Error converting o3d: {e}")
        return None

@bp.route('/assets/<path:filepath>', methods=['GET'])
def serve_flyff_client_asset(filepath):
    """Serves models, textures and custom assets from the Flyff client folder safely, extracting from .res if needed."""
    flyff_dir = get_flyff_directory()
    if not flyff_dir:
        return jsonify({'error': 'Flyff folder not configured.'}), 404

    # Sanitize path to prevent Directory Traversal
    normalized_base = os.path.abspath(flyff_dir)
    target_path = os.path.abspath(os.path.join(normalized_base, filepath))

    if not target_path.startswith(normalized_base):
        return jsonify({'error': 'Access denied: Directory traversal detected.'}), 403

    filename = os.path.basename(filepath)
    base_name, ext = os.path.splitext(filename)
    ext_lower = ext.lower()

    # 1. Try serving from local disk first
    if os.path.exists(target_path) and os.path.isfile(target_path):
        return send_file(target_path)

    # Case insensitive disk search
    dir_name = os.path.dirname(target_path)
    if os.path.exists(dir_name):
        try:
            for f in os.listdir(dir_name):
                if f.lower() == filename.lower():
                    return send_file(os.path.join(dir_name, f))
        except Exception:
            pass

    # 2. Extract and serve from packed .res containers
    model_dir = os.path.join(flyff_dir, 'Model')
    res_path = None
    target_in_archive = filename
    
    if ext_lower == '.obj':
        # Need to extract and convert an .o3d mesh
        target_in_archive = base_name + '.o3d'
        if base_name.startswith('Part_m') or base_name.lower().startswith('part_male'):
            res_path = os.path.join(model_dir, 'part_m.res')
        elif base_name.startswith('Part_f') or base_name.lower().startswith('part_female'):
            res_path = os.path.join(model_dir, 'part.res')
        else:
            res_path = os.path.join(model_dir, 'item.res')
            
        if res_path and os.path.exists(res_path):
            o3d_bytes = extract_file_from_res(res_path, target_in_archive)
            if o3d_bytes:
                obj_str = convert_o3d_to_obj(o3d_bytes)
                if obj_str:
                    return send_file(
                        io.BytesIO(obj_str.encode('utf-8')),
                        mimetype='text/plain',
                        as_attachment=False,
                        download_name=filename
                    )

    elif ext_lower == '.dds':
        # Extract texture DDS
        if base_name.startswith('Part_m') or base_name.lower().startswith('part_male'):
            res_path = os.path.join(model_dir, 'part_mTex.res')
        elif base_name.startswith('Part_f') or base_name.lower().startswith('part_female'):
            res_path = os.path.join(model_dir, 'part_fTex.res')
        else:
            res_path = os.path.join(model_dir, 'Texture', 'itemTex.res')
            if not os.path.exists(res_path):
                res_path = os.path.join(model_dir, 'TextureMid', 'itemTex.res')
            if not os.path.exists(res_path):
                res_path = os.path.join(model_dir, 'TextureLow', 'itemTex.res')
                
        if res_path and os.path.exists(res_path):
            dds_bytes = extract_file_from_res(res_path, target_in_archive)
            if dds_bytes:
                return send_file(
                    io.BytesIO(dds_bytes),
                    mimetype='application/octet-stream',
                    as_attachment=False,
                    download_name=filename
                )

    return jsonify({'error': f'File not found: {filepath}'}), 404
