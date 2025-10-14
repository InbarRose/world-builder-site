# minimal factories file for tests; expand with factory_boy as needed
import random
from uuid import uuid4

def make_user(username=None, email=None):
    return {
        "id": str(uuid4()),
        "username": username or f"user{random.randint(1000,9999)}",
        "email": email or "user@example.com"
    }
