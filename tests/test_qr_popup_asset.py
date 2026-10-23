import unittest
from pathlib import Path

from PIL import Image, ImageStat


ASSET = Path(__file__).resolve().parents[1] / 'public/assets/gacha/xiaotu-qr-marketing-popup-v2.png'


class QrPopupAssetTests(unittest.TestCase):
    def test_png_is_full_resolution_and_not_blank(self):
        with Image.open(ASSET) as image:
            image.verify()
        with Image.open(ASSET) as image:
            self.assertEqual(image.format, 'PNG')
            self.assertEqual(image.size, (1086, 1448))
            self.assertGreater(max(ImageStat.Stat(image.convert('RGB')).stddev), 20)

    def test_transparent_outside_and_solid_qr_placeholder(self):
        with Image.open(ASSET) as image:
            self.assertEqual(image.mode, 'RGBA')
            alpha = image.getchannel('A')
            self.assertGreater(alpha.histogram()[0] / (image.width * image.height), .1)
            # The replaceable square must not have a transparency hole.
            self.assertGreaterEqual(alpha.crop((314, 666, 814, 1172)).getextrema()[0], 250)

    def test_colored_surfaces_are_cool_not_warm(self):
        with Image.open(ASSET) as image:
            image.thumbnail((200, 267))
            colored = [p for p in image.get_flattened_data()
                       if p[3] > 230 and max(p[:3]) - min(p[:3]) > 30]
            self.assertGreater(len(colored), 1000)
            cool = sum(b > r + 15 and b > g + 10 for r, g, b, _ in colored)
            warm = sum(r > b + 15 for r, g, b, _ in colored)
            self.assertGreater(cool / len(colored), .95)
            self.assertLess(warm / len(colored), .01)


if __name__ == '__main__':
    unittest.main()
