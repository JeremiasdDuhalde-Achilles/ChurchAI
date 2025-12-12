import asyncio
import sys
import os
from pathlib import Path

# Add the app directory to the Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir.parent))

# Now import our modules
from app.infrastructure.database.connection import create_tables, drop_tables, engine
from app.infrastructure.database.models import Base

async def setup_database():
    """Setup database tables"""
    print("🔧 Setting up ChurchAI database...")
    
    try:
        # Test connection first
        async with engine.begin() as conn:
            print("✅ Database connection successful")
        
        # Create tables
        await create_tables()
        print("✅ Database tables created successfully!")
        
        # List created tables
        async with engine.begin() as conn:
            result = await conn.execute(
                text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
            )
            tables = result.fetchall()
            print(f"📊 Created tables: {[table[0] for table in tables]}")
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        import traceback
        traceback.print_exc()

async def reset_database():
    """Reset database (drop and recreate tables)"""
    print("🔧 Resetting ChurchAI database...")
    
    try:
        # Drop existing tables
        await drop_tables()
        # Create fresh tables
        await create_tables()
        print("✅ Database reset completed successfully!")
        
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Import here to avoid circular imports
    from sqlalchemy import text
    
    if len(sys.argv) > 1 and sys.argv[1] == "reset":
        asyncio.run(reset_database())
    else:
        asyncio.run(setup_database())
