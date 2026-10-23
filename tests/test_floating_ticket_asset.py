import unittest
from pathlib import Path
from PIL import Image, ImageStat


ASSET = Path(__file__).resolve().parents[1] / 'public/assets/gacha/floating-ticket-entry-v1.png'


class FloatingTicketAssetTests(unittest.TestCase):
    def test_full_resolution_png_is_readable(self):
        with Image.open(ASSET) as image:
            image.verify()
        with Image.open(ASSET) as image:
            self.assertEqual(image.format, 'PNG')
            self.assertEqual(image.size, (1223, 1286))
            self.assertGreater(max(ImageStat.Stat(image.convert('RGB')).stddev), 20)

    def test_asset_has_real_transparency_and_visible_content(self):
        with Image.open(ASSET) as image:
            self.assertEqual(image.mode, 'RGBA')
            alpha = image.getchannel('A')
            self.assertEqual(alpha.getextrema(), (0, 255))
            histogram = alpha.histogram()
            total = image.width * image.height
            self.assertGreater(histogram[0] / total, 0.05)
            # The glass material legitimately retains partial alpha.
            self.assertGreater(sum(histogram[230:]) / total, 0.2)


if __name__ == '__main__':
    unittest.main()
