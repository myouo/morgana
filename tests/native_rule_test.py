import importlib.util
from pathlib import Path
import tempfile
import unittest
from PIL import Image

spec = importlib.util.spec_from_file_location('native_rule', Path(__file__).parents[1] / 'tooling/native-rule.py')
native = importlib.util.module_from_spec(spec)
spec.loader.exec_module(native)

class NativeRuleTest(unittest.TestCase):
    def test_jpeg_uses_gray_decoder_output_and_preserves_source(self):
        with tempfile.TemporaryDirectory() as root:
            src, dst = Path(root)/'rule.jpg', Path(root)/'mask.png'
            image = Image.new('RGB', (3, 1))
            image.putdata([(255, 0, 0), (0, 255, 0), (0, 0, 255)])
            image.save(src, quality=95, subsampling=0)
            before = src.read_bytes()
            self.assertTrue(native.canonical_rule(src, dst))
            with Image.open(src) as expected:
                expected.draft('L', expected.size)
                with Image.open(dst) as actual:
                    self.assertEqual(actual.mode, 'L')
                    self.assertEqual(actual.size, (3, 1))
                    self.assertEqual(actual.tobytes(), expected.tobytes())
            self.assertEqual(src.read_bytes(), before)

    def test_already_opaque_gray_is_unchanged(self):
        with tempfile.TemporaryDirectory() as root:
            src, dst = Path(root)/'rule.png', Path(root)/'mask.png'
            Image.new('RGB', (2, 2), (80, 80, 80)).save(src)
            self.assertFalse(native.canonical_rule(src, dst))
            self.assertFalse(dst.exists())

    def test_rgb_png_blue_weight_and_alpha_strip(self):
        with tempfile.TemporaryDirectory() as root:
            src, dst = Path(root)/'rule.png', Path(root)/'mask.png'
            Image.new('RGBA', (2, 2), (10, 20, 90, 0)).save(src)
            self.assertTrue(native.canonical_rule(src, dst))
            with Image.open(dst) as actual:
                self.assertEqual(actual.mode, 'L')
                self.assertEqual(actual.getextrema(), (90, 90))

    def test_palette_png_uses_native_integer_weights(self):
        with tempfile.TemporaryDirectory() as root:
            src, dst = Path(root)/'rule.png', Path(root)/'mask.png'
            image = Image.new('P', (1, 1), 0)
            image.putpalette([255, 0, 0] + [0] * 765)
            image.save(src, transparency=0)
            self.assertTrue(native.canonical_rule(src, dst))
            with Image.open(dst) as actual:
                self.assertEqual(actual.getpixel((0, 0)), 53)
