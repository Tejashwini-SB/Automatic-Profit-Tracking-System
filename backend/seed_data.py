import os
import datetime
import random
from app.database import SessionLocal, engine, Base
from app import models, auth

def seed_database():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Creating users...")
        # Create Admin
        admin_pwd = auth.get_password_hash("Password123!")
        admin_user = models.User(
            username="admin",
            email="admin@example.com",
            password_hash=admin_pwd,
            role="Admin"
        )
        db.add(admin_user)
        
        # Also create the test-agent@profit.com account for ease of automated check
        agent_user = models.User(
            username="test_agent",
            email="test-agent@profit.com",
            password_hash=admin_pwd,
            role="Admin"
        )
        db.add(agent_user)

        # Create Staff
        staff_pwd = auth.get_password_hash("staff123")
        staff_user = models.User(
            username="staff",
            email="staff@example.com",
            password_hash=staff_pwd,
            role="Staff"
        )
        db.add(staff_user)
        db.commit()
        db.refresh(admin_user)
        db.refresh(staff_user)

        print("Creating products...")
        product_templates = [
            {"product_name": "Premium Widgets", "category": "Electronics", "cost_price": 50.0, "selling_price": 80.0, "quantity": 120},
            {"product_name": "Super Gadgets", "category": "Electronics", "cost_price": 120.0, "selling_price": 180.0, "quantity": 60},
            {"product_name": "Bulk Screws", "category": "Hardware", "cost_price": 2.0, "selling_price": 5.0, "quantity": 1500},
            {"product_name": "Solar Batteries", "category": "Energy", "cost_price": 200.0, "selling_price": 320.0, "quantity": 30},
            {"product_name": "Fiber Cables", "category": "Telecom", "cost_price": 15.0, "selling_price": 25.0, "quantity": 400},
            {"product_name": "Eco Bulbs", "category": "Lighting", "cost_price": 10.0, "selling_price": 18.0, "quantity": 8} # low stock
        ]
        
        db_products = []
        for p in product_templates:
            db_p = models.Product(**p)
            db.add(db_p)
            db_products.append(db_p)
        db.commit()
        for p in db_products:
            db.refresh(p)

        print("Creating historical purchases and sales (last 30 days)...")
        start_date = datetime.date.today() - datetime.timedelta(days=30)
        
        for d in range(31):
            current_date = start_date + datetime.timedelta(days=d)
            current_datetime = datetime.datetime.combine(current_date, datetime.time(12, 0))
            
            daily_revenue = 0.0
            daily_expense = 0.0
            daily_profit = 0.0
            
            # Simulate daily purchases (mostly in first 10 days or random)
            if d % 5 == 0 or d < 5:
                # Add purchases
                for p in db_products:
                    if random.random() > 0.4:
                        qty = random.randint(10, 50)
                        cost = p.cost_price
                        total = qty * cost
                        purchase = models.Purchase(
                            product_id=p.id,
                            supplier="Apex Supplies Ltd" if p.category == "Electronics" else "Hardware Hub",
                            quantity=qty,
                            purchase_price=cost,
                            total_amount=total,
                            purchased_at=current_datetime
                        )
                        db.add(purchase)
                        daily_expense += total
                        
                        # Add audit log
                        log = models.AuditLog(
                            user_id=admin_user.id,
                            action=f"Added purchase: {qty} units of {p.product_name}",
                            timestamp=current_datetime
                        )
                        db.add(log)
            
            # Simulate daily sales
            for p in db_products:
                # Most days have some sales
                if random.random() > 0.2:
                    qty = random.randint(1, 10)
                    sale_price = p.selling_price
                    total = qty * sale_price
                    profit_val = (sale_price - p.cost_price) * qty
                    
                    sale = models.Sale(
                        product_id=p.id,
                        quantity=qty,
                        selling_price=sale_price,
                        total_sale=total,
                        profit=profit_val,
                        sold_at=current_datetime
                    )
                    db.add(sale)
                    daily_revenue += total
                    daily_profit += profit_val
                    
                    # Add audit log
                    log = models.AuditLog(
                        user_id=staff_user.id,
                        action=f"Logged sale: {qty} units of {p.product_name}",
                        timestamp=current_datetime
                    )
                    db.add(log)
            
            # Save daily summary
            summary = models.ProfitSummary(
                date=current_date,
                revenue=daily_revenue,
                expense=daily_expense,
                profit=daily_profit
            )
            db.add(summary)
            
        db.commit()
        print("Database seeded successfully with users, products, purchases, sales, and profit history!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
