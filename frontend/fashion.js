// 3D Fashion Viewer - Flyff Manager Account
// Powered by Three.js and OrbitControls

let scene, camera, renderer, controls, clock;
let characterGroup;
let isInitialized = false;
let isAnimating = true;
let currentAnimation = 'idle'; // 'idle', 'float', 'dance'

// Character Base States
let charGender = 'male';
let charHairStyle = 'short';
let charHairColor = '#ffd700';
let charSkinColor = '#ffd5b4';

// Real items database loaded from backend
let loadedClientItems = null;

// Slot states (stores item ID for client items, or string code for presets/procedural)
let equippedSlots = {
    head: 'none',
    suit: 'common',
    gloves: 'default',
    shoes: 'common',
    cloak: 'none',
    weapon: 'fists'
};

// References to loaded client items objects
let realEquippedItems = {
    head: null,
    suit: null,
    gloves: null,
    shoes: null,
    cloak: null,
    weapon: null
};

let slotVisibility = {
    head: true,
    suit: true,
    gloves: true,
    shoes: true,
    cloak: true,
    weapon: true
};

// References to mesh groups for removal / update
let bodyMeshes = {}; // head, torso, leftArm, rightArm, leftLeg, rightLeg, leftHand, rightHand, leftFoot, rightFoot
let hairGroup = null;
let headwearMesh = null;
let cloakMesh = null;
let weaponMesh = null;
let leftWeaponMesh = null; // for shield

// Outfits List
let savedOutfits = [];

// Materials Dictionary
let materials = {};

// Initializer
async function initFashionViewer() {
    if (isInitialized) {
        resizeCanvas();
        return;
    }

    const container = document.getElementById('fashion-canvas-container');
    const canvas = document.getElementById('fashion-canvas');
    if (!container || !canvas) return;

    document.getElementById('fashion-loading').style.display = 'flex';

    // 1. Setup Scene, Camera, Renderer
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0907, 0.05);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.5, 6.5);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Add Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.target.set(0, 1.2, 0);

    // 3. Setup Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffe8bc, 0.85);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xd4af37, 0.4);
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);

    // 4. Setup Ground Platform
    const platformGeom = new THREE.CylinderGeometry(2, 2.1, 0.2, 32);
    const platformMat = new THREE.MeshStandardMaterial({
        color: 0x1f1a14,
        roughness: 0.8,
        metalness: 0.2,
        side: THREE.DoubleSide
    });
    const platform = new THREE.Mesh(platformGeom, platformMat);
    platform.position.y = -0.1;
    platform.receiveShadow = true;
    scene.add(platform);

    const gridHelper = new THREE.GridHelper(3.8, 12, 0xd4af37, 0x443c2c);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // 5. Initialize Materials
    initMaterials();

    // 6. Build Character Base Group
    characterGroup = new THREE.Group();
    scene.add(characterGroup);

    clock = new THREE.Clock();

    // 7. Load Items from Flyff Folder
    await loadFlyffClientItems();

    // 8. Rebuild Avatar Model
    rebuildCharacter();

    // 9. Event Listeners
    window.addEventListener('resize', resizeCanvas);
    
    // Initial load of Outfits from LocalStorage
    loadSavedOutfits();

    // Set UI Default Values
    document.getElementById('fashion-hair-style').value = charHairStyle;
    document.getElementById('fashion-hair-color').value = charHairColor;
    syncEquipDropdowns();

    isInitialized = true;
    animate();
}

function initMaterials() {
    materials.skin = new THREE.MeshStandardMaterial({ color: charSkinColor, roughness: 0.6 });
    materials.hair = new THREE.MeshStandardMaterial({ color: charHairColor, roughness: 0.8, flatShading: true });
    materials.eyes = new THREE.MeshBasicMaterial({ color: 0x111111 });
    materials.underwear = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });
    
    materials.gold = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.9 });
    materials.metal = new THREE.MeshStandardMaterial({ color: 0x8e8e8e, roughness: 0.4, metalness: 0.8 });
    materials.redVelvet = new THREE.MeshStandardMaterial({ color: 0x990000, roughness: 0.9 });
    materials.whiteCloth = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 });
    materials.darkCloth = new THREE.MeshStandardMaterial({ color: 0x1f1f23, roughness: 0.8 });
    materials.cyanGlow = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1.0,
        roughness: 0.2
    });
    materials.pinkGlow = new THREE.MeshStandardMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 1.0,
        roughness: 0.2
    });
    materials.yellowGlow = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0.8,
        roughness: 0.2
    });
    materials.wood = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    materials.glass = new THREE.MeshPhysicalMaterial({
        color: 0xa5d3f5,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        transmission: 0.9,
        ior: 1.5
    });
}

function resizeCanvas() {
    const container = document.getElementById('fashion-canvas-container');
    if (!container || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Fetch lists from local Flyff folders
async function loadFlyffClientItems() {
    const loadingEl = document.getElementById('fashion-loading');
    if (loadingEl) {
        loadingEl.style.display = 'flex';
        loadingEl.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Cargando base de datos de Flyff...';
    }

    try {
        const res = await fetch('/api/fashion/items');
        if (!res.ok) {
            throw new Error(await res.text());
        }
        const data = await res.json();
        if (data.status === 'success') {
            loadedClientItems = data.categories;
            populateEquipSelectors();
        }
    } catch (e) {
        console.error("No se pudo cargar la base de datos de Flyff:", e);
    } finally {
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }
}

// Populate selectors with parsed items
function populateEquipSelectors() {
    if (!loadedClientItems) return;

    const slots = ['head', 'suit', 'gloves', 'shoes', 'cloak', 'weapon'];
    slots.forEach(slot => {
        const select = document.getElementById(`fashion-equip-${slot}`);
        if (!select) return;

        const currentVal = select.value;
        select.innerHTML = '';

        // Add None/Default fallbacks
        if (slot === 'head' || slot === 'cloak') {
            select.appendChild(new Option(i18n('equip_none'), 'none'));
        } else if (slot === 'suit') {
            select.appendChild(new Option(i18n('equip_suit_common'), 'common'));
        } else if (slot === 'gloves') {
            select.appendChild(new Option(i18n('equip_gloves_default'), 'default'));
        } else if (slot === 'shoes') {
            select.appendChild(new Option(i18n('equip_shoes_common'), 'common'));
        } else if (slot === 'weapon') {
            select.appendChild(new Option(i18n('equip_weapon_fists'), 'fists'));
        }

        // Add actual items from client
        const items = loadedClientItems[slot] || [];
        items.forEach(item => {
            const option = new Option(item.name, item.id);
            option.dataset.code = item.code;
            option.dataset.model = item.model;
            select.add(option);
        });

        // Try to restore previous selection
        if (currentVal) select.value = currentVal;
    });
}

// Helper to check and resolve the item code, model filename and name mapping
function resolveSlotItem(slot) {
    const real = realEquippedItems[slot];
    if (real) {
        const mappedType = getProceduralTypeFromRealName(slot, real.name);
        const mappedColor = getProceduralColorFromRealName(real.name, null);
        return {
            isReal: true,
            id: real.id,
            name: real.name,
            model: real.model,
            type: mappedType,
            color: mappedColor
        };
    }
    // Fallback to procedural/preset string code
    return {
        isReal: false,
        id: null,
        name: null,
        model: null,
        type: equippedSlots[slot],
        color: null
    };
}

// ----------------------------------------------------
// CHARACTER PROCEDURAL MESH BUILDER
// ----------------------------------------------------
// ----------------------------------------------------
// CHARACTER PROCEDURAL MESH BUILDER (FALLBACK)
// ----------------------------------------------------
function buildProceduralCharacter() {
    const isFemale = charGender === 'female';
    const heightScale = isFemale ? 0.9 : 1.0;
    const bodyWidth = isFemale ? 0.8 : 1.0;
    const bodyDepth = isFemale ? 0.6 : 0.75;
    const limbThickness = isFemale ? 0.15 : 0.2;

    materials.skin.color.set(charSkinColor);
    materials.hair.color.set(charHairColor);

    // Resolve Suit
    const resolvedSuit = resolveSlotItem('suit');
    
    // Suit material resolution
    let torsoGeom, torsoMat;
    let customSuitColor = resolvedSuit.color ? new THREE.MeshStandardMaterial({ color: resolvedSuit.color, roughness: 0.8 }) : null;

    if (slotVisibility.suit && resolvedSuit.type === 'cyberpunk') {
        torsoGeom = new THREE.BoxGeometry(bodyWidth * 0.9, 1.4 * heightScale, bodyDepth);
        torsoMat = customSuitColor || materials.darkCloth;
    } else if (slotVisibility.suit && resolvedSuit.type === 'astronaut') {
        torsoGeom = new THREE.CylinderGeometry(bodyWidth * 0.5, bodyWidth * 0.55, 1.5 * heightScale, 16);
        torsoMat = customSuitColor || materials.whiteCloth;
    } else if (slotVisibility.suit && resolvedSuit.type === 'dragon') {
        torsoGeom = new THREE.BoxGeometry(bodyWidth * 0.95, 1.4 * heightScale, bodyDepth * 1.1);
        torsoMat = customSuitColor || materials.redVelvet;
    } else if (slotVisibility.suit && resolvedSuit.type === 'maid') {
        torsoGeom = new THREE.CylinderGeometry(bodyWidth * 0.42, bodyWidth * 0.48, 1.4 * heightScale, 16);
        torsoMat = customSuitColor || materials.darkCloth;
    } else if (slotVisibility.suit && resolvedSuit.type === 'school') {
        torsoGeom = new THREE.BoxGeometry(bodyWidth * 0.85, 1.4 * heightScale, bodyDepth);
        torsoMat = customSuitColor || materials.whiteCloth;
    } else {
        // Common Clothes
        torsoGeom = new THREE.BoxGeometry(bodyWidth * 0.8, 1.3 * heightScale, bodyDepth);
        torsoMat = customSuitColor || new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.8 }); // Blue Shirt
    }

    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = 1.6 * heightScale;
    torso.castShadow = true;
    torso.receiveShadow = true;
    characterGroup.add(torso);
    bodyMeshes.torso = torso;

    // Load actual GLTF/OBJ Model for suit if available
    if (resolvedSuit.isReal && resolvedSuit.model && slotVisibility.suit) {
        loadCustomModelOrFallback('suit', resolvedSuit.model, torso, () => {
            // Procedural suit decorations
            buildProceduralSuitDecorations(torso, resolvedSuit.type, bodyWidth, bodyDepth, heightScale, isFemale);
        });
    } else if (slotVisibility.suit) {
        buildProceduralSuitDecorations(torso, resolvedSuit.type, bodyWidth, bodyDepth, heightScale, isFemale);
    }

    // 2. Head & Face
    const resolvedHead = resolveSlotItem('head');
    const headGeom = new THREE.SphereGeometry(0.48, 32, 32);
    let headMat = materials.skin;
    if (slotVisibility.head && resolvedHead.type === 'ninja_mask') {
        headMat = materials.darkCloth;
    }
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = 0.95 * heightScale;
    torso.add(head);
    bodyMeshes.head = head;

    // Eyes
    const eyeGeom = new THREE.SphereGeometry(0.05, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeom, materials.eyes);
    leftEye.position.set(-0.16, 0.05, 0.42);
    leftEye.scale.set(1, 1.5, 0.5);
    head.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.x = 0.16;
    head.add(rightEye);

    // Face cheeks
    const cheekGeom = new THREE.SphereGeometry(0.04, 8, 8);
    const cheekMat = new THREE.MeshBasicMaterial({ color: 0xff9999, transparent: true, opacity: 0.6 });
    const leftCheek = new THREE.Mesh(cheekGeom, cheekMat);
    leftCheek.position.set(-0.25, -0.06, 0.38);
    head.add(leftCheek);
    const rightCheek = leftCheek.clone();
    rightCheek.position.x = 0.25;
    head.add(rightCheek);

    if (slotVisibility.head && resolvedHead.type === 'ninja_mask') {
        const stripGeom = new THREE.PlaneGeometry(0.5, 0.14);
        const skinStrip = new THREE.Mesh(stripGeom, materials.skin);
        skinStrip.position.set(0, 0.04, 0.44);
        head.add(skinStrip);
    }

    // Hair
    buildHair(head);

    // 3. Limbs: Arms (with gloves override)
    let armMat = materials.skin;
    if (slotVisibility.suit && (resolvedSuit.type === 'cyberpunk' || resolvedSuit.type === 'dragon')) {
        armMat = torsoMat;
    } else if (slotVisibility.suit && resolvedSuit.type === 'astronaut') {
        armMat = materials.whiteCloth;
    }

    // Resolve Gloves
    const resolvedGloves = resolveSlotItem('gloves');
    let leftGloveMat = materials.skin;
    let rightGloveMat = materials.skin;
    let customGloveColor = resolvedGloves.color ? new THREE.MeshStandardMaterial({ color: resolvedGloves.color, roughness: 0.6 }) : null;

    if (slotVisibility.gloves) {
        if (resolvedGloves.type === 'gold_bracers') {
            leftGloveMat = materials.gold;
            rightGloveMat = materials.gold;
        } else if (resolvedGloves.type === 'boxing') {
            leftGloveMat = customGloveColor || new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
            rightGloveMat = leftGloveMat;
        } else if (resolvedGloves.type === 'cyber_gloves') {
            leftGloveMat = customGloveColor || materials.pinkGlow;
            rightGloveMat = leftGloveMat;
        } else {
            leftGloveMat = customGloveColor || new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.7 });
            rightGloveMat = leftGloveMat;
        }
    }

    const armGeom = new THREE.CylinderGeometry(limbThickness, limbThickness * 0.8, 1.0 * heightScale, 12);
    
    // Left Arm Group
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-bodyWidth * 0.52, 0.5, 0);
    const leftArmMesh = new THREE.Mesh(armGeom, armMat);
    leftArmMesh.position.y = -0.4;
    leftArmMesh.castShadow = true;
    leftArmGroup.add(leftArmMesh);
    torso.add(leftArmGroup);
    bodyMeshes.leftArm = leftArmGroup;

    // Left Hand (glove)
    let handGeom = new THREE.SphereGeometry(limbThickness * 1.1, 12, 12);
    if (slotVisibility.gloves && resolvedGloves.type === 'boxing') {
        handGeom = new THREE.SphereGeometry(limbThickness * 1.8, 16, 16);
    }
    const leftHand = new THREE.Mesh(handGeom, leftGloveMat);
    leftHand.position.y = -0.9 * heightScale;
    leftArmGroup.add(leftHand);
    bodyMeshes.leftHand = leftHand;

    // Right Arm Group
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(bodyWidth * 0.52, 0.5, 0);
    const rightArmMesh = new THREE.Mesh(armGeom, armMat);
    rightArmMesh.position.y = -0.4;
    rightArmMesh.castShadow = true;
    rightArmGroup.add(rightArmMesh);
    torso.add(rightArmGroup);
    bodyMeshes.rightArm = rightArmGroup;

    // Right Hand (glove)
    const rightHand = new THREE.Mesh(handGeom, rightGloveMat);
    rightHand.position.y = -0.9 * heightScale;
    rightArmGroup.add(rightHand);
    bodyMeshes.rightHand = rightHand;

    // 4. Limbs: Legs
    let legMat = materials.skin;
    if (slotVisibility.suit && resolvedSuit.type === 'common') {
        legMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }); // Green pants
    } else if (slotVisibility.suit && resolvedSuit.type === 'cyberpunk') {
        legMat = materials.darkCloth;
    } else if (slotVisibility.suit && resolvedSuit.type === 'astronaut') {
        legMat = materials.whiteCloth;
    } else if (slotVisibility.suit && resolvedSuit.type === 'dragon') {
        legMat = materials.redVelvet;
    } else if (slotVisibility.suit && resolvedSuit.type === 'school' && !isFemale) {
        legMat = new THREE.MeshStandardMaterial({ color: 0x475569 }); // grey pants
    }

    // Resolve Shoes
    const resolvedShoes = resolveSlotItem('shoes');
    let shoeMat = materials.skin;
    let customShoeColor = resolvedShoes.color ? new THREE.MeshStandardMaterial({ color: resolvedShoes.color, roughness: 0.6 }) : null;

    if (slotVisibility.shoes) {
        if (resolvedShoes.type === 'metal_boots') {
            shoeMat = materials.metal;
        } else if (resolvedShoes.type === 'winged_boots') {
            shoeMat = materials.whiteCloth;
        } else if (resolvedShoes.type === 'sneakers') {
            shoeMat = customShoeColor || new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
        } else {
            shoeMat = customShoeColor || materials.wood;
        }
    }

    const legGeom = new THREE.CylinderGeometry(limbThickness * 1.1, limbThickness * 0.9, 1.1 * heightScale, 12);
    
    // Left Leg Group
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-bodyWidth * 0.28, -0.6 * heightScale, 0);
    const leftLegMesh = new THREE.Mesh(legGeom, legMat);
    leftLegMesh.position.y = -0.5;
    leftLegMesh.castShadow = true;
    leftLegGroup.add(leftLegMesh);
    torso.add(leftLegGroup);
    bodyMeshes.leftLeg = leftLegGroup;

    // Left Foot
    const footGeom = new THREE.BoxGeometry(limbThickness * 2.2, 0.2, limbThickness * 3.2);
    const leftFoot = new THREE.Mesh(footGeom, shoeMat);
    leftFoot.position.set(0, -1.05 * heightScale, limbThickness * 0.5);
    leftFoot.castShadow = true;
    leftLegGroup.add(leftFoot);
    bodyMeshes.leftFoot = leftFoot;

    if (slotVisibility.shoes && resolvedShoes.type === 'winged_boots') {
        const wingL = buildSmallShoeWing(true);
        leftFoot.add(wingL);
    }

    // Right Leg Group
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(bodyWidth * 0.28, -0.6 * heightScale, 0);
    const rightLegMesh = new THREE.Mesh(legGeom, legMat);
    rightLegMesh.position.y = -0.5;
    rightLegMesh.castShadow = true;
    rightLegGroup.add(rightLegMesh);
    torso.add(rightLegGroup);
    bodyMeshes.rightLeg = rightLegGroup;

    // Right Foot
    const rightFoot = new THREE.Mesh(footGeom, shoeMat);
    rightFoot.position.set(0, -1.05 * heightScale, limbThickness * 0.5);
    rightFoot.castShadow = true;
    rightLegGroup.add(rightFoot);
    bodyMeshes.rightFoot = rightFoot;

    if (slotVisibility.shoes && resolvedShoes.type === 'winged_boots') {
        const wingR = buildSmallShoeWing(false);
        rightFoot.add(wingR);
    }

    // 5. Equip Accessories
    updateEquippedHead();
    updateEquippedCloak();
    updateEquippedWeapon();

    characterGroup.position.y = 1.35 * heightScale;
}

// ----------------------------------------------------
// DUAL LOADER (ORIGINAL FLYFF MODEL ENGINE)
// ----------------------------------------------------
function rebuildCharacter() {
    if (!characterGroup) return;

    // Clear meshes
    while (characterGroup.children.length > 0) {
        characterGroup.remove(characterGroup.children[0]);
    }

    bodyMeshes = {};
    hairGroup = null;
    headwearMesh = null;
    cloakMesh = null;
    weaponMesh = null;
    leftWeaponMesh = null;

    const isFemale = charGender === 'female';
    const prefix = isFemale ? 'female' : 'male';
    const shortPrefix = isFemale ? 'f' : 'm';
    
    const headUrl = `/api/fashion/assets/Model/Part_${prefix}Head01.obj`;
    
    document.getElementById('fashion-loading').style.display = 'flex';
    
    const objLoader = new THREE.OBJLoader();
    
    fetch(headUrl, { method: 'HEAD' })
        .then(res => {
            if (res.ok) {
                // Client files found! Load original head mesh
                objLoader.load(headUrl, (headObj) => {
                    headObj.name = "base_head";
                    headObj.position.set(0, 1.88, 0.05);
                    characterGroup.add(headObj);
                    bodyMeshes.head = headObj;
                    
                    loadTextureForCustomModel(headObj, `Part_${prefix}Head01`);
                    
                    const baseBodyGroup = new THREE.Group();
                    baseBodyGroup.name = "base_body";
                    characterGroup.add(baseBodyGroup);
                    bodyMeshes.torso = baseBodyGroup;
                    
                    equipOriginalFlyffParts(baseBodyGroup, headObj, isFemale, shortPrefix);
                    
                    document.getElementById('fashion-loading').style.display = 'none';
                }, undefined, () => {
                    buildProceduralCharacter();
                    document.getElementById('fashion-loading').style.display = 'none';
                });
            } else {
                buildProceduralCharacter();
                document.getElementById('fashion-loading').style.display = 'none';
            }
        })
        .catch(() => {
            buildProceduralCharacter();
            document.getElementById('fashion-loading').style.display = 'none';
        });
}

function equipOriginalFlyffParts(bodyGroup, headObj, isFemale, shortPrefix) {
    const objLoader = new THREE.OBJLoader();
    const loaderGLTF = new THREE.GLTFLoader();

    // 1. Equip Suit
    const resolvedSuit = resolveSlotItem('suit');
    let suitModel = `Part_${shortPrefix}Vag01Upper`;
    if (resolvedSuit.isReal && resolvedSuit.model && slotVisibility.suit) {
        const base = resolvedSuit.model.substring(0, resolvedSuit.model.lastIndexOf('.')) || resolvedSuit.model;
        suitModel = base;
    }
    
    const suitObjGroup = new THREE.Group();
    suitObjGroup.name = "equipped_suit";
    bodyGroup.add(suitObjGroup);
    
    const glbUrl = `/api/fashion/assets/Model/${suitModel}.glb`;
    const objUrl = `/api/fashion/assets/Model/${suitModel}.obj`;
    
    fetch(glbUrl, { method: 'HEAD' }).then(res => {
        if (res.ok) {
            loaderGLTF.load(glbUrl, (gltf) => {
                suitObjGroup.add(gltf.scene);
            });
        } else {
            objLoader.load(objUrl, (obj) => {
                suitObjGroup.add(obj);
                loadTextureForCustomModel(obj, suitModel);
            });
        }
    });

    // 2. Equip Gloves
    const resolvedGloves = resolveSlotItem('gloves');
    let glovesModel = `Part_${shortPrefix}Vag01Hand`;
    if (resolvedGloves.isReal && resolvedGloves.model && slotVisibility.gloves) {
        const base = resolvedGloves.model.substring(0, resolvedGloves.model.lastIndexOf('.')) || resolvedGloves.model;
        glovesModel = base;
    }
    
    const glovesObjGroup = new THREE.Group();
    glovesObjGroup.name = "equipped_gloves";
    bodyGroup.add(glovesObjGroup);
    
    const glovesGlbUrl = `/api/fashion/assets/Model/${glovesModel}.glb`;
    const glovesObjUrl = `/api/fashion/assets/Model/${glovesModel}.obj`;
    
    fetch(glovesGlbUrl, { method: 'HEAD' }).then(res => {
        if (res.ok) {
            loaderGLTF.load(glovesGlbUrl, (gltf) => {
                glovesObjGroup.add(gltf.scene);
            });
        } else {
            objLoader.load(glovesObjUrl, (obj) => {
                glovesObjGroup.add(obj);
                loadTextureForCustomModel(obj, glovesModel);
            });
        }
    });

    // 3. Equip Shoes
    const resolvedShoes = resolveSlotItem('shoes');
    let shoesModel = `Part_${shortPrefix}Vag01Foot`;
    if (resolvedShoes.isReal && resolvedShoes.model && slotVisibility.shoes) {
        const base = resolvedShoes.model.substring(0, resolvedShoes.model.lastIndexOf('.')) || resolvedShoes.model;
        shoesModel = base;
    }
    
    const shoesObjGroup = new THREE.Group();
    shoesObjGroup.name = "equipped_shoes";
    bodyGroup.add(shoesObjGroup);
    
    const shoesGlbUrl = `/api/fashion/assets/Model/${shoesModel}.glb`;
    const shoesObjUrl = `/api/fashion/assets/Model/${shoesModel}.obj`;
    
    fetch(shoesGlbUrl, { method: 'HEAD' }).then(res => {
        if (res.ok) {
            loaderGLTF.load(shoesGlbUrl, (gltf) => {
                shoesObjGroup.add(gltf.scene);
            });
        } else {
            objLoader.load(shoesObjUrl, (obj) => {
                shoesObjGroup.add(obj);
                loadTextureForCustomModel(obj, shoesModel);
            });
        }
    });

    // 4. Equip Headwear
    const resolvedHead = resolveSlotItem('head');
    let showHair = true;
    
    const headwearGroup = new THREE.Group();
    headwearGroup.name = "equipped_headwear";
    headObj.add(headwearGroup);

    if (resolvedHead.isReal && resolvedHead.model && slotVisibility.head) {
        showHair = false;
        loadCustomModelOrFallback('head', resolvedHead.model, headwearGroup, () => {
            showHair = true;
            buildProceduralHeadwear(resolvedHead.type, resolvedHead.color);
        });
    } else if (slotVisibility.head && resolvedHead.type !== 'none') {
        buildProceduralHeadwear(resolvedHead.type, resolvedHead.color);
        if (resolvedHead.type !== 'ninja_mask') {
            showHair = false;
        }
    }

    // 5. Equip Hair
    if (showHair && charHairStyle !== 'bald') {
        let hairIdx = '01';
        if (charHairStyle === 'long') hairIdx = '02';
        else if (charHairStyle === 'twintails') hairIdx = '03';
        else if (charHairStyle === 'ponytail') hairIdx = '04';
        
        const hairModel = `Part_${shortPrefix}Hair${hairIdx}`;
        const hairGlbUrl = `/api/fashion/assets/Model/${hairModel}.glb`;
        const hairObjUrl = `/api/fashion/assets/Model/${hairModel}.obj`;
        
        fetch(hairGlbUrl, { method: 'HEAD' }).then(res => {
            if (res.ok) {
                loaderGLTF.load(hairGlbUrl, (gltf) => {
                    gltf.scene.name = "base_hair";
                    headObj.add(gltf.scene);
                });
            } else {
                objLoader.load(hairObjUrl, (obj) => {
                    obj.name = "base_hair";
                    headObj.add(obj);
                    loadTextureForCustomModel(obj, hairModel);
                }, undefined, () => {
                    buildHair(headObj);
                });
            }
        }).catch(() => {
            buildHair(headObj);
        });
    }

    // 6. Equip Cloak
    const resolvedCloak = resolveSlotItem('cloak');
    if (slotVisibility.cloak && resolvedCloak.type !== 'none') {
        cloakMesh = new THREE.Group();
        cloakMesh.position.set(0, 1.3, -0.2);
        bodyGroup.add(cloakMesh);
        
        if (resolvedCloak.isReal && resolvedCloak.model) {
            loadCustomModelOrFallback('cloak', resolvedCloak.model, cloakMesh, () => {
                buildProceduralCloak(resolvedCloak.type, resolvedCloak.color);
            });
        } else {
            buildProceduralCloak(resolvedCloak.type, resolvedCloak.color);
        }
    }

    // 7. Equip Weapon
    const resolvedWeapon = resolveSlotItem('weapon');
    if (slotVisibility.weapon && resolvedWeapon.type !== 'fists') {
        weaponMesh = new THREE.Group();
        weaponMesh.position.set(0.55, 0.9, 0.2);
        bodyGroup.add(weaponMesh);
        
        if (resolvedWeapon.isReal && resolvedWeapon.model) {
            loadCustomModelOrFallback('weapon', resolvedWeapon.model, weaponMesh, () => {
                buildProceduralWeapon(resolvedWeapon.type, resolvedWeapon.color);
            });
        } else {
            buildProceduralWeapon(resolvedWeapon.type, resolvedWeapon.color);
        }
    }

    characterGroup.position.y = 0.0;
}


// Procedural decorations helper for suit
function buildProceduralSuitDecorations(torso, suitType, bodyWidth, bodyDepth, heightScale, isFemale) {
    if (suitType === 'cyberpunk') {
        const stripGeom = new THREE.BoxGeometry(bodyWidth * 0.92, 0.05, bodyDepth * 1.02);
        const stripe = new THREE.Mesh(stripGeom, materials.cyanGlow);
        stripe.position.y = 0.2;
        torso.add(stripe);
        const stripe2 = stripe.clone();
        stripe2.position.y = -0.3;
        torso.add(stripe2);
    } else if (suitType === 'dragon') {
        const gemGeom = new THREE.OctahedronGeometry(0.12);
        const gem = new THREE.Mesh(gemGeom, materials.yellowGlow);
        gem.position.set(0, 0.3, bodyDepth * 0.55);
        torso.add(gem);

        const padGeom = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI/2);
        const leftPad = new THREE.Mesh(padGeom, materials.gold);
        leftPad.position.set(-bodyWidth * 0.55, 0.7, 0);
        leftPad.rotation.z = Math.PI/4;
        torso.add(leftPad);

        const rightPad = leftPad.clone();
        rightPad.position.x = bodyWidth * 0.55;
        rightPad.rotation.z = -Math.PI/4;
        torso.add(rightPad);
    } else if (suitType === 'maid') {
        const apronGeom = new THREE.PlaneGeometry(bodyWidth * 0.5, 0.8);
        const apron = new THREE.Mesh(apronGeom, materials.whiteCloth);
        apron.position.set(0, -0.1, bodyDepth * 0.51);
        torso.add(apron);

        const skirtGeom = new THREE.CylinderGeometry(bodyWidth * 0.46, bodyWidth * 0.8, 0.6, 16, 1, true);
        const skirt = new THREE.Mesh(skirtGeom, materials.darkCloth);
        skirt.position.y = -0.7;
        torso.add(skirt);
        
        const frillGeom = new THREE.CylinderGeometry(bodyWidth * 0.79, bodyWidth * 0.82, 0.05, 16);
        const frill = new THREE.Mesh(frillGeom, materials.whiteCloth);
        frill.position.y = -0.98;
        torso.add(frill);
    } else if (suitType === 'school') {
        const tieGeom = new THREE.ConeGeometry(0.08, 0.4, 4);
        const tie = new THREE.Mesh(tieGeom, materials.darkCloth);
        tie.position.set(0, 0.3, bodyDepth * 0.52);
        tie.rotation.x = 0.05;
        torso.add(tie);
        
        const lowerGeom = new THREE.BoxGeometry(bodyWidth * 0.86, 0.2, bodyDepth * 1.05);
        const lowerMat = isFemale ? materials.darkCloth : new THREE.MeshStandardMaterial({ color: 0x475569 });
        const lower = new THREE.Mesh(lowerGeom, lowerMat);
        lower.position.y = -0.7;
        torso.add(lower);
        if (isFemale) {
            const skirtGeom = new THREE.CylinderGeometry(bodyWidth * 0.44, bodyWidth * 0.68, 0.4, 16);
            const skirt = new THREE.Mesh(skirtGeom, materials.darkCloth);
            skirt.position.y = -0.9;
            torso.add(skirt);
        }
    }
}

// Procedural Hair
function buildHair(headMesh) {
    hairGroup = new THREE.Group();
    headMesh.add(hairGroup);

    if (charHairStyle === 'bald') return;

    const capGeom = new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const cap = new THREE.Mesh(capGeom, materials.hair);
    cap.rotation.x = -Math.PI * 0.3;
    cap.position.y = 0.05;
    hairGroup.add(cap);

    if (charHairStyle === 'short') {
        const spikeGeom = new THREE.ConeGeometry(0.12, 0.32, 4);
        for (let i = -3; i <= 3; i++) {
            const spike = new THREE.Mesh(spikeGeom, materials.hair);
            spike.position.set(i * 0.12, 0.22, 0.4);
            spike.rotation.set(0.4, 0, -i * 0.25);
            hairGroup.add(spike);
        }
        const positions = [
            [0, 0.5, 0], [0.15, 0.45, 0.1], [-0.15, 0.45, 0.1],
            [0, 0.45, -0.2], [0.2, 0.4, -0.2], [-0.2, 0.4, -0.2]
        ];
        positions.forEach(pos => {
            const spike = new THREE.Mesh(spikeGeom, materials.hair);
            spike.position.set(pos[0], pos[1], pos[2]);
            spike.rotation.set((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4);
            hairGroup.add(spike);
        });
    } 
    else if (charHairStyle === 'long') {
        const backHairGeom = new THREE.BoxGeometry(0.7, 0.9, 0.25);
        const backHair = new THREE.Mesh(backHairGeom, materials.hair);
        backHair.position.set(0, -0.25, -0.38);
        hairGroup.add(backHair);

        const sideGeom = new THREE.BoxGeometry(0.16, 0.6, 0.16);
        const leftSide = new THREE.Mesh(sideGeom, materials.hair);
        leftSide.position.set(-0.45, -0.1, 0.2);
        hairGroup.add(leftSide);

        const rightSide = leftSide.clone();
        rightSide.position.x = 0.45;
        hairGroup.add(rightSide);

        const frontCapGeom = new THREE.SphereGeometry(0.18, 8, 8);
        const frontCap = new THREE.Mesh(frontCapGeom, materials.hair);
        frontCap.position.set(0, 0.35, 0.2);
        hairGroup.add(frontCap);
    } 
    else if (charHairStyle === 'twintails') {
        const sideGeom = new THREE.BoxGeometry(0.14, 0.4, 0.14);
        const leftSide = new THREE.Mesh(sideGeom, materials.hair);
        leftSide.position.set(-0.45, -0.05, 0.2);
        hairGroup.add(leftSide);

        const rightSide = leftSide.clone();
        rightSide.position.x = 0.45;
        hairGroup.add(rightSide);

        const tailGeom = new THREE.CylinderGeometry(0.08, 0.14, 0.8, 8);
        
        const leftTail = new THREE.Mesh(tailGeom, materials.hair);
        leftTail.position.set(-0.56, 0.1, -0.15);
        leftTail.rotation.z = -Math.PI / 10;
        leftTail.rotation.x = -Math.PI / 15;
        hairGroup.add(leftTail);

        const rightTail = new THREE.Mesh(tailGeom, materials.hair);
        rightTail.position.set(0.56, 0.1, -0.15);
        rightTail.rotation.z = Math.PI / 10;
        rightTail.rotation.x = -Math.PI / 15;
        hairGroup.add(rightTail);

        const bowGeom = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const bowMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 });
        const leftBow = new THREE.Mesh(bowGeom, bowMat);
        leftBow.position.set(-0.5, 0.42, -0.1);
        hairGroup.add(leftBow);
        
        const rightBow = leftBow.clone();
        rightBow.position.x = 0.5;
        hairGroup.add(rightBow);
    } 
    else if (charHairStyle === 'ponytail') {
        const sideGeom = new THREE.BoxGeometry(0.14, 0.4, 0.14);
        const leftSide = new THREE.Mesh(sideGeom, materials.hair);
        leftSide.position.set(-0.45, -0.05, 0.2);
        hairGroup.add(leftSide);
        const rightSide = leftSide.clone();
        rightSide.position.x = 0.45;
        hairGroup.add(rightSide);

        const ponytailGeom = new THREE.CylinderGeometry(0.06, 0.15, 0.9, 8);
        const ponytail = new THREE.Mesh(ponytailGeom, materials.hair);
        ponytail.position.set(0, 0.1, -0.56);
        ponytail.rotation.x = -Math.PI / 5;
        hairGroup.add(ponytail);

        const bandGeom = new THREE.TorusGeometry(0.09, 0.03, 8, 16);
        const bandMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.5 });
        const band = new THREE.Mesh(bandGeom, bandMat);
        band.position.set(0, 0.38, -0.45);
        band.rotation.x = -Math.PI/6;
        hairGroup.add(band);
    }
}

function buildSmallShoeWing(isLeft) {
    const wing = new THREE.Group();
    const featherGeom = new THREE.BoxGeometry(0.05, 0.1, 0.2);
    const sideSign = isLeft ? -1 : 1;

    for (let i = 0; i < 3; i++) {
        const feather = new THREE.Mesh(featherGeom, materials.whiteCloth);
        feather.position.set(sideSign * 0.16, 0.15 + i * 0.06, -0.1 - i * 0.08);
        feather.rotation.set(-0.2, sideSign * 0.4, -0.3 * sideSign);
        wing.add(feather);
    }
    return wing;
}

// ----------------------------------------------------
// DYNAMIC 3D MODEL LOADING FROM SERVER PROXY
// ----------------------------------------------------
function loadTextureForCustomModel(obj, baseName) {
    const pngUrl = `/api/fashion/assets/Model/${baseName}.png`;
    const ddsUrl = `/api/fashion/assets/Model/${baseName}.dds`;

    const ddsLoader = new THREE.DDSLoader();
    const textureLoader = new THREE.TextureLoader();

    // Try to load DDS texture from container first
    fetch(ddsUrl, { method: 'HEAD' })
        .then(res => {
            if (res.ok) {
                ddsLoader.load(ddsUrl, (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    obj.traverse((child) => {
                        if (child.isMesh) {
                            child.material = new THREE.MeshStandardMaterial({
                                map: texture,
                                roughness: 0.6,
                                metalness: 0.1
                            });
                            child.material.needsUpdate = true;
                        }
                    });
                });
            } else {
                textureLoader.load(pngUrl, (texture) => {
                    obj.traverse((child) => {
                        if (child.isMesh) {
                            child.material = new THREE.MeshStandardMaterial({
                                map: texture,
                                roughness: 0.6
                            });
                            child.material.needsUpdate = true;
                        }
                    });
                });
            }
        })
        .catch(() => {
            textureLoader.load(pngUrl, (texture) => {
                obj.traverse((child) => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshStandardMaterial({
                            map: texture,
                            roughness: 0.6
                        });
                        child.material.needsUpdate = true;
                    }
                });
            });
        });
}

function loadCustomModelOrFallback(slot, modelFilename, parentNode, proceduralFallback) {
    if (!modelFilename) {
        proceduralFallback();
        return;
    }

    const baseName = modelFilename.substring(0, modelFilename.lastIndexOf('.')) || modelFilename;
    const glbUrl = `/api/fashion/assets/Model/${baseName}.glb`;
    const objUrl = `/api/fashion/assets/Model/${baseName}.obj`;

    const loaderGLTF = new THREE.GLTFLoader();
    const loaderOBJ = new THREE.OBJLoader();

    // 1. Try loading glTF (.glb) first (modern format)
    loaderGLTF.load(glbUrl, 
        (gltf) => {
            const obj = gltf.scene;
            obj.name = "custom_" + slot;
            adjustCustomModelScale(slot, obj);
            parentNode.add(obj);
        },
        undefined,
        () => {
            // 2. Fallback to .obj format (dynamic .o3d backend conversion)
            loaderOBJ.load(objUrl,
                (obj) => {
                    loadTextureForCustomModel(obj, baseName);
                    obj.name = "custom_" + slot;
                    adjustCustomModelScale(slot, obj);
                    parentNode.add(obj);
                },
                undefined,
                () => {
                    proceduralFallback();
                }
            );
        }
    );
}

function adjustCustomModelScale(slot, obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    let targetSize = 1.0;
    if (slot === 'head') targetSize = 0.5;
    else if (slot === 'weapon') targetSize = 1.1;
    else if (slot === 'cloak') targetSize = 1.5;
    else if (slot === 'suit') targetSize = 1.3;
    else if (slot === 'shoes') targetSize = 0.3;
    
    if (maxDim > 0) {
        const scaleFactor = targetSize / maxDim;
        obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
    
    const center = box.getCenter(new THREE.Vector3());
    obj.position.x = -center.x * obj.scale.x;
    obj.position.y = -center.y * obj.scale.y;
    obj.position.z = -center.z * obj.scale.z;
    
    // Position offsets based on slot
    if (slot === 'head') {
        obj.position.y += 0.45; 
        obj.position.z += 0.05;
    } else if (slot === 'weapon') {
        obj.rotation.x = Math.PI / 2;
        obj.position.z += 0.2;
    } else if (slot === 'cloak') {
        obj.position.z -= 0.1;
    }
}

// ----------------------------------------------------
// HEADWEAR ATTACHMENT
// ----------------------------------------------------
function updateEquippedHead() {
    const head = bodyMeshes.head;
    if (!head) return;

    if (headwearMesh) {
        head.remove(headwearMesh);
        headwearMesh = null;
    }

    if (!slotVisibility.head || equippedSlots.head === 'none') {
        return;
    }

    headwearMesh = new THREE.Group();
    head.add(headwearMesh);

    const resolved = resolveSlotItem('head');

    if (resolved.isReal && resolved.model) {
        loadCustomModelOrFallback('head', resolved.model, headwearMesh, () => {
            buildProceduralHeadwear(resolved.type, resolved.color);
        });
    } else {
        buildProceduralHeadwear(resolved.type, resolved.color);
    }
}

function buildProceduralHeadwear(type, customColor) {
    if (type === 'none' || type === 'ninja_mask') return;

    let customHeadMat = customColor ? new THREE.MeshStandardMaterial({ color: customColor, roughness: 0.5 }) : null;

    if (type === 'cat_ears') {
        const earGeom = new THREE.ConeGeometry(0.16, 0.28, 4);
        
        const leftEar = new THREE.Mesh(earGeom, materials.hair);
        leftEar.position.set(-0.3, 0.42, 0.1);
        leftEar.rotation.set(-0.2, 0, 0.3);
        headwearMesh.add(leftEar);

        const innerGeom = new THREE.ConeGeometry(0.08, 0.22, 4);
        const innerMat = new THREE.MeshStandardMaterial({ color: 0xff99bb, roughness: 0.6 });
        const leftInner = new THREE.Mesh(innerGeom, innerMat);
        leftInner.position.set(-0.29, 0.43, 0.13);
        leftInner.rotation.set(-0.18, 0, 0.3);
        headwearMesh.add(leftInner);

        const rightEar = leftEar.clone();
        rightEar.position.x = 0.3;
        rightEar.rotation.z = -0.3;
        headwearMesh.add(rightEar);

        const rightInner = leftInner.clone();
        rightInner.position.x = 0.29;
        rightInner.rotation.z = -0.3;
        headwearMesh.add(rightInner);
    } 
    else if (type === 'halo') {
        const haloGeom = new THREE.TorusGeometry(0.38, 0.04, 8, 32);
        const halo = new THREE.Mesh(haloGeom, customHeadMat || materials.yellowGlow);
        halo.position.set(0, 0.75, -0.05);
        halo.rotation.x = Math.PI / 2;
        headwearMesh.add(halo);
    } 
    else if (type === 'wizard_hat') {
        const brimGeom = new THREE.CylinderGeometry(0.72, 0.72, 0.04, 32);
        const wizardMat = customHeadMat || new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
        const brim = new THREE.Mesh(brimGeom, wizardMat);
        brim.position.y = 0.45;
        brim.rotation.x = 0.08;
        headwearMesh.add(brim);

        const coneGeom = new THREE.ConeGeometry(0.42, 0.9, 16);
        const cone = new THREE.Mesh(coneGeom, wizardMat);
        cone.position.set(0, 0.88, -0.05);
        cone.rotation.x = -0.15;
        headwearMesh.add(cone);

        const bandGeom = new THREE.TorusGeometry(0.32, 0.04, 8, 16);
        const band = new THREE.Mesh(bandGeom, materials.yellowGlow);
        band.position.set(0, 0.49, 0.01);
        band.rotation.x = Math.PI/2 + 0.08;
        headwearMesh.add(band);
    } 
    else if (type === 'crown') {
        const bandGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.15, 24, 1, true);
        const crown = new THREE.Mesh(bandGeom, customHeadMat || materials.gold);
        crown.position.y = 0.48;
        headwearMesh.add(crown);

        const spikeGeom = new THREE.ConeGeometry(0.08, 0.22, 4);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const spike = new THREE.Mesh(spikeGeom, customHeadMat || materials.gold);
            spike.position.set(Math.cos(angle) * 0.38, 0.62, Math.sin(angle) * 0.38);
            spike.rotation.set(0, -angle + Math.PI/2, 0);
            crown.add(spike);

            if (i % 2 === 0) {
                const jewelGeom = new THREE.SphereGeometry(0.03, 8, 8);
                const jewelMat = new THREE.MeshBasicMaterial({ color: i === 0 || i === 4 ? 0xef4444 : 0x3b82f6 });
                const jewel = new THREE.Mesh(jewelGeom, jewelMat);
                jewel.position.set(Math.cos(angle) * 0.395, 0.48, Math.sin(angle) * 0.395);
                crown.add(jewel);
            }
        }
    } 
    else if (type === 'pirate_hat') {
        const hatGroup = new THREE.Group();
        hatGroup.position.set(0, 0.52, -0.05);
        headwearMesh.add(hatGroup);

        const mainGeom = new THREE.BoxGeometry(0.9, 0.3, 0.6);
        const pirateMat = customHeadMat || materials.darkCloth;
        const mainHat = new THREE.Mesh(mainGeom, pirateMat);
        hatGroup.add(mainHat);

        const flapGeom = new THREE.BoxGeometry(1.0, 0.4, 0.1);
        const frontFlap = new THREE.Mesh(flapGeom, pirateMat);
        frontFlap.position.set(0, 0.1, 0.28);
        frontFlap.rotation.x = -0.15;
        hatGroup.add(frontFlap);

        const backFlap = frontFlap.clone();
        backFlap.position.z = -0.28;
        backFlap.rotation.x = 0.15;
        hatGroup.add(backFlap);

        const logoGeom = new THREE.BoxGeometry(0.12, 0.12, 0.02);
        const logo = new THREE.Mesh(logoGeom, materials.whiteCloth);
        logo.position.set(0, 0.08, 0.34);
        hatGroup.add(logo);
    }
}

// ----------------------------------------------------
// CLOAK ATTACHMENT
// ----------------------------------------------------
function updateEquippedCloak() {
    const torso = bodyMeshes.torso;
    if (!torso) return;

    if (cloakMesh) {
        torso.remove(cloakMesh);
        cloakMesh = null;
    }

    if (!slotVisibility.cloak || equippedSlots.cloak === 'none') {
        return;
    }

    cloakMesh = new THREE.Group();
    cloakMesh.position.set(0, 0, -0.42);
    torso.add(cloakMesh);

    const resolved = resolveSlotItem('cloak');

    if (resolved.isReal && resolved.model) {
        loadCustomModelOrFallback('cloak', resolved.model, cloakMesh, () => {
            buildProceduralCloak(resolved.type, resolved.color);
        });
    } else {
        buildProceduralCloak(resolved.type, resolved.color);
    }
}

function buildProceduralCloak(type, customColor) {
    let customCloakMat = customColor ? new THREE.MeshStandardMaterial({ color: customColor, roughness: 0.6 }) : null;

    if (type === 'angel_wings') {
        const wingMat = customCloakMat || materials.whiteCloth;
        
        const leftWing = new THREE.Group();
        leftWing.name = "left_wing";
        leftWing.position.set(-0.15, 0.2, 0);
        cloakMesh.add(leftWing);

        for (let i = 0; i < 4; i++) {
            const fGeom = new THREE.BoxGeometry(0.9 - i * 0.18, 0.18, 0.05);
            const feather = new THREE.Mesh(fGeom, wingMat);
            feather.position.set(-0.45, 0.2 - i * 0.14, -i * 0.05);
            feather.rotation.z = 0.2 + i * 0.12;
            leftWing.add(feather);
        }

        const rightWing = new THREE.Group();
        rightWing.name = "right_wing";
        rightWing.position.set(0.15, 0.2, 0);
        cloakMesh.add(rightWing);

        for (let i = 0; i < 4; i++) {
            const fGeom = new THREE.BoxGeometry(0.9 - i * 0.18, 0.18, 0.05);
            const feather = new THREE.Mesh(fGeom, wingMat);
            feather.position.set(0.45, 0.2 - i * 0.14, -i * 0.05);
            feather.rotation.z = -0.2 - i * 0.12;
            rightWing.add(feather);
        }
    } 
    else if (type === 'demon_wings') {
        const wingMat = customCloakMat || new THREE.MeshStandardMaterial({ color: 0x3b0764, roughness: 0.7 });
        const neonMat = materials.pinkGlow;

        const leftWing = new THREE.Group();
        leftWing.name = "left_wing";
        leftWing.position.set(-0.15, 0.2, 0);
        cloakMesh.add(leftWing);

        const frameGeom = new THREE.BoxGeometry(0.8, 0.1, 0.06);
        const frame = new THREE.Mesh(frameGeom, wingMat);
        frame.position.set(-0.4, 0.2, 0);
        frame.rotation.z = 0.3;
        leftWing.add(frame);

        const spikeGeom = new THREE.ConeGeometry(0.08, 0.4, 4);
        for (let i = 0; i < 3; i++) {
            const spike = new THREE.Mesh(spikeGeom, wingMat);
            spike.position.set(-0.2 - i * 0.22, 0.08 - i * 0.15, 0);
            spike.rotation.z = -0.5 - i * 0.3;
            leftWing.add(spike);

            const glowDot = new THREE.Mesh(new THREE.SphereGeometry(0.04), neonMat);
            glowDot.position.set(-0.2 - i * 0.22, -0.15 - i * 0.15, 0);
            leftWing.add(glowDot);
        }

        const rightWing = new THREE.Group();
        rightWing.name = "right_wing";
        rightWing.position.set(0.15, 0.2, 0);
        cloakMesh.add(rightWing);

        const frame2 = new THREE.Mesh(frameGeom, wingMat);
        frame2.position.set(0.4, 0.2, 0);
        frame2.rotation.z = -0.3;
        rightWing.add(frame2);

        for (let i = 0; i < 3; i++) {
            const spike = new THREE.Mesh(spikeGeom, wingMat);
            spike.position.set(0.2 + i * 0.22, 0.08 - i * 0.15, 0);
            spike.rotation.z = 0.5 + i * 0.3;
            rightWing.add(spike);

            const glowDot = new THREE.Mesh(new THREE.SphereGeometry(0.04), neonMat);
            glowDot.position.set(0.2 + i * 0.22, -0.15 - i * 0.15, 0);
            rightWing.add(glowDot);
        }
    } 
    else if (type === 'butterfly_wings') {
        const wingMat = customCloakMat || new THREE.MeshStandardMaterial({
            color: 0x3b82f6,
            roughness: 0.5,
            transparent: true,
            opacity: 0.8
        });

        const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.02), wingMat);
        leftWing.name = "left_wing";
        leftWing.position.set(-0.55, 0.1, 0.05);
        leftWing.rotation.y = 0.4;
        cloakMesh.add(leftWing);

        const pat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.04), materials.yellowGlow);
        pat.position.set(0, 0.1, 0.01);
        leftWing.add(pat);

        const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.02), wingMat);
        rightWing.name = "right_wing";
        rightWing.position.set(0.55, 0.1, 0.05);
        rightWing.rotation.y = -0.4;
        cloakMesh.add(rightWing);

        const pat2 = pat.clone();
        rightWing.add(pat2);
    } 
    else if (type === 'hero_cape') {
        const cape = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.6, 0.04), customCloakMat || materials.redVelvet);
        cape.name = "cape";
        cape.position.set(0, -0.7, -0.05);
        
        const capePivot = new THREE.Group();
        capePivot.name = "cape_pivot";
        capePivot.position.set(0, 0.4, 0);
        capePivot.add(cape);
        
        cloakMesh.add(capePivot);
    } 
    else if (type === 'jetpack') {
        const jetGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.8, 12);
        const leftJet = new THREE.Mesh(jetGeom, customCloakMat || materials.metal);
        leftJet.position.set(-0.2, 0.1, 0.1);
        cloakMesh.add(leftJet);

        const rightJet = leftJet.clone();
        rightJet.position.x = 0.2;
        cloakMesh.add(rightJet);

        const barGeom = new THREE.BoxGeometry(0.4, 0.08, 0.1);
        const bar = new THREE.Mesh(barGeom, materials.metal);
        bar.position.set(0, 0.1, 0.05);
        cloakMesh.add(bar);

        const fireGeom = new THREE.ConeGeometry(0.08, 0.3, 8);
        const leftFire = new THREE.Mesh(fireGeom, materials.yellowGlow);
        leftFire.name = "jet_fire_l";
        leftFire.position.y = -0.55;
        leftFire.rotation.x = Math.PI;
        leftJet.add(leftFire);

        const rightFire = leftFire.clone();
        rightFire.name = "jet_fire_r";
        rightJet.add(rightFire);
    }
}

// ----------------------------------------------------
// WEAPON ATTACHMENT
// ----------------------------------------------------
function updateEquippedWeapon() {
    const rightArm = bodyMeshes.rightArm;
    const leftArm = bodyMeshes.leftArm;
    if (!rightArm || !leftArm) return;

    if (weaponMesh) {
        rightArm.remove(weaponMesh);
        weaponMesh = null;
    }
    if (leftWeaponMesh) {
        leftArm.remove(leftWeaponMesh);
        leftWeaponMesh = null;
    }

    if (!slotVisibility.weapon || equippedSlots.weapon === 'fists') {
        return;
    }

    const resolved = resolveSlotItem('weapon');

    if (resolved.type !== 'royal_shield') {
        weaponMesh = new THREE.Group();
        weaponMesh.position.set(0, -0.9, 0.1);
        rightArm.add(weaponMesh);

        if (resolved.isReal && resolved.model) {
            loadCustomModelOrFallback('weapon', resolved.model, weaponMesh, () => {
                buildProceduralWeapon(resolved.type, resolved.color);
            });
        } else {
            buildProceduralWeapon(resolved.type, resolved.color);
        }
    } 
    else {
        // Shield in Left Hand
        leftWeaponMesh = new THREE.Group();
        leftWeaponMesh.position.set(0, -0.9, 0.1);
        leftArm.add(leftWeaponMesh);

        if (resolved.isReal && resolved.model) {
            loadCustomModelOrFallback('weapon', resolved.model, leftWeaponMesh, () => {
                buildProceduralShield(resolved.color);
            });
        } else {
            buildProceduralShield(resolved.color);
        }
    }
}

function buildProceduralWeapon(type, customColor) {
    let customWepMat = customColor ? new THREE.MeshStandardMaterial({ color: customColor, roughness: 0.4 }) : null;

    if (type === 'laser_saber') {
        const hiltGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
        const hilt = new THREE.Mesh(hiltGeom, materials.metal);
        hilt.position.y = 0.05;
        hilt.rotation.x = Math.PI / 2;
        weaponMesh.add(hilt);

        const bladeGeom = new THREE.CylinderGeometry(0.035, 0.035, 1.8, 8);
        const blade = new THREE.Mesh(bladeGeom, customWepMat || materials.cyanGlow);
        blade.position.y = 0.9;
        hilt.add(blade);
    } 
    else if (type === 'wood_sword') {
        const hiltGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8);
        const hilt = new THREE.Mesh(hiltGeom, materials.wood);
        hilt.rotation.x = Math.PI / 2;
        weaponMesh.add(hilt);

        const guardGeom = new THREE.BoxGeometry(0.35, 0.06, 0.08);
        const guard = new THREE.Mesh(guardGeom, customWepMat || materials.metal);
        guard.position.y = 0.2;
        hilt.add(guard);

        const bladeGeom = new THREE.BoxGeometry(0.08, 1.2, 0.02);
        const blade = new THREE.Mesh(bladeGeom, customWepMat || materials.metal);
        blade.position.y = 0.8;
        hilt.add(blade);
    } 
    else if (type === 'magic_wand') {
        const shaftGeom = new THREE.CylinderGeometry(0.02, 0.02, 1.1, 8);
        const shaft = new THREE.Mesh(shaftGeom, materials.wood);
        shaft.rotation.x = Math.PI / 2;
        weaponMesh.add(shaft);

        const star = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), customWepMat || materials.yellowGlow);
        star.position.y = 0.6;
        shaft.add(star);

        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 6, 16), customWepMat || materials.gold);
        ring.position.y = 0.6;
        ring.rotation.x = Math.PI / 3;
        shaft.add(ring);
    } 
    else if (type === 'dragon_bow') {
        const bowGroup = new THREE.Group();
        bowGroup.rotation.x = Math.PI / 2;
        bowGroup.position.set(-0.1, 0, 0.3);
        weaponMesh.add(bowGroup);

        const arc = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.04, 8, 24, Math.PI * 0.8), customWepMat || materials.redVelvet);
        arc.rotation.z = -Math.PI * 0.4;
        bowGroup.add(arc);

        const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 4), materials.gold);
        horn1.position.set(-0.55, 0.45, 0);
        horn1.rotation.z = 0.8;
        bowGroup.add(horn1);
        
        const horn2 = horn1.clone();
        horn2.position.set(0.55, 0.45, 0);
        horn2.rotation.z = -0.8;
        bowGroup.add(horn2);

        const bowString = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 1.35, 4), materials.whiteCloth);
        bowString.position.set(0, 0.25, 0);
        bowString.rotation.z = Math.PI / 2;
        bowGroup.add(bowString);
    } 
    else if (type === 'golden_axe') {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 8), materials.wood);
        handle.rotation.x = Math.PI / 2;
        weaponMesh.add(handle);

        const leftBlade = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.02), customWepMat || materials.gold);
        leftBlade.position.set(-0.2, 0.5, 0);
        leftBlade.rotation.y = 0.1;
        handle.add(leftBlade);

        const rightBlade = leftBlade.clone();
        rightBlade.position.x = 0.2;
        rightBlade.rotation.y = -0.1;
        handle.add(rightBlade);
    }
}

function buildProceduralShield(customColor) {
    let customShieldMat = customColor ? new THREE.MeshStandardMaterial({ color: customColor, roughness: 0.4 }) : null;

    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 6), customShieldMat || materials.metal);
    shield.rotation.x = Math.PI / 2;
    leftWeaponMesh.add(shield);

    const border = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 6, 16), materials.gold);
    shield.add(border);

    const boss = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), materials.gold);
    boss.position.y = 0.04;
    shield.add(boss);
}

// ----------------------------------------------------
// KEYWORD INTELLIGENT MATCHERS FOR MOCK MODELS
// ----------------------------------------------------
function getProceduralTypeFromRealName(slot, name) {
    if (!name) return 'none';
    const lower = name.toLowerCase();
    
    if (slot === 'head') {
        if (lower.includes('gato') || lower.includes('cat') || lower.includes('orejas') || lower.includes('ears')) return 'cat_ears';
        if (lower.includes('halo') || lower.includes('aurora') || lower.includes('angelical')) return 'halo';
        if (lower.includes('mago') || lower.includes('wizard') || lower.includes('sombrero') || lower.includes('bruja') || lower.includes('witch')) return 'wizard_hat';
        if (lower.includes('corona') || lower.includes('crown') || lower.includes('rey') || lower.includes('reina') || lower.includes('king') || lower.includes('queen') || lower.includes('tiara')) return 'crown';
        if (lower.includes('pirata') || lower.includes('pirate')) return 'pirate_hat';
        if (lower.includes('ninja') || lower.includes('máscara') || lower.includes('mask') || lower.includes('antifaz')) return 'ninja_mask';
        return 'crown'; 
    }
    
    if (slot === 'suit') {
        if (lower.includes('maid') || lower.includes('sirvienta') || lower.includes('delantal') || lower.includes('sirviente')) return 'maid';
        if (lower.includes('cyber') || lower.includes('cyberpunk') || lower.includes('neón') || lower.includes('neon') || lower.includes('futurista')) return 'cyberpunk';
        if (lower.includes('dragón') || lower.includes('dragon') || lower.includes('armadura') || lower.includes('placas') || lower.includes('plate')) return 'dragon';
        if (lower.includes('astronauta') || lower.includes('astronaut') || lower.includes('espacio') || lower.includes('space')) return 'astronaut';
        if (lower.includes('colegio') || lower.includes('escuela') || lower.includes('school') || lower.includes('uniforme') || lower.includes('uniform')) return 'school';
        return 'common';
    }
    
    if (slot === 'gloves') {
        if (lower.includes('oro') || lower.includes('gold') || lower.includes('bracaletes') || lower.includes('bracers') || lower.includes('brazales') || lower.includes('brazaletes')) return 'gold_bracers';
        if (lower.includes('boxeo') || lower.includes('boxing') || lower.includes('pelea') || lower.includes('guante')) return 'boxing';
        if (lower.includes('cyber') || lower.includes('futuro') || lower.includes('neon') || lower.includes('neón')) return 'cyber_gloves';
        return 'default';
    }
    
    if (slot === 'shoes') {
        if (lower.includes('metal') || lower.includes('hierro') || lower.includes('placa') || lower.includes('botas') || lower.includes('boots')) return 'metal_boots';
        if (lower.includes('alas') || lower.includes('aladas') || lower.includes('winged') || lower.includes('vuelo')) return 'winged_boots';
        if (lower.includes('deporte') || lower.includes('tenis') || lower.includes('zapatillas') || lower.includes('sneakers')) return 'sneakers';
        return 'common';
    }
    
    if (slot === 'cloak') {
        if (lower.includes('ángel') || lower.includes('angel') || lower.includes('blancas') || lower.includes('sagrada') || lower.includes('celeste')) return 'angel_wings';
        if (lower.includes('demonio') || lower.includes('demon') || lower.includes('abismo') || lower.includes('oscura') || lower.includes('vampiro') || lower.includes('murciélago') || lower.includes('inframundo')) return 'demon_wings';
        if (lower.includes('mariposa') || lower.includes('butterfly') || lower.includes('hada') || lower.includes('fairy')) return 'butterfly_wings';
        if (lower.includes('capa') || lower.includes('cape') || lower.includes('manto') || lower.includes('hero')) return 'hero_cape';
        if (lower.includes('cohete') || lower.includes('propulsor') || lower.includes('jetpack') || lower.includes('mochila')) return 'jetpack';
        return 'angel_wings'; 
    }
    
    if (slot === 'weapon') {
        if (lower.includes('láser') || lower.includes('laser') || lower.includes('sable') || lower.includes('lightsaber') || lower.includes('luz') || lower.includes('neón')) return 'laser_saber';
        if (lower.includes('madera') || lower.includes('wood') || lower.includes('entrenamiento') || lower.includes('espada de madera')) return 'wood_sword';
        if (lower.includes('vara') || lower.includes('varita') || lower.includes('wand') || lower.includes('bastón') || lower.includes('staff') || lower.includes('cetro')) return 'magic_wand';
        if (lower.includes('arco') || lower.includes('bow')) return 'dragon_bow';
        if (lower.includes('hacha') || lower.includes('axe')) return 'golden_axe';
        if (lower.includes('escudo') || lower.includes('shield')) return 'royal_shield';
        return 'wood_sword';
    }
    
    return 'none';
}

function getProceduralColorFromRealName(name, defaultColor) {
    if (!name) return defaultColor;
    const lower = name.toLowerCase();
    
    if (lower.includes('rojo') || lower.includes('red') || lower.includes('fuego') || lower.includes('fire') || lower.includes('rubí')) return '#ef4444';
    if (lower.includes('azul') || lower.includes('blue') || lower.includes('agua') || lower.includes('water') || lower.includes('zafiro')) return '#3b82f6';
    if (lower.includes('verde') || lower.includes('green') || lower.includes('bosque') || lower.includes('esmeralda')) return '#10b981';
    if (lower.includes('rosa') || lower.includes('pink') || lower.includes('amor')) return '#ec4899';
    if (lower.includes('amarillo') || lower.includes('yellow') || lower.includes('rayo') || lower.includes('sol')) return '#eab308';
    if (lower.includes('blanco') || lower.includes('white') || lower.includes('nieve') || lower.includes('sagrado')) return '#ffffff';
    if (lower.includes('negro') || lower.includes('black') || lower.includes('sombra') || lower.includes('oscuridad') || lower.includes('dark')) return '#1e1b18';
    if (lower.includes('oro') || lower.includes('gold') || lower.includes('dorado') || lower.includes('brillante')) return '#d4af37';
    if (lower.includes('morado') || lower.includes('purple') || lower.includes('violeta') || lower.includes('abismo')) return '#8b5cf6';
    if (lower.includes('naranja') || lower.includes('orange') || lower.includes('otoño')) return '#f97316';
    
    return defaultColor;
}

// ----------------------------------------------------
// ANIMATION TICK LOOP
// ----------------------------------------------------
function animate() {
    if (!isInitialized) return;

    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    if (controls) controls.update();

    if (isAnimating) {
        // 1. Idle Breathing / Float Animation
        if (currentAnimation === 'idle') {
            const breathe = Math.sin(time * 2.0);
            if (bodyMeshes.torso) {
                bodyMeshes.torso.position.y = (1.6 * (charGender === 'female' ? 0.9 : 1.0)) + breathe * 0.03;
            }
            if (bodyMeshes.leftArm) bodyMeshes.leftArm.rotation.z = Math.PI / 16 + Math.sin(time * 1.5) * 0.03;
            if (bodyMeshes.rightArm) bodyMeshes.rightArm.rotation.z = -Math.PI / 16 - Math.sin(time * 1.5) * 0.03;
        } 
        else if (currentAnimation === 'float') {
            const hover = Math.sin(time * 3.0);
            if (characterGroup) {
                characterGroup.position.y = (1.35 * (charGender === 'female' ? 0.9 : 1.0)) + hover * 0.15;
            }
            if (bodyMeshes.leftLeg) bodyMeshes.leftLeg.rotation.x = Math.sin(time * 3.0) * 0.05 + 0.1;
            if (bodyMeshes.rightLeg) bodyMeshes.rightLeg.rotation.x = -Math.sin(time * 3.0) * 0.05 + 0.1;
            if (bodyMeshes.leftArm) bodyMeshes.leftArm.rotation.x = -0.1;
            if (bodyMeshes.rightArm) bodyMeshes.rightArm.rotation.x = -0.1;
        } 
        else if (currentAnimation === 'dance') {
            const swing = Math.sin(time * 4.0);
            if (characterGroup) {
                characterGroup.rotation.y = swing * 0.25;
                characterGroup.position.y = (1.35 * (charGender === 'female' ? 0.9 : 1.0)) + Math.abs(swing) * 0.1;
            }
            if (bodyMeshes.leftArm) bodyMeshes.leftArm.rotation.z = Math.PI/6 + Math.sin(time * 4.0) * 0.2;
            if (bodyMeshes.rightArm) bodyMeshes.rightArm.rotation.z = -Math.PI/6 - Math.cos(time * 4.0) * 0.2;
        }

        // 2. Wings flapping
        const resolvedCloak = resolveSlotItem('cloak');
        if (cloakMesh && (resolvedCloak.type === 'angel_wings' || resolvedCloak.type === 'demon_wings' || resolvedCloak.type === 'butterfly_wings')) {
            const leftW = cloakMesh.getObjectByName("left_wing");
            const rightW = cloakMesh.getObjectByName("right_wing");

            if (leftW && rightW) {
                const flapSpeed = currentAnimation === 'float' ? 6.0 : 3.0;
                const flapAngle = Math.cos(time * flapSpeed) * 0.2;
                leftW.rotation.y = flapAngle + 0.2;
                rightW.rotation.y = -flapAngle - 0.2;
            }
        }

        // 3. Cape waving
        if (cloakMesh && resolvedCloak.type === 'hero_cape') {
            const capePivot = cloakMesh.getObjectByName("cape_pivot");
            if (capePivot) {
                capePivot.rotation.x = 0.2 + Math.sin(time * 4.0) * 0.08;
                capePivot.rotation.y = Math.cos(time * 2.0) * 0.03;
            }
        }

        // 4. Jetpack Fire flickering
        if (cloakMesh && resolvedCloak.type === 'jetpack') {
            const fireL = cloakMesh.getObjectByName("jet_fire_l");
            const fireR = cloakMesh.getObjectByName("jet_fire_r");
            if (fireL && fireR) {
                const scale = 0.8 + Math.random() * 0.5;
                fireL.scale.set(scale, scale * 1.5, scale);
                fireR.scale.set(scale, scale * 1.5, scale);
            }
        }

        // 5. Weapon rotation
        const resolvedWeapon = resolveSlotItem('weapon');
        if (weaponMesh && resolvedWeapon.type === 'magic_wand') {
            weaponMesh.rotation.y += delta * 2;
        }
    }

    if (renderer) {
        renderer.render(scene, camera);
    }
}

// ----------------------------------------------------
// UI CONTROLS BINDING
// ----------------------------------------------------

function resetFashionCamera() {
    if (controls) {
        controls.reset();
        camera.position.set(0, 1.5, 6.5);
        controls.target.set(0, 1.2, 0);
    }
}

function toggleFashionAnimation() {
    isAnimating = !isAnimating;
    const btn = document.getElementById('btn-toggle-animation');
    if (btn) {
        btn.innerHTML = isAnimating ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    }
}

function randomizeFashion() {
    const genders = ['male', 'female'];
    charGender = genders[Math.floor(Math.random() * genders.length)];
    
    const hairStyles = ['short', 'long', 'twintails', 'ponytail', 'bald'];
    charHairStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
    
    charHairColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    
    const skinColors = ['#ffd5b4', '#e0a97f', '#8c5b3b', '#a5d3f5', '#b3e6c3'];
    charSkinColor = skinColors[Math.floor(Math.random() * skinColors.length)];

    updateSkinUISelection();
    document.getElementById('fashion-hair-style').value = charHairStyle;
    document.getElementById('fashion-hair-color').value = charHairColor;
    
    const genderMaleBtn = document.getElementById('btn-gender-male');
    const genderFemaleBtn = document.getElementById('btn-gender-female');
    if (charGender === 'male') {
        genderMaleBtn.classList.add('active');
        genderFemaleBtn.classList.remove('active');
    } else {
        genderFemaleBtn.classList.add('active');
        genderMaleBtn.classList.remove('active');
    }

    const slots = ['head', 'suit', 'gloves', 'shoes', 'cloak', 'weapon'];
    slots.forEach(slot => {
        const select = document.getElementById(`fashion-equip-${slot}`);
        if (select && select.options.length > 1) {
            const randomIndex = Math.floor(Math.random() * select.options.length);
            const val = select.options[randomIndex].value;
            select.value = val;
            equipFashionItem(slot, val);
        }
    });
}

function clearFashion() {
    equippedSlots = {
        head: 'none',
        suit: 'common',
        gloves: 'default',
        shoes: 'common',
        cloak: 'none',
        weapon: 'fists'
    };
    realEquippedItems = {
        head: null,
        suit: null,
        gloves: null,
        shoes: null,
        cloak: null,
        weapon: null
    };
    syncEquipDropdowns();
    rebuildCharacter();
}

function syncEquipDropdowns() {
    for (const slot of ['head', 'suit', 'gloves', 'shoes', 'cloak', 'weapon']) {
        const el = document.getElementById(`fashion-equip-${slot}`);
        if (el) el.value = equippedSlots[slot];
    }
}

function setFashionGender(g) {
    if (charGender === g) return;
    charGender = g;
    
    const maleBtn = document.getElementById('btn-gender-male');
    const femaleBtn = document.getElementById('btn-gender-female');
    if (g === 'male') {
        maleBtn.classList.add('active');
        femaleBtn.classList.remove('active');
    } else {
        femaleBtn.classList.add('active');
        maleBtn.classList.remove('active');
    }

    rebuildCharacter();
}

function updateFashionHairStyle(style) {
    charHairStyle = style;
    rebuildCharacter();
}

function updateFashionHairColor(color) {
    charHairColor = color;
    materials.hair.color.set(color);
}

function setHairPresetColor(color) {
    document.getElementById('fashion-hair-color').value = color;
    updateFashionHairColor(color);
}

function setFashionSkinColor(color, element) {
    charSkinColor = color;
    
    document.querySelectorAll('.btn-skin').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');

    rebuildCharacter();
}

function updateSkinUISelection() {
    document.querySelectorAll('.btn-skin').forEach(btn => {
        const btnBg = btn.style.backgroundColor;
        const temp = document.createElement('div');
        temp.style.color = charSkinColor;
        document.body.appendChild(temp);
        const resolvedColor = getComputedStyle(temp).color;
        document.body.removeChild(temp);
        
        if (btnBg === resolvedColor) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function updateFashionAnimationType(type) {
    currentAnimation = type;
    
    if (characterGroup) {
        characterGroup.position.set(0, 1.35 * (charGender === 'female' ? 0.9 : 1.0), 0);
        characterGroup.rotation.set(0, 0, 0);
    }
    if (bodyMeshes.torso) bodyMeshes.torso.position.y = 1.6 * (charGender === 'female' ? 0.9 : 1.0);
    if (bodyMeshes.leftArm) bodyMeshes.leftArm.rotation.set(0, 0, 0);
    if (bodyMeshes.rightArm) bodyMeshes.rightArm.rotation.set(0, 0, 0);
    if (bodyMeshes.leftLeg) bodyMeshes.leftLeg.rotation.set(0, 0, 0);
    if (bodyMeshes.rightLeg) bodyMeshes.rightLeg.rotation.set(0, 0, 0);
}

// Handler for equipment change
function equipFashionItem(slot, itemValue) {
    equippedSlots[slot] = itemValue;

    // Check if this is a real item loaded from Flyff directory
    if (loadedClientItems && loadedClientItems[slot]) {
        const found = loadedClientItems[slot].find(i => i.id == itemValue);
        if (found) {
            realEquippedItems[slot] = found;
        } else {
            realEquippedItems[slot] = null;
        }
    } else {
        realEquippedItems[slot] = null;
    }

    rebuildCharacter();
}

function toggleSlotVisibility(slot) {
    slotVisibility[slot] = !slotVisibility[slot];
    
    const btn = document.getElementById(`btn-toggle-${slot}`);
    if (btn) {
        if (slotVisibility[slot]) {
            btn.classList.remove('muted');
            btn.innerHTML = '<i class="fa-solid fa-eye"></i>';
        } else {
            btn.classList.add('muted');
            btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
        }
    }
    rebuildCharacter();
}

function switchFashionTab(tabName) {
    document.querySelectorAll('.fashion-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-btn-${tabName}`).classList.add('active');

    document.querySelectorAll('.fashion-tab-content').forEach(section => section.classList.remove('active'));
    document.getElementById(`fashion-tab-content-${tabName}`).classList.add('active');
}

const presets = {
    angel: {
        gender: 'female',
        hair: 'long',
        hairColor: '#ffffff',
        skinColor: '#ffd5b4',
        head: 'halo',
        suit: 'school',
        gloves: 'default',
        shoes: 'winged_boots',
        cloak: 'angel_wings',
        weapon: 'magic_wand'
    },
    cyberpunk: {
        gender: 'male',
        hair: 'short',
        hairColor: '#ff00ff',
        skinColor: '#a5d3f5',
        head: 'ninja_mask',
        suit: 'cyberpunk',
        gloves: 'cyber_gloves',
        shoes: 'sneakers',
        cloak: 'jetpack',
        weapon: 'laser_saber'
    },
    dragon: {
        gender: 'male',
        hair: 'short',
        hairColor: '#ff4444',
        skinColor: '#ffd5b4',
        head: 'crown',
        suit: 'dragon',
        gloves: 'gold_bracers',
        shoes: 'metal_boots',
        cloak: 'demon_wings',
        weapon: 'golden_axe'
    },
    maid: {
        gender: 'female',
        hair: 'twintails',
        hairColor: '#222222',
        skinColor: '#ffd5b4',
        head: 'cat_ears',
        suit: 'maid',
        gloves: 'default',
        shoes: 'common',
        cloak: 'hero_cape',
        weapon: 'fists'
    },
    astronaut: {
        gender: 'female',
        hair: 'bald',
        hairColor: '#ffd700',
        skinColor: '#ffd5b4',
        head: 'none',
        suit: 'astronaut',
        gloves: 'default',
        shoes: 'metal_boots',
        cloak: 'jetpack',
        weapon: 'laser_saber'
    }
};

function loadFashionPreset(presetKey) {
    const config = presets[presetKey];
    if (!config) return;

    charGender = config.gender;
    charHairStyle = config.hair;
    charHairColor = config.hairColor;
    charSkinColor = config.skinColor;
    
    // Clear any real items mapping
    realEquippedItems = { head: null, suit: null, gloves: null, shoes: null, cloak: null, weapon: null };

    equippedSlots = {
        head: config.head,
        suit: config.suit,
        gloves: config.gloves,
        shoes: config.shoes,
        cloak: config.cloak,
        weapon: config.weapon
    };

    document.getElementById('fashion-hair-style').value = charHairStyle;
    document.getElementById('fashion-hair-color').value = charHairColor;
    
    updateSkinUISelection();

    const maleBtn = document.getElementById('btn-gender-male');
    const femaleBtn = document.getElementById('btn-gender-female');
    if (charGender === 'male') {
        maleBtn.classList.add('active');
        femaleBtn.classList.remove('active');
    } else {
        femaleBtn.classList.add('active');
        maleBtn.classList.remove('active');
    }

    syncEquipDropdowns();
    rebuildCharacter();
}

function loadSavedOutfits() {
    try {
        const stored = localStorage.getItem('flyff_outfits');
        savedOutfits = stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Error reading saved outfits:", e);
        savedOutfits = [];
    }
    renderSavedOutfits();
}

function renderSavedOutfits() {
    const list = document.getElementById('saved-outfits-list');
    if (!list) return;

    if (savedOutfits.length === 0) {
        list.innerHTML = `<p style="text-align:center; opacity:0.5; font-size:0.9rem; padding: 20px 0;" data-i18n="outfits_empty">${i18n('outfits_empty')}</p>`;
        return;
    }

    list.innerHTML = savedOutfits.map((outfit, index) => {
        return `
        <div class="saved-outfit-card">
            <div class="saved-outfit-info">
                <span class="saved-outfit-name">${outfit.name}</span>
                <span class="saved-outfit-meta">${outfit.gender === 'male' ? i18n('fashion_gender_male') : i18n('fashion_gender_female')}</span>
            </div>
            <div class="saved-outfit-actions">
                <button class="btn-primary" style="padding: 4px 8px; font-size:0.8rem;" onclick="equipSavedOutfit(${index})" title="Equipar">
                    <i class="fa-solid fa-shirt"></i>
                </button>
                <button class="icon-btn delete" style="padding: 4px 8px;" onclick="deleteSavedOutfit(${index})" title="Eliminar">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
}

function saveCustomOutfit() {
    const nameInput = document.getElementById('outfit-name-input');
    const name = nameInput?.value.trim();
    if (!name) return;

    const newOutfit = {
        name: name,
        gender: charGender,
        hair: charHairStyle,
        hairColor: charHairColor,
        skinColor: charSkinColor,
        equips: { ...equippedSlots },
        realEquips: { ...realEquippedItems }
    };

    savedOutfits.push(newOutfit);
    try {
        localStorage.setItem('flyff_outfits', JSON.stringify(savedOutfits));
        alert(i18n('msg_outfit_saved'));
    } catch(e) {
        console.error(e);
    }

    if (nameInput) nameInput.value = '';
    renderSavedOutfits();
}

function equipSavedOutfit(index) {
    const outfit = savedOutfits[index];
    if (!outfit) return;

    charGender = outfit.gender;
    charHairStyle = outfit.hair;
    charHairColor = outfit.hairColor;
    charSkinColor = outfit.skinColor;
    
    equippedSlots = { ...outfit.equips };
    realEquippedItems = outfit.realEquips ? { ...outfit.realEquips } : { head: null, suit: null, gloves: null, shoes: null, cloak: null, weapon: null };

    document.getElementById('fashion-hair-style').value = charHairStyle;
    document.getElementById('fashion-hair-color').value = charHairColor;
    
    updateSkinUISelection();

    const maleBtn = document.getElementById('btn-gender-male');
    const femaleBtn = document.getElementById('btn-gender-female');
    if (charGender === 'male') {
        maleBtn.classList.add('active');
        femaleBtn.classList.remove('active');
    } else {
        femaleBtn.classList.add('active');
        maleBtn.classList.remove('active');
    }

    syncEquipDropdowns();
    rebuildCharacter();
    
    switchFashionTab('items');
}

function deleteSavedOutfit(index) {
    if (confirm(i18n('msg_outfit_delete'))) {
        savedOutfits.splice(index, 1);
        try {
            localStorage.setItem('flyff_outfits', JSON.stringify(savedOutfits));
        } catch(e) {
            console.error(e);
        }
        renderSavedOutfits();
    }
}
