import unittest
from pathlib import Path

from PIL import Image, ImageStat


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets/gacha'
CURRENT_POSTER = 'home-carousel-double11-v2'


class CarouselPosterAssetTests(unittest.TestCase):
    def test_exports_match_requested_design_dimensions(self):
        for scale in (1, 2, 3):
            with self.subTest(scale=scale):
                path = ASSETS / f'{CURRENT_POSTER}@{scale}x.png'
                with Image.open(path) as image:
                    image.verify()
                with Image.open(path) as image:
                    self.assertEqual(image.size, (678 * scale, 214 * scale))
                    self.assertEqual(image.mode, 'RGBA')
                    self.assertEqual(image.format, 'PNG')
                    self.assertGreater(max(ImageStat.Stat(image.convert('RGB')).stddev), 30)

    def test_corners_are_transparent_with_26_unit_rounding(self):
        for scale in (1, 2, 3):
            with self.subTest(scale=scale):
                with Image.open(ASSETS / f'{CURRENT_POSTER}@{scale}x.png') as image:
                    alpha = image.getchannel('A')
                    w, h = image.size
                    for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
                        self.assertEqual(alpha.getpixel((x, y)), 0)
                    self.assertEqual(alpha.getpixel((3 * scale, 3 * scale)), 0)
                    for x, y in [(26 * scale, scale), (scale, 26 * scale),
                                 (w // 2, h // 2), (30 * scale, 30 * scale)]:
                        self.assertGreaterEqual(alpha.getpixel((x, y)), 250)


if __name__ == '__main__':
    unittest.main()
