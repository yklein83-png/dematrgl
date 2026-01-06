import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text
from passlib.context import CryptContext

DATABASE_URL = "postgresql+asyncpg://fare_admin:FareEpargne2025!Secure@postgres:5432/fare_epargne"

async def update_password():
    engine = create_async_engine(DATABASE_URL)
    async with AsyncSession(engine) as db:
        pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
        hashed = pwd_context.hash('Admin123!')

        await db.execute(
            text("UPDATE users SET mot_de_passe_hash = :hash WHERE email = 'pierre.poher@fare-epargne.com'"),
            {'hash': hashed}
        )
        await db.commit()
        print('Password updated successfully')
        print(f'Hash: {hashed}')
    await engine.dispose()

asyncio.run(update_password())
