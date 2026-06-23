import asyncio

from passlib.context import CryptContext
from sqlalchemy import select

from app.database import async_session
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed():
    async with async_session() as db:
        result = await db.execute(select(User).where(User.username == "admin"))
        if result.scalar_one_or_none() is None:
            admin = User(
                username="admin",
                hashed_password=pwd_context.hash("Admin@1234"),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            await db.commit()
            print("Admin user created: admin / Admin@1234")
        else:
            print("Admin user already exists, skipping seed.")


if __name__ == "__main__":
    asyncio.run(seed())
