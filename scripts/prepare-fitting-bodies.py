"""Blender: preserve uploaded FBX meshes, bake a relaxed fitting pose, export GLB.

blender -b --python scripts/prepare-fitting-bodies.py -- male.fbx female.fbx
No decimation, remeshing, texture synthesis or external services are used.
"""
import bpy
import hashlib
import json
import math
import pathlib
import sys
from mathutils import Vector

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'public/models/bodies'
OUTPUT.mkdir(parents=True, exist_ok=True)


def smooth(a, b, value):
    t = max(0.0, min(1.0, (value - a) / (b - a)))
    return t * t * (3 - 2 * t)


def convert(source, identity):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=str(source))
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    main = max(meshes, key=lambda o: len(o.data.vertices))
    points = [main.matrix_world @ v.co for v in main.data.vertices]
    low, high = min(v.z for v in points), max(v.z for v in points)
    height = high - low
    center_x = (min(v.x for v in points) + max(v.x for v in points)) / 2
    # Normalize uniformly. glTF exporter converts Blender Z-up to browser Y-up.
    scale = 3.5 / height
    armature = next((o for o in bpy.context.scene.objects if o.type == 'ARMATURE'), None)
    pivots = {}
    if armature:
        for side in ['Left', 'Right']:
            bone = armature.data.bones.get('mixamorig:' + side + 'Arm')
            pivots[side] = armature.matrix_world @ bone.head_local
    counts = {}
    for obj in meshes:
        counts[obj.name] = len(obj.data.vertices)
        matrix = obj.matrix_world.copy()
        for vertex in obj.data.vertices:
            p = matrix @ vertex.co
            if identity == 'male':
                for side, sign in [('Left', 1), ('Right', -1)]:
                    weight = sum(g.weight for g in vertex.groups
                                 if obj.vertex_groups[g.group].name.startswith('mixamorig:' + side)
                                 and any(part in obj.vertex_groups[g.group].name
                                         for part in ['Arm', 'Hand']))
                    if weight:
                        pivot = pivots[side]
                        angle = math.radians(76) * sign
                        dx, dz = p.x - pivot.x, p.z - pivot.z
                        moved = Vector((pivot.x + math.cos(angle) * dx + math.sin(angle) * dz,
                                        p.y, pivot.z - math.sin(angle) * dx + math.cos(angle) * dz))
                        p = p.lerp(moved, min(weight, 1))
            else:
                # The sculpt has no rig. Blend a rigid arm rotation at the shoulder;
                # fingers and forearms retain their original detail and topology.
                x, z = (p.x - center_x) / height, (p.z - low) / height
                # Keep the pelvis and torso outside the arm influence region.
                boundary = .145 - .055 * smooth(.60, .80, z)
                weight = smooth(boundary, boundary + .055, abs(x)) * (1 - smooth(.81, .86, z))
                if weight:
                    sign = 1 if x > 0 else -1
                    pivot = Vector((center_x + sign * height * .12, 0, low + height * .80))
                    angle = math.radians(23) * sign
                    dx, dz = p.x - pivot.x, p.z - pivot.z
                    moved = Vector((pivot.x + math.cos(angle) * dx + math.sin(angle) * dz,
                                    p.y, pivot.z - math.sin(angle) * dx + math.cos(angle) * dz))
                    p = p.lerp(moved, weight)
            vertex.co = ((p.x - center_x) * scale, p.y * scale, (p.z - low) * scale - 1.75)
        obj.parent = None
        obj.matrix_world.identity()
        obj.modifiers.clear()
        obj.vertex_groups.clear()
        for face in obj.data.polygons:
            face.use_smooth = True
        if obj == main:
            material = bpy.data.materials.new('body-skin')
            material.diffuse_color = (.56, .36, .25, 1)
            material.use_nodes = True
            shader = material.node_tree.nodes.get('Principled BSDF')
            shader.inputs['Base Color'].default_value = material.diffuse_color
            shader.inputs['Roughness'].default_value = .64
            obj.data.materials.clear()
            obj.data.materials.append(material)
        obj['source_mesh'] = obj.name
        obj['source_vertices'] = len(obj.data.vertices)
    for obj in list(bpy.context.scene.objects):
        if obj.type != 'MESH':
            bpy.data.objects.remove(obj, do_unlink=True)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=str(OUTPUT / (identity + '.glb')), export_format='GLB',
                              use_selection=True, export_animations=False, export_extras=True)
    return {'id': identity, 'source': source.name,
            'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
            'sourceVertices': counts, 'pose': 'relaxed arms, baked from uploaded mesh',
            'geometry': 'original topology; no decimation; uniform height normalization'}


if __name__ == '__main__':
    args = sys.argv[sys.argv.index('--') + 1:]
    if len(args) != 2:
        raise SystemExit('Expected male.fbx and female.fbx')
    report = [convert(pathlib.Path(path), identity) for path, identity in zip(args, ['male', 'female'])]
    (OUTPUT / 'provenance.json').write_text(json.dumps(report, indent=2) + '\n')
