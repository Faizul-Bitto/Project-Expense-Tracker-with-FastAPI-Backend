from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm

login_token_field_dependency = Annotated[OAuth2PasswordRequestForm, Depends()]
