"""Repeat the previously approved FSRCNN print preparation workflow; preserve originals."""
from pathlib import Path
from PIL import Image
import cv2,json,hashlib
root=Path(__file__).resolve().parents[1]
model=root.parent/'FSRCNN_x4.pb'
sr=cv2.dnn_superres.DnnSuperResImpl_create();sr.readModel(str(model));sr.setModel('fsrcnn',4)
designs=json.loads((root/'data/designs/new-collections.json').read_text())
proof=[]
for d in designs:
 source=root/'public'/d['artwork'].lstrip('/')
 output=root/'public'/d['printArtwork'].lstrip('/')
 original=Image.open(source).convert('RGBA')
 if original.getchannel('A').getextrema()!=(0,255):raise ValueError('Missing transparency')
 if not output.exists() or Image.open(output).convert('RGBA').getchannel('A').getextrema()!=(0,255):
  import numpy as np
  rgba=np.array(original);rgb=sr.upsample(cv2.cvtColor(rgba[:,:,:3],cv2.COLOR_RGB2BGR))
  rgb=Image.fromarray(cv2.cvtColor(rgb,cv2.COLOR_BGR2RGB)).convert('RGBA')
  rgb.putalpha(original.getchannel('A').resize(rgb.size,Image.Resampling.BICUBIC))
  rgb.thumbnail((2875,3750),Image.Resampling.LANCZOS)
  canvas=Image.new('RGBA',(3000,4000),(0,0,0,0));canvas.alpha_composite(rgb,((3000-rgb.width)//2,125))
  prepared=canvas.convert('RGB').quantize(colors=256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGBA')
  prepared.putalpha(canvas.getchannel('A'))
  prepared.save(output,optimize=True,dpi=(250,250))
 im=Image.open(output).convert('RGBA');bbox=im.getchannel('A').getbbox()
 if im.size!=(3000,4000) or im.getchannel('A').getextrema()!=(0,255):raise ValueError('Invalid print output')
 proof.append({'slug':d['slug'],'nativePixels':original.size,'preparedPixels':im.size,'dpi':250,'transparent':True,'inkBounds':bbox,'inkWidthInches':round((bbox[2]-bbox[0])/250,3),'sourceEffectiveDpi':round(original.width/((bbox[2]-bbox[0])/250),1),'upscaled':True,'physicalSampleVerified':False,'md5':hashlib.md5(output.read_bytes()).hexdigest(),'bytes':output.stat().st_size})
 print(d['slug'],output.stat().st_size,flush=True)
(root/'data/designs/print-asset-proof.json').write_text(json.dumps(proof,indent=2)+'\n')
