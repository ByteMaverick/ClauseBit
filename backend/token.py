from fastapi import APIRouter, Header, HTTPException
import httpx
from jose import jwt, jwk
from jose.exceptions import JWTError
from jose.backends.rsa_backend import RSAKey

router = APIRouter()

CLERK_JWKS_URL = "https://settled-goldfish-23.clerk.accounts.dev/.well-known/jwks.json"

@router.post("/api/extension-auth")
async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            jwks = (await client.get(CLERK_JWKS_URL)).json()

        keys = {key["kid"]: key for key in jwks["keys"]}
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header["kid"]

        if kid not in keys:
            raise HTTPException(status_code=403, detail="Invalid signing key")

        key_data = keys[kid]
        public_key = jwk.construct(key_data, algorithm="RS256")

        payload = jwt.decode(
            token,
            public_key.to_pem().decode("utf-8"),
            algorithms=["RS256"],
            options={"verify_aud": False}
        )

        return {
            "is_authenticated": True,
            "user_id": payload.get("sub"),
            "email": payload.get("email")
        }

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"JWT Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


