"""Small, isolated contract checks for the screenshot delivery package."""

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

from PIL import Image, ImageDraw


MODULE_PATH = Path(__file__).resolve().parents[1] / "scripts" / "package-snapshots.py"
SPEC = importlib.util.spec_from_file_location("package_snapshots", MODULE_PATH)
package_snapshots = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(package_snapshots)


class ScreenshotValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        (self.root / "页面截图").mkdir()

    def create_image(self, name="01.png", size=(780, 1688), blank=False):
        path = self.root / "页面截图" / name
        image = Image.new("RGB", size, "#19152d")
        if not blank:
            draw = ImageDraw.Draw(image)
            draw.rectangle((20, 100, size[0] - 20, size[1] // 2), fill="#9576ed")
            draw.rectangle((40, size[1] // 2 + 40, size[0] - 40, size[1] - 60), fill="#fff1c2")
        image.save(path)
        return path

    def entry(self, path, identifier="01", size=(780, 1688)):
        return {"id": identifier, "title": "模拟页面", "file": path.relative_to(self.root).as_posix(), "url": "http://127.0.0.1:4196/#expert", "width": size[0], "height": size[1]}

    def write_manifest(self, entries):
        (self.root / "目录.json").write_text(json.dumps(entries, ensure_ascii=False), encoding="utf-8")

    def test_valid_png_accepted(self):
        path = self.create_image()
        self.write_manifest([self.entry(path)])
        loaded = package_snapshots.load_screenshots(self.root)
        self.assertEqual(len(loaded), 1)
        self.assertEqual(loaded[0]["path"], path)
        self.assertEqual(len(loaded[0]["sha256"]), 64)

    def test_blank_png_rejected(self):
        path = self.create_image(blank=True)
        self.write_manifest([self.entry(path)])
        with self.assertRaisesRegex(ValueError, "疑似空白"):
            package_snapshots.load_screenshots(self.root)

    def test_wrong_dimensions_rejected(self):
        path = self.create_image(size=(390, 844))
        self.write_manifest([self.entry(path, size=(390, 844))])
        with self.assertRaisesRegex(ValueError, "截图尺寸错误"):
            package_snapshots.load_screenshots(self.root)

    def test_duplicate_content_rejected(self):
        first = self.create_image("01.png")
        second = self.create_image("02.png")
        self.write_manifest([self.entry(first), self.entry(second, "02")])
        with self.assertRaisesRegex(ValueError, "重复截图"):
            package_snapshots.load_screenshots(self.root)

    def test_directory_traversal_rejected(self):
        entry = {"id": "01", "title": "越界", "file": "../outside.png", "url": "http://127.0.0.1:4196/", "width": 780, "height": 1688}
        self.write_manifest([entry])
        with self.assertRaisesRegex(ValueError, "截图路径越界"):
            package_snapshots.load_screenshots(self.root)


if __name__ == "__main__":
    unittest.main()
