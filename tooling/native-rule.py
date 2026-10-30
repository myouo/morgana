"""Read rule bitmaps as the native loader's 8-bit grayscale data; no scripts run."""
from pathlib import Path
import sys
from PIL import Image, ImageChops

def canonical_rule(source: Path, destination: Path) -> bool:
    with Image.open(source) as image:
        rgb = image.convert('RGB')
        r, g, b = rgb.split()
        opaque = image.convert('RGBA').getchannel('A').getextrema() == (255, 255)
        if opaque and ImageChops.difference(r, g).getbbox() is None and ImageChops.difference(r, b).getbbox() is None:
            return False
        if image.format == 'JPEG':
            # Native GraphicsLoaderIntf.cpp requests libjpeg JCS_GRAYSCALE.
            # draft before load selects that decoder output, discarding chroma.
            with Image.open(source) as jpeg:
                jpeg.draft('L', jpeg.size)
                jpeg.load()
                if jpeg.mode != 'L':
                    raise ValueError('Native grayscale JPEG output unavailable')
                gray = Image.frombytes('L', jpeg.size, jpeg.tobytes())
        elif image.format == 'PNG' and image.mode == 'P':
            data = rgb.tobytes()
            gray = Image.frombytes('L', image.size, bytes((54*data[i] + 183*data[i+1] + 19*data[i+2]) >> 8 for i in range(0, len(data), 3)))
        elif image.format == 'PNG' and image.mode in ('RGB', 'RGBA'):
            # Native png_set_rgb_to_gray_fixed(..., 1, 0, 0).
            gray = b.copy()
        elif image.format == 'PNG' and image.mode == 'LA':
            gray = image.getchannel('L').copy()
        else:
            raise ValueError(f'Unverified native rule encoding: {image.format}/{image.mode}')
        destination.parent.mkdir(parents=True, exist_ok=True)
        Image.frombytes('L', gray.size, gray.tobytes()).save(destination, format='PNG')
        return True

if __name__ == '__main__':
    print('mask' if canonical_rule(Path(sys.argv[1]), Path(sys.argv[2])) else 'same')
