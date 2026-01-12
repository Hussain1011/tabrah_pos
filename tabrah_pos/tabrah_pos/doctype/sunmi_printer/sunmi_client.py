# -*- coding: utf-8 -*-
from __future__ import annotations

import hashlib
import hmac
import json
import random
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional

import requests


@dataclass(frozen=True)
class SunmiConfig:
	app_id: str
	app_key: str
	base_url: str = "https://openapi.sunmi.com"
	source: str = "openapi"
	timeout: int = 20


class SunmiOpenApiClient:

	ONLINE_STATUS_PATH = "/v2/printer/open/open/device/onlineStatus"
	PUSH_CONTENT_PATH = "/v2/printer/open/open/device/pushContent"

	def __init__(self, config: SunmiConfig, session: Optional[requests.Session] = None) -> None:
		self.cfg = config
		self.session = session or requests.Session()
		random.seed()

	def _make_nonce(self) -> str:
		return f"{random.randint(0, 999999):06d}"

	def _make_timestamp(self) -> str:
		return str(int(time.time()))  # unix seconds (10 digits)

	def _sign(self, body_str: str, timestamp: str, nonce: str) -> str:
		msg = body_str + self.cfg.app_id + timestamp + nonce
		return hmac.new(
			key=self.cfg.app_key.encode("utf-8"),
			msg=msg.encode("utf-8"),
			digestmod=hashlib.sha256,
		).hexdigest().lower()

	def _headers(self, body_str: str, timestamp: str, nonce: str) -> Dict[str, str]:
		return {
			"Content-Type": "application/json",
			"Sunmi-Appid": self.cfg.app_id,
			"Sunmi-Timestamp": timestamp,
			"Sunmi-Nonce": nonce,
			"Sunmi-Sign": self._sign(body_str, timestamp, nonce),
			"Source": self.cfg.source,
		}

	def post(self, path: str, body: Dict[str, Any]) -> Dict[str, Any]:
		url = f"{self.cfg.base_url}{path}"

		body_str = json.dumps(body, separators=(",", ":"), ensure_ascii=False)
		ts = self._make_timestamp()
		nonce = self._make_nonce()
		headers = self._headers(body_str, ts, nonce)

		resp = self.session.post(
			url=url,
			data=body_str.encode("utf-8"),
			headers=headers,
			timeout=self.cfg.timeout,
		)
		resp.raise_for_status()
		return resp.json()

	# ---------- business method ----------
	def get_online_status(self, sn: str) -> Dict[str, Any]:
		payload = self.post(self.ONLINE_STATUS_PATH, {"msn_list": [sn]})

		if payload.get("code") != 1:
			raise RuntimeError(f"SUNMI API error: {payload.get('msg') or payload}")

		items = (payload.get("data") or {}).get("list") or []
		match = None
		for item in items:
			if isinstance(item, dict) and item.get("sn") == sn:
				match = item
				break
		if match is None and items and isinstance(items[0], dict):
			match = items[0]

		is_online = None
		if isinstance(match, dict) and match.get("is_online") is not None:
			try:
				is_online = int(match.get("is_online"))
			except Exception:
				is_online = None

		return {"sn": sn, "is_online": is_online, "raw": payload}


	def push_print_content(self, sn , body_str: str) -> Dict[str, Any]:
		"""
		Send print command to SUNMI.
		body_str MUST be the exact JSON string to send & sign.
		Example body_str:
		  '{"trade_no":"xxx","sn":"xxx","content":"ABCD...","count":1}'
		"""
		ts = self._make_timestamp()
		trade = f"{sn}_{ts}"

		body = {
			"trade_no": trade,
			"sn": sn,
			"order_type": 1,
			"content": body_str.hex(),
			"count": 1,
			"media_text": "Invoice",
			"cycle": 1
		}


		payload = self.post(self.PUSH_CONTENT_PATH, body)

		if payload.get("code") not in (1, 0):
			raise RuntimeError(f"SUNMI print error: {payload.get('msg') or payload}")

		return payload

	@staticmethod
	def normalize_status(is_online: Optional[int]) -> str:
		if is_online == 1:
			return "Online"
		if is_online == 0:
			return "Offline"
		return "Unknown"