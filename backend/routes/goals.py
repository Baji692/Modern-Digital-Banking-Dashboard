"""
Goals management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import UserGoals, User, CustomGoal
from schemas import UserGoalsUpdate, UserGoalsResponse, CustomGoalCreate, CustomGoalUpdate, CustomGoalResponse
from datetime import datetime
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.get("/summary/{user_id}", response_model=UserGoalsResponse)
async def get_user_goals(user_id: int, db: Session = Depends(get_db)):
    """Get user's financial goals"""
    goals = db.query(UserGoals).filter(UserGoals.user_id == user_id).first()

    if not goals:
        # Return default goals if not set yet
        return {
            "id": 0,
            "user_id": user_id,
            "savings_goal": 20.0,
            "spending_goal": 100000.0,
            "bills_goal": 100.0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

    return goals


@router.post("/create/{user_id}", response_model=UserGoalsResponse)
async def create_user_goals(user_id: int, db: Session = Depends(get_db)):
    """Create default goals for new user"""
    # Check if goals already exist
    existing = db.query(UserGoals).filter(UserGoals.user_id == user_id).first()
    if existing:
        return existing

    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create default goals
    new_goals = UserGoals(
        user_id=user_id,
        savings_goal=20.0,
        spending_goal=100000.0,
        bills_goal=100.0
    )

    db.add(new_goals)
    db.commit()
    db.refresh(new_goals)

    return new_goals


@router.put("/update/{user_id}", response_model=UserGoalsResponse)
async def update_user_goals(
    user_id: int,
    goals_update: UserGoalsUpdate,
    db: Session = Depends(get_db)
):
    """Update user's financial goals"""
    goals = db.query(UserGoals).filter(UserGoals.user_id == user_id).first()

    if not goals:
        # Create if doesn't exist
        goals = UserGoals(user_id=user_id)
        db.add(goals)

    # Update only provided fields
    if goals_update.savings_goal is not None:
        goals.savings_goal = goals_update.savings_goal
    if goals_update.spending_goal is not None:
        goals.spending_goal = goals_update.spending_goal
    if goals_update.bills_goal is not None:
        goals.bills_goal = goals_update.bills_goal

    goals.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(goals)

    return goals


# ================= CUSTOM GOALS ENDPOINTS =================

@router.get("/custom/{user_id}", response_model=list[CustomGoalResponse])
async def get_user_custom_goals(user_id: int, db: Session = Depends(get_db)):
    """Get all custom goals for a user"""
    goals = db.query(CustomGoal).filter(
        CustomGoal.user_id == user_id,
        CustomGoal.status != "deleted"
    ).order_by(CustomGoal.priority.desc(), CustomGoal.created_at.desc()).all()

    return goals


@router.post("/custom/{user_id}", response_model=CustomGoalResponse)
async def create_custom_goal(
    user_id: int,
    goal_data: CustomGoalCreate,
    db: Session = Depends(get_db)
):
    """Create a new custom goal for user"""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate goal_type
    if goal_data.goal_type not in ["amount", "percentage"]:
        raise HTTPException(
            status_code=400, detail="goal_type must be 'amount' or 'percentage'")

    # Validate category
    valid_categories = ["savings", "spending", "investment", "debt", "other"]
    if goal_data.category not in valid_categories:
        raise HTTPException(
            status_code=400, detail=f"category must be one of {valid_categories}")

    # Validate priority
    if goal_data.priority not in ["low", "medium", "high"]:
        raise HTTPException(
            status_code=400, detail="priority must be 'low', 'medium', or 'high'")

    new_goal = CustomGoal(
        user_id=user_id,
        name=goal_data.name,
        description=goal_data.description,
        goal_type=goal_data.goal_type,
        target_value=goal_data.target_value,
        current_value=goal_data.current_value or 0,
        category=goal_data.category,
        target_date=goal_data.target_date,
        priority=goal_data.priority,
        status="active"
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return new_goal


@router.put("/custom/{goal_id}", response_model=CustomGoalResponse)
async def update_custom_goal(
    goal_id: int,
    goal_update: CustomGoalUpdate,
    db: Session = Depends(get_db)
):
    """Update a custom goal"""
    goal = db.query(CustomGoal).filter(CustomGoal.id == goal_id).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Update fields if provided
    if goal_update.name is not None:
        goal.name = goal_update.name
    if goal_update.description is not None:
        goal.description = goal_update.description
    if goal_update.target_value is not None:
        goal.target_value = goal_update.target_value
    if goal_update.current_value is not None:
        goal.current_value = goal_update.current_value
    if goal_update.category is not None:
        goal.category = goal_update.category
    if goal_update.target_date is not None:
        goal.target_date = goal_update.target_date
    if goal_update.priority is not None:
        goal.priority = goal_update.priority
    if goal_update.status is not None:
        goal.status = goal_update.status

    goal.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(goal)

    return goal


@router.delete("/custom/{goal_id}")
async def delete_custom_goal(goal_id: int, db: Session = Depends(get_db)):
    """Delete a custom goal"""
    goal = db.query(CustomGoal).filter(CustomGoal.id == goal_id).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Soft delete by marking status as deleted
    goal.status = "deleted"
    goal.updated_at = datetime.utcnow()

    db.commit()

    return {"message": "Goal deleted successfully"}
