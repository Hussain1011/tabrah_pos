# -*- coding: utf-8 -*-
from __future__ import annotations
import re
from frappe.utils.jinja import render_template
from frappe.www.printview import get_rendered_raw_commands
from PIL import Image
import os
import frappe

ESC = b"\x1b"
GS  = b"\x1d"

# ---------------- ESC/POS primitives ----------------
def esc_init():			return ESC + b"@" + ESC + b"M" + b"\x00"  # same as your working code
def esc_align(n):		  return ESC + b"a" + bytes([n])			# 0 L,1 C,2 R
def esc_bold(on):		  return ESC + b"E" + (b"\x01" if on else b"\x00")
def esc_double(on):		return GS + b"!" + (b"\x11" if on else b"\x00")
def esc_cut():			 return GS + b"V" + b"\x01"				# partial cut

def wrap_text(s: str, width: int) -> bytes:
	out = bytearray()
	s = str(s)
	while len(s) > width:
		out += s[:width].encode("utf-8", "replace") + b"\n"
		s = s[width:]
	out += s.encode("utf-8", "replace") + b"\n"
	return bytes(out)

def kv_line(left: str, right: str, width: int) -> bytes:
	left, right = str(left), str(right)
	space = max(1, width - len(left) - len(right))
	return (left + (" " * space) + right + "\n").encode("utf-8", "replace")

# ---------------- TAG MAP ----------------
TAG_BYTES = {
	"<INIT>": esc_init(),
	"<L>": esc_align(0),
	"<C>": esc_align(1),
	"<R>": esc_align(2),
	"<B1>": esc_bold(True),
	"<B0>": esc_bold(False),
	"<DBL1>": esc_double(True),
	"<DBL0>": esc_double(False),
	"<BR>": b"\n",
	"<CUT>": esc_cut(),
}

# ---------------- MAIN RENDERER ----------------
def render_escpos_template(doctype, docname, template_text: str, line_chars: int = 48) -> bytes:
	rendered = get_rendered_raw_commands(doctype, docname, template_text).get("raw_commands")
	rendered = rendered.replace("\r\n", "\n").replace("\r", "\n")

	out = bytearray()
	token_re = re.compile(
		r"(<IMG:[^>]+>)"
		r"|(<KV>.*?\|\|\|.*?</KV>)"
		r"|(<FEED\d+>)"
		r"|(<HR>)"
		r"|(<INIT>|<L>|<C>|<R>|<B1>|<B0>|<DBL1>|<DBL0>|<BR>|<CUT>)",
		re.DOTALL
	)

	pos = 0
	for m in token_re.finditer(rendered):
		# --- text before token ---
		text_part = rendered[pos:m.start()]
		if text_part.strip():
			for line in text_part.split("\n"):
				if line.strip():
					out += wrap_text(line, line_chars)

		token = m.group(0)

		if token.startswith("<IMG:"):
			img_name = token[5:-1].strip()
			img_path = frappe.get_site_path("public", "files", img_name)

			out += escpos_image(img_path)
			out += b"\n"

		# --- KV ---
		if token.startswith("<KV>"):
			kv_match = re.match(r"<KV>(.*?)\|\|\|(.*?)</KV>", token, re.DOTALL)
			if kv_match:
				out += kv_line(kv_match.group(1).strip(),
							   kv_match.group(2).strip(),
							   line_chars)

		# --- FEED ---
		elif token.startswith("<FEED"):
			n = int(re.findall(r"\d+", token)[0])
			out += b"\n" * n

		# --- HR ---
		elif token == "<HR>":
			out += ("-" * line_chars).encode("ascii") + b"\n"

		# --- Simple tags ---
		elif token in TAG_BYTES:
			out += TAG_BYTES[token]

		pos = m.end()

	tail = rendered[pos:]
	if tail.strip():
		for line in tail.split("\n"):
			if line.strip():
				out += wrap_text(line, line_chars)

	return bytes(out)

def escpos_image(source, max_width: int = 576) -> bytes:
	"""
	Convert image (PNG/JPG/WebP/SVG-rasterized) to ESC/POS raster.
	Handles transparency correctly (transparent -> white).
	"""

	# Load image
	if isinstance(source, Image.Image):
		img = source
	else:
		if not os.path.exists(source):
			return b""
		img = Image.open(source)

	# ✅ HANDLE TRANSPARENCY (CRITICAL FIX)
	if img.mode in ("RGBA", "LA") or ("transparency" in img.info):
		bg = Image.new("RGBA", img.size, (255, 255, 255, 255))  # white background
		img = Image.alpha_composite(bg, img.convert("RGBA")).convert("RGB")
	else:
		img = img.convert("RGB")

	# Convert to grayscale
	img = img.convert("L")

	# Resize to printer width
	w, h = img.size
	if w > max_width:
		h = int(h * max_width / w)
		w = max_width
		img = img.resize((w, h), Image.LANCZOS)

	# Convert to monochrome (threshold)
	img = img.point(lambda x: 0 if x < 160 else 255, "1")
	# ↑ 160 works better for logos than 128

	# Pack pixels
	width_bytes = (w + 7) // 8
	pixels = img.load()
	data = bytearray()

	for y in range(h):
		for xb in range(width_bytes):
			byte = 0
			for bit in range(8):
				x = xb * 8 + bit
				if x < w and pixels[x, y] == 0:  # black pixel
					byte |= (1 << (7 - bit))
			data.append(byte)

	# GS v 0 raster command
	return (
		b"\x1d\x76\x30\x00" +
		width_bytes.to_bytes(2, "little") +
		h.to_bytes(2, "little") +
		bytes(data)
	)