"""Sample the finite WearFilm profile into resource frames, never execute TJS."""
import hashlib
import json
from pathlib import Path
import sys
from PIL import Image, ImageDraw
spec=json.loads(Path(sys.argv[1]).read_text())
root=Path(sys.argv[2]);root.mkdir(parents=True,exist_ok=True)
assert 0<=spec['line']<=4 and 0<=spec['noise']<=15
state=173

def random():
    global state
    state=(state*1664525+1013904223)&0xffffffff
    return state/4294967296

def line(direction):
    return [int(random()*800),int(random()*5)*(-1 if direction else 1)]

lines=[line(n%2==0) for n in range(spec['line'])]
argb=int(spec['color'],16)
color=((argb>>16)&255,(argb>>8)&255,argb&255,(argb>>24)&255)
frames=[];sway=[];moving=True;offset=0
for n in range(128):
    canvas=Image.new('RGBA',(800,600),(239,239,239,3) if n%2==0 else (175,175,175,16))
    draw=ImageDraw.Draw(canvas)
    if not (random()>=spec['swayfreq'] and moving):
        offset+=1 if moving else -1
        moving=not moving
    sway.append(offset)
    for i,l in enumerate(lines):
        if random()<spec['probability']:
            draw.rectangle((l[0],0,l[0],599),fill=color)
            l[0]+=l[1]
            if l[0]<=0 or l[0]>=800 or random()>spec['frequency']:
                lines[i]=line(l[1]>=0)
    for i in range(spec['noise']):
        x=int(random()*800);y=int(random()*600)
        w=int(random()*2+1);h=int(random()*2+1)
        draw.rectangle((x,y,x+w-1,y+h-1),fill=(255,255,255,255))
    file=root/(hashlib.sha256(canvas.tobytes()).hexdigest()+'.png')
    if not file.exists():canvas.save(file)
    frames.append(str(file))
(root/'frames.json').write_text(json.dumps({'frames':frames,'sway':sway[:31]+[0]}))
