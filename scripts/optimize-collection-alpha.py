"""Clean nearly-opaque AI alpha for solid DTG ink; keep every original untouched."""
from pathlib import Path
from PIL import Image
import json,hashlib
root=Path(__file__).resolve().parents[1]
ds=json.loads((root/'data/designs/new-collections.json').read_text())
proof=[]
for d in ds:
 out=root/'public'/d['printArtwork'].lstrip('/')
 im=Image.open(out).convert('RGBA');alpha=im.getchannel('A').point(lambda v:255 if v>=128 else 0)
 rgb=im.convert('RGB').quantize(colors=255,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
 # Palette entry255 is reserved for completely transparent exterior/negative space.
 rgb.putpalette(rgb.getpalette()[:765]+[0,0,0]);rgb.paste(255,mask=alpha.point(lambda v:255-v))
 rgb.save(out,optimize=True,dpi=(250,250),transparency=255)
 native=Image.open(root/'public'/d['artwork'].lstrip('/'));verified=Image.open(out).convert('RGBA');bbox=verified.getchannel('A').getbbox()
 if verified.size!=(3000,4000) or verified.getchannel('A').getextrema()!=(0,255):raise ValueError('Invalid transparent asset')
 proof.append({'slug':d['slug'],'nativePixels':native.size,'preparedPixels':verified.size,'dpi':250,'transparent':True,'inkBounds':bbox,'inkWidthInches':round((bbox[2]-bbox[0])/250,3),'sourceEffectiveDpi':round(native.width/((bbox[2]-bbox[0])/250),1),'upscaled':True,'alphaCleanup':'solid ink with transparent negative space','physicalSampleVerified':False,'md5':hashlib.md5(out.read_bytes()).hexdigest(),'bytes':out.stat().st_size})
 print(d['slug'],out.stat().st_size,flush=True)
(root/'data/designs/print-asset-proof.json').write_text(json.dumps(proof,indent=2)+'\n')
