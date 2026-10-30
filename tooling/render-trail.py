"""Prepare bounded sampled trail atlases from declarative numeric descriptions."""
import hashlib
import json
import math
from pathlib import Path
import sys
from PIL import Image, ImageEnhance

spec=json.loads(Path(sys.argv[1]).read_text())
source=Image.open(spec['source']).convert('RGBA')
assert source.size == (800,600)
if spec['grayscale']:
    alpha=source.getchannel('A')
    source=source.convert('L').convert('RGBA')
    source.putalpha(alpha)
if spec['brightness'] != 1:
    source=ImageEnhance.Brightness(source).enhance(spec['brightness'])
duration=spec['time']
assert 32 < duration <= 100000 and spec['opa'] == 0
assert 0 < spec['mag'] <= 2 and 0 < spec['dmag'] <= 2
assert abs(spec['ax']) <= 800 and abs(spec['ay']) <= 600 and 0 <= spec['dopa'] <= 255
end=math.ceil(duration/32)*32
ticks=end//32
if ticks<=16:
    captures=set(range(0,end+1,32))
else:
    captures=set([0,32,64,128,256,512]+[round((512+(end-512)*n/10)/32)*32 for n in range(1,11)])
captures.discard(end)
captures.add(end-32)
canvas=Image.new('RGBA',(800,600))
steps=[]
previous=None

def keep(at):
    global previous
    key=hashlib.sha256(canvas.tobytes()).hexdigest()
    if previous == key:
        return
    box=canvas.getbbox() or (0,0,1,1)
    steps.append({'at':at,'box':box,'image':canvas.crop(box)})
    previous=key

keep(0)
for time in range(32,end+1,32):
    p=min(1,time/duration)
    m=spec['dmag']+(spec['mag']-spec['dmag'])*p
    tx=400+spec['ax']*p
    ty=300+spec['ay']*p
    if spec.get('rot',0) or spec.get('drot',0):
        rad=spec['drot']+(spec['rot']-spec['drot'])*p
        c=math.cos(rad)
        s=math.sin(rad)
        image=source.transform((800,600),Image.Transform.AFFINE,(c/m,-s/m,tx-(tx*c-ty*s)/m,s/m,c/m,ty-(tx*s+ty*c)/m),Image.Resampling.NEAREST)
        origin=(0,0)
    else:
        # The source noRotation uses hold.height for both destination dimensions.
        size=max(1,round(600*m))
        image=source.resize((size,size),Image.Resampling.NEAREST)
        origin=(int((1-m)*tx),int((1-m)*ty))
    opacity=max(0,min(255,int(spec['dopa']+(spec['opa']-spec['dopa'])*p)))
    image.putalpha(image.getchannel('A').point(lambda a: a*opacity//255))
    canvas.alpha_composite(image,origin)
    if time in captures:
        keep(time)

# Leave room for encoded input and both CPU/device estimates in the unchanged
# 64MiB Host budget. Preserve early buildup and the final accumulated result.
all_steps=steps
cw=max(s['image'].width for s in steps)
ch=max(s['image'].height for s in steps)
for count in range(len(all_steps),0,-1):
    if count>2:
        indices=sorted({0,1,*[round(1+(len(all_steps)-2)*n/(count-2)) for n in range(1,count-1)]})
    else:
        indices=[0,len(all_steps)-1] if count==2 else [0]
    candidates=[(c*cw,math.ceil(len(indices)/c)*ch,c) for c in range(1,len(indices)+1) if c*cw<=4096 and math.ceil(len(indices)/c)*ch<=4096]
    if not candidates:
        continue
    aw,ah,columns=min(candidates,key=lambda v:(v[0]*v[1],max(v[0],v[1])))
    if aw*ah*4<=12582912:
        steps=[all_steps[n] for n in indices]
        break
else:
    raise ValueError('TRAIL_ATLAS_BUDGET')
for n,step in enumerate(steps):
    step['duration']=(steps[n+1]['at'] if n+1<len(steps) else end)-step['at']
atlas=Image.new('RGBA',(aw,ah))
frames=[]
assert atlas.width<=4096 and atlas.height<=4096 and atlas.width*atlas.height*4<=12582912
for n,step in enumerate(steps):
    x=n%columns*cw
    y=n//columns*ch
    atlas.alpha_composite(step['image'],(x,y))
    frames.append({'duration':step['duration'],'frame':{'x':x,'y':y,'width':step['image'].width,'height':step['image'].height},'pose':{'x':step['box'][0]*1.6,'y':step['box'][1]*1.2,'alpha':1,'scaleX':1.6,'scaleY':1.2}})
atlas.save(sys.argv[2])
Path(sys.argv[3]).write_text(json.dumps({'nativeIntervalMs':32,'capturePoints':[s['at'] for s in steps],'decodedBudget':12582912,'sampled':len(steps)<ticks,'frames':frames,'duration':sum(f['duration'] for f in frames)}))

# Resource-backed SDK schedules stream these individual native-size images.
# They retain every candidate capture and do not pin the complete atlas.
frame_dir=Path(sys.argv[2]+'.frames')
frame_dir.mkdir(parents=True,exist_ok=True)
resources=[]
for n,step in enumerate(all_steps):
    image_file=frame_dir/(hashlib.sha256(step['image'].tobytes()+str(step['image'].size).encode()).hexdigest()+'.png')
    if not image_file.exists():
        step['image'].save(image_file)
    resources.append({'file':str(image_file),'duration':(all_steps[n+1]['at'] if n+1<len(all_steps) else end)-step['at'],'frame':{'x':0,'y':0,'width':step['image'].width,'height':step['image'].height},'pose':{'x':step['box'][0]*1.6,'y':step['box'][1]*1.2,'alpha':1,'scaleX':1.6,'scaleY':1.2}})
metadata=json.loads(Path(sys.argv[3]).read_text())
metadata['resourceFrames']=resources
Path(sys.argv[3]).write_text(json.dumps(metadata))
