#!/usr/bin/env python3
"""Validate and package the mobile screenshots captured for the Double 11 demo."""

from __future__ import annotations

import argparse
import hashlib
import html
import json
from datetime import datetime
from pathlib import Path
import zipfile

from PIL import Image, ImageDraw, ImageFont, ImageStat


EXPECTED_SIZE = (780, 1688)
FONT_CANDIDATES = (
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/System/Library/Fonts/STHeiti Light.ttc",
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
)


def font(size: int):
    for candidate in FONT_CANDIDATES:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def fit_text(draw, value: str, max_width: int, text_font) -> str:
    if draw.textlength(value, font=text_font) <= max_width:
        return value
    while value and draw.textlength(value + "…", font=text_font) > max_width:
        value = value[:-1]
    return value + "…"


def load_screenshots(root: Path):
    root = root.resolve()
    manifest = root / "目录.json"
    raw = json.loads(manifest.read_text(encoding="utf-8"))
    if isinstance(raw, dict):
        entries = raw.get("screenshots", raw.get("items", raw.get("pages")))
    else:
        entries = raw
    if not isinstance(entries, list) or not entries:
        raise ValueError("目录.json 必须包含非空截图数组")
    seen_ids, seen_hashes, result = set(), {}, []
    for entry in entries:
        required = {"id", "title", "file", "url", "width", "height"}
        missing = required.difference(entry)
        if missing:
            raise ValueError(f"截图目录缺少字段: {sorted(missing)}")
        if entry["id"] in seen_ids:
            raise ValueError(f"重复截图编号: {entry['id']}")
        seen_ids.add(entry["id"])
        relative = Path(entry["file"])
        path = (root / relative).resolve()
        if not path.is_relative_to(root.resolve()):
            raise ValueError(f"截图路径越界: {relative}")
        if not path.exists() and len(relative.parts) == 1:
            path = root / "页面截图" / relative
        if path.suffix.lower() != ".png" or not path.is_file():
            raise ValueError(f"缺少 PNG 截图: {relative}")
        if path.parent.resolve() != (root / "页面截图").resolve():
            raise ValueError(f"截图必须位于页面截图目录: {relative}")
        with Image.open(path) as image:
            image.load()
            if image.format != "PNG" or image.size != EXPECTED_SIZE:
                raise ValueError(f"截图尺寸错误: {path.name} {image.size}，应为 {EXPECTED_SIZE}")
            if (entry["width"], entry["height"]) != image.size:
                raise ValueError(f"目录尺寸与实图不一致: {path.name}")
            rgb = image.convert("RGB")
            # A flat or almost flat frame generally indicates a failed capture.
            if max(ImageStat.Stat(rgb).stddev) < 3.0:
                raise ValueError(f"截图疑似空白: {path.name}")
            digest = hashlib.sha256(rgb.tobytes()).hexdigest()
        if digest in seen_hashes:
            raise ValueError(f"重复截图: {path.name} 与 {seen_hashes[digest]}")
        seen_hashes[digest] = path.name
        result.append({**entry, "path": path, "relative": path.relative_to(root).as_posix(), "sha256": digest})
    return result


def make_overviews(root: Path, entries):
    thumb_w, thumb_h = 195, 422
    gap, margin, header_h, label_h = 22, 28, 88, 56
    cols, rows_per_page = 4, 4
    canvas_w = margin * 2 + cols * thumb_w + (cols - 1) * gap
    title_font, small_font, label_font = font(27), font(14), font(14)
    outputs = []
    for offset in range(0, len(entries), cols * rows_per_page):
        subset = entries[offset:offset + cols * rows_per_page]
        rows = (len(subset) + cols - 1) // cols
        canvas_h = header_h + rows * (thumb_h + label_h) + (rows - 1) * gap + margin
        canvas = Image.new("RGB", (canvas_w, canvas_h), "#f3f3fa")
        draw = ImageDraw.Draw(canvas)
        number = offset // (cols * rows_per_page) + 1
        draw.text((margin, 19), "双11功能 · 页面截图总览", fill="#272044", font=title_font)
        draw.text((margin, 55), f"2026-10-22  |  第 {number} 页  |  手机视口 390 × 844 · 二倍截图", fill="#706983", font=small_font)
        for index, entry in enumerate(subset):
            x = margin + (index % cols) * (thumb_w + gap)
            y = header_h + (index // cols) * (thumb_h + label_h + gap)
            with Image.open(entry["path"]) as image:
                thumb = image.convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            draw.rounded_rectangle((x - 1, y - 1, x + thumb_w, y + thumb_h), radius=7, fill="#d6d2e5")
            canvas.paste(thumb, (x, y))
            label = f"{entry['id']}  {entry['title']}"
            label = fit_text(draw, label, thumb_w, label_font)
            draw.text((x, y + thumb_h + 12), label, fill="#332b50", font=label_font)
        path = root / f"总览{number:02}.png"
        canvas.save(path, optimize=True)
        outputs.append(path)
    return outputs


def write_index(root: Path, entries, overviews):
    cards = []
    for entry in entries:
        title, relative = html.escape(str(entry["title"])), html.escape(entry["relative"], quote=True)
        cards.append(f'<article><a class="image" href="{relative}" target="_blank"><img loading="lazy" src="{relative}" alt="{title}"></a><div class="caption"><b>{html.escape(str(entry["id"]))} · {title}</b><a href="{relative}" download>下载原图 ↗</a></div></article>')
    overview_links = " · ".join(f'<a href="{html.escape(path.name)}">{html.escape(path.stem)}</a>' for path in overviews)
    document = '''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>双11功能截图快照</title><style>
    *{box-sizing:border-box}body{margin:0;background:#f4f3fa;color:#28213e;font:15px/1.65,-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}header{padding:36px 28px 26px;max-width:1280px;margin:auto}h1{margin:0 0 8px;font-size:28px}p{margin:7px 0;color:#746c87}a{color:#6750bf;text-decoration:none}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:25px;max-width:1280px;padding:0 28px 40px;margin:auto}article{overflow:hidden;background:white;border:1px solid #e1ddef;border-radius:16px;box-shadow:0 8px 25px #2d1c5b08}.image{display:block;background:#17152f}.image img{width:100%;height:auto;display:block}.caption{padding:13px 14px 16px}.caption b{display:block;font-size:14px}.caption a{font-size:12px}aside{padding:12px 16px;background:#eae5f8;border-radius:10px;font-size:13px;color:#5a4d77;max-width:1000px}nav{margin-top:15px}@media(max-width:520px){main{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:0 12px 25px}header{padding:24px 16px}.caption{padding:10px}.caption b{font-size:12px}}
    </style><header><h1>双11功能截图快照</h1><p>2026-10-22 · COUNT 张 · 780 × 1688 PNG · 点击截图查看原图</p><aside>当前本地 Demo 的模拟数据与静态界面快照。当前 Demo 为 7 类活动品类、普通池实物 8%、高级池实物 5%；最新版文档为预留 8 类、普通池实物 5%、高级池实物 8%，尚未同步到本次截图中的 Demo。</aside><nav>OVERVIEWS · <a href="中文截图说明.md">截图说明</a> · <a href="目录.json">截图目录</a></nav></header><main>CARDS</main></html>'''
    document = document.replace("COUNT", str(len(entries))).replace("OVERVIEWS", overview_links).replace("CARDS", "\n".join(cards))
    (root / "index.html").write_text(document, encoding="utf-8")


def write_notes(root: Path, entries, overviews):
    lines = [
        "# 双11功能截图快照", "", "捕获日期：2026 年 10 月 22 日。", "",
        f"本包包含 {len(entries)} 张页面截图、{len(overviews)} 张总览图、截图目录及离线浏览索引。", "",
        "## 查看方式", "", "- 打开 `index.html` 浏览全部缩略图，点击可查看或下载原图。",
        "- 先看 `总览01.png` 等总览图快速了解页面范围。", "- `页面截图/` 内为 780 × 1688 像素 PNG 原图，对应 390 × 844 手机视口二倍截图。", "",
        "## 快照范围", "", "截图来源于本地当前 Demo，订单、抽奖券、奖品、榜单等均使用模拟状态；截图是静态帧，不能完整呈现烟花、彩带、投券、扭蛋及安慰交互等连续动画。", "",
        "当前 Demo 为 7 类活动品类、普通池实物中奖概率 8%、高级池实物中奖概率 5%；最新需求文档为按上线配置预留 8 类、普通池实物 5%、高级池实物 8%。这些配置差异尚未同步到本次截图中的 Demo，本包不代表这些最新规则已实现。", "",
        "## 页面目录", "", "| 编号 | 页面 / 状态 | 文件 |", "| --- | --- | --- |",
    ]
    for entry in entries:
        title = str(entry["title"]).replace("|", "\\|")
        lines.append(f"| {entry['id']} | {title} | [{entry['path'].name}]({entry['relative']}) |")
    lines += ["", "## 文件校验", "", "打包前已验证每张 PNG 可读取、实际尺寸与目录一致、非空白、图像内容哈希无重复；ZIP 已进行完整性测试，并核对压缩包成员与交付文件清单。", ""]
    (root / "中文截图说明.md").write_text("\n".join(lines), encoding="utf-8")


def package(root: Path):
    entries = load_screenshots(root)
    overviews = make_overviews(root, entries)
    write_index(root, entries, overviews)
    write_notes(root, entries, overviews)
    files = [entry["path"] for entry in entries] + overviews + [root / "目录.json", root / "中文截图说明.md", root / "index.html"]
    zip_path = root.with_suffix(".zip")
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for path in files:
            archive.write(path, arcname=f"{root.name}/{path.relative_to(root).as_posix()}")
    with zipfile.ZipFile(zip_path, "r") as archive:
        error = archive.testzip()
        expected = {f"{root.name}/{path.relative_to(root).as_posix()}" for path in files}
        actual = set(archive.namelist())
        if error or expected != actual or len(archive.infolist()) != len(files):
            raise ValueError(f"ZIP 校验失败: {error or '成员不一致'}")
    print(json.dumps({"screenshots": len(entries), "overviews": len(overviews), "zip_members": len(files), "zip": str(zip_path), "bytes": zip_path.stat().st_size, "validation": "passed"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output_dir", type=Path, help="包含目录.json和页面截图/的输出目录")
    args = parser.parse_args()
    package(args.output_dir.resolve())
