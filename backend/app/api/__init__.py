from typing import Annotated

from fastapi import Path

SessionCode = Annotated[str, Path(pattern=r"^[A-Z0-9]{4}$")]
