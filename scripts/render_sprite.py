"""
Blender headless renderer for top-down character sprites.

Usage:
    blender --background --python scripts/render_sprite.py -- \
        <model_fbx> <skin_png> <output_png> [<facing>]

facing: "up" (default) renders the character facing -y (away from camera) — for
        player squad that always faces forward up the lane.
        "down" rotates 180° so the character faces +y (toward camera) — for
        enemies that march down the lane toward the player.
"""
import bpy
import sys
import os
import math

argv = sys.argv
if "--" in argv:
    argv = argv[argv.index("--") + 1:]
else:
    argv = []

if len(argv) < 3:
    print("ERR: need <model_fbx> <skin_png> <output_prefix> [facing] [anim_fbx] [frames_csv]")
    sys.exit(2)

model_fbx = argv[0]
skin_png = argv[1]
output_prefix = argv[2]  # e.g. "player" → produces player_0.png, player_1.png ...
facing = argv[3] if len(argv) > 3 else "up"
anim_fbx = argv[4] if len(argv) > 4 else ""
frames_csv = argv[5] if len(argv) > 5 else "0"
frame_list = [int(s) for s in frames_csv.split(",") if s.strip()]

# Wipe scene to a known empty state.
bpy.ops.wm.read_factory_settings(use_empty=True)

# Import character.
bpy.ops.import_scene.fbx(filepath=model_fbx)

# Locate mesh + armature.
mesh = None
armature = None
for obj in bpy.data.objects:
    if obj.type == "ARMATURE":
        armature = obj
    elif obj.type == "MESH":
        mesh = obj

if mesh is None:
    print("ERR: no mesh found in FBX")
    sys.exit(3)

# Optionally import an animation FBX and transfer its Action onto our armature.
if anim_fbx and armature:
    pre_objs = set(bpy.data.objects.keys())
    pre_acts = set(bpy.data.actions.keys())
    bpy.ops.import_scene.fbx(filepath=anim_fbx)
    new_objs = [bpy.data.objects[k] for k in bpy.data.objects.keys() if k not in pre_objs]
    new_acts = [bpy.data.actions[k] for k in bpy.data.actions.keys() if k not in pre_acts]

    # Prefer actions whose name suggests motion (Run / Walk / Idle), in that order.
    # Fall back to the first action with the largest frame range.
    preferred = ["run", "walk", "idle"]
    chosen_action = None
    for keyword in preferred:
        for action in new_acts:
            if keyword in action.name.lower():
                chosen_action = action
                break
        if chosen_action:
            break
    if chosen_action is None and new_acts:
        chosen_action = max(new_acts, key=lambda a: a.frame_range[1] - a.frame_range[0])

    if chosen_action:
        if armature.animation_data is None:
            armature.animation_data_create()
        armature.animation_data.action = chosen_action
        try:
            if len(chosen_action.slots) > 0:
                armature.animation_data.action_slot = chosen_action.slots[0]
        except AttributeError:
            pass
        f_lo = int(chosen_action.frame_range[0])
        f_hi = int(chosen_action.frame_range[1])
        bpy.context.scene.frame_start = f_lo
        bpy.context.scene.frame_end = f_hi
        print("DEBUG anim action=" + chosen_action.name + " range=" + str(f_lo) + ".." + str(f_hi))
    else:
        print("DEBUG no usable action found among imported anim FBX")
        f_lo, f_hi = 1, 1

    # Clean up the imported animation skeleton/mesh objects we don't need.
    for obj in new_objs:
        bpy.data.objects.remove(obj, do_unlink=True)

# Rotate to face up or down. Kenney's characters default to facing -z in their
# FBX (which is +y in our coordinate space after the FBX importer's axis swap).
# Adjust the rotation so the *front* of the character faces +y for "down"
# or -y for "up" relative to the camera.
root = armature if armature else mesh
if facing == "down":
    root.rotation_euler = (0, 0, math.radians(180))
else:
    root.rotation_euler = (0, 0, 0)

# Replace texture on the mesh's first material with the supplied skin PNG.
if mesh.data.materials:
    mat = mesh.data.materials[0]
else:
    mat = bpy.data.materials.new(name="CharMat")
    mesh.data.materials.append(mat)
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links
bsdf = nodes.get("Principled BSDF")
if bsdf is None:
    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
output = nodes.get("Material Output")
if output is None:
    output = nodes.new(type="ShaderNodeOutputMaterial")
links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
# Remove old image-tex nodes so we don't stack textures across iterations.
for n in list(nodes):
    if n.type == "TEX_IMAGE":
        nodes.remove(n)
tex_node = nodes.new(type="ShaderNodeTexImage")
tex_node.image = bpy.data.images.load(skin_png, check_existing=False)
links.new(tex_node.outputs["Color"], bsdf.inputs["Base Color"])

# Auto-frame the imported geometry: compute world-space bbox of all visible
# meshes, drop a 55°-tilted ortho camera centered on it. This avoids the
# "white frame because the model isn't in view" trap that Kenney's FBX import
# is prone to (unit scaling differs per pack).
min_v = [float("inf")] * 3
max_v = [float("-inf")] * 3
for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    for v in obj.bound_box:
        world = obj.matrix_world @ bpy.types.Vector(v) if hasattr(bpy.types, "Vector") else None
        # Fallback: use mathutils.Vector
        from mathutils import Vector
        world = obj.matrix_world @ Vector(v)
        for i in range(3):
            min_v[i] = min(min_v[i], world[i])
            max_v[i] = max(max_v[i], world[i])

cx = (min_v[0] + max_v[0]) / 2
cy = (min_v[1] + max_v[1]) / 2
cz = (min_v[2] + max_v[2]) / 2
height = max_v[2] - min_v[2]
width = max(max_v[0] - min_v[0], max_v[1] - min_v[1])

# Aim point — model centroid (a little above the floor for character bias).
aim_x, aim_y, aim_z = cx, cy, cz

# Camera setup: orthographic, tilted ~60° so we see top-and-front of the model.
TILT_DEG = 60.0
tilt = math.radians(TILT_DEG)
# Place camera far enough back/up that aim point is in the middle of the frame.
# In ortho mode, distance doesn't change scale, only direction.
dist = 8.0
cam_data = bpy.data.cameras.new("Cam")
cam_data.type = "ORTHO"
# Ortho extent must cover model height (vertical) plus model footprint (horizontal).
# Tilted camera projects height onto vertical view proportionally to sin(tilt) etc.
ortho_size = max(height * math.sin(tilt) + width * math.cos(tilt), width) * 1.25 + 0.3
cam_data.ortho_scale = ortho_size
cam_obj = bpy.data.objects.new("Cam", cam_data)
bpy.context.collection.objects.link(cam_obj)
cam_obj.location = (
    aim_x,
    aim_y - dist * math.cos(tilt),
    aim_z + dist * math.sin(tilt),
)
# Use a Track-To constraint to aim at the model centroid.
target = bpy.data.objects.new("AimTarget", None)
bpy.context.collection.objects.link(target)
target.location = (aim_x, aim_y, aim_z)
track = cam_obj.constraints.new("TRACK_TO")
track.target = target
track.track_axis = "TRACK_NEGATIVE_Z"
track.up_axis = "UP_Y"
bpy.context.scene.camera = cam_obj
print(f"DEBUG bbox center=({cx:.2f},{cy:.2f},{cz:.2f}) h={height:.2f} w={width:.2f} ortho={ortho_size:.2f} camLoc={cam_obj.location[:]}")

# Lighting — key + fill + rim.
def add_light(name, kind, energy, location, rotation):
    data = bpy.data.lights.new(name=name, type=kind)
    data.energy = energy
    if kind == "SUN":
        data.angle = math.radians(8)
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = rotation
    return obj

add_light("Key", "SUN", 4.0, (2, -3, 5), (math.radians(40), math.radians(15), math.radians(20)))
add_light("Fill", "SUN", 1.5, (-3, -1, 3), (math.radians(45), math.radians(-20), math.radians(-30)))
add_light("Rim", "SUN", 2.0, (0, 4, 3), (math.radians(120), 0, 0))

# Render settings — Workbench is the most reliable headless option (no
# shading complexity, just textures and lights).
scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
try:
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "TEXTURE"
    scene.display.shading.show_shadows = True
    scene.display.shading.shadow_intensity = 0.4
except Exception as e:
    print(f"DEBUG shading config: {e}")
scene.render.resolution_x = 192
scene.render.resolution_y = 192
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.color_depth = "8"

out_dir = os.path.dirname(os.path.abspath(output_prefix))
os.makedirs(out_dir, exist_ok=True)

# Resolve "fraction" frames: a value of 0 means "mid", otherwise interpret as
# either absolute (>= action.frame_start) or 1-based index into the range.
def resolve_frame(raw):
    if raw <= 0:
        return f_lo + (f_hi - f_lo) // 2
    # If the value is within the action's frame range, treat it as absolute.
    if f_lo <= raw <= f_hi:
        return raw
    # Otherwise treat it as a 1-based offset.
    return f_lo + min(raw - 1, f_hi - f_lo)

for idx, raw_frame in enumerate(frame_list):
    target_frame = resolve_frame(raw_frame)
    bpy.context.scene.frame_set(target_frame)
    suffix = "" if len(frame_list) == 1 else "_" + str(idx)
    out_path = os.path.abspath(output_prefix + suffix + ".png")
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print("OK rendered " + out_path + " frame=" + str(target_frame))
