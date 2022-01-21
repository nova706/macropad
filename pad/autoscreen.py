# SPDX-FileCopyrightText: 2020-2021, Ryan Pavlik <ryan.pavlik@gmail.com>
# SPDX-License-Identifier: MIT OR Unlicense

import time

try:
    from typing import Optional
except ImportError:
    pass


class AutoOffScreen:
    def __init__(self, duration=60 * 15, initial_duration=10) -> None:
        self.turn_off = None  # type: Optional[int]
        self.duration = duration
        self.set_turn_off(time.monotonic() + initial_duration)

    def set_turn_off(self, off_time):
        self.on = True
        if self.turn_off:
            self.turn_off = max(self.turn_off, off_time)
        else:
            self.turn_off = off_time

    def update_active(self):
        """turn on/push out turn-off time"""
        self.set_turn_off(time.monotonic() + self.duration)

    def poll(self) -> bool:
        now = time.monotonic()
        if self.on and self.turn_off is not None and now >= self.turn_off:
            self.on = False
            self.turn_off = None
        return self.on
