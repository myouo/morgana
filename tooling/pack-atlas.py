"""Repack finite source clip rectangles without scaling or executing ASD code."""
import json
import math
from pathlib import Path
import sys
from PIL import Image
spec=json.loads(Path(sys.argv[1]).read_text())
source=Image.open(spec['source']).convert('RGBA')
frames=spec['frames'];assert 1<=len(frames)<=128
w=spec['width'];h=spec['height'];columns=math.ceil(math.sqrt(len(frames)))
width=columns*w;height=math.ceil(len(frames)/columns)*h
assert width<=4096 and height<=4096 and width*height*4<=33554432
atlas=Image.new('RGBA',(width,height))
for n,frame in enumerate(frames):
    r=frame['frame'];assert r['width']==w and r['height']==h
    atlas.alpha_composite(source.crop((r['x'],r['y'],r['x']+w,r['y']+h)),(n%columns*w,n//columns*h))
atlas.save(sys.argv[2])
