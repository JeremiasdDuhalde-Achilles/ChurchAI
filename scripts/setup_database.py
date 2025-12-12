# setup_database.py
import asyncio
import sys
sys.path.insert(0, '/app')

from app.infrastructure.database.connection import create_tables, drop_tables, engine
from sqlalchemy import text

async def setup_database():
    """Setup database tables"""
    print("🔧 Setting up ChurchAI database...")
    
    try:
        async with engine.begin() as conn:
            print("✅ Database connection successful")
        
        await create_tables()
        print("✅ Database tables created successfully!")
        
        async with engine.begin() as conn:
            result = await conn.execute(
                text("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename")
            )
            tables = result.fetchall()
            print(f"\n📊 Created tables ({len(tables)}):")
            for table in tables:
                print(f"  - {table[0]}")
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        import traceback
        traceback.print_exc()

async def reset_database():
    """Reset database"""
    print("🔧 Resetting ChurchAI database...")
    
    try:
        await drop_tables()
        print("🗑️  Tables dropped")
        
        await create_tables()
        print("✅ Tables created!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "reset":
        asyncio.run(reset_database())
    else:
        asyncio.run(setup_database())