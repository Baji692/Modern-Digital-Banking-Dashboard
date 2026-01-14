from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
from models import Rewards, User
from schemas import RewardCreate, RewardResponse
from typing import List

router = APIRouter(prefix="/rewards", tags=["rewards"])


@router.get("/", response_model=List[RewardResponse])
def get_user_rewards(db: Session = Depends(get_db), user_id: int = None):
    """Get all rewards for a user"""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    rewards = db.query(Rewards).filter(Rewards.user_id == user_id).all()
    return rewards


@router.get("/{reward_id}", response_model=RewardResponse)
def get_reward(reward_id: int, db: Session = Depends(get_db)):
    """Get a specific reward"""
    reward = db.query(Rewards).filter(Rewards.id == reward_id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    return reward


@router.post("/", response_model=RewardResponse)
def create_reward(reward: RewardCreate, db: Session = Depends(get_db)):
    """Create a new reward entry"""
    # Verify user exists
    user = db.query(User).filter(User.id == reward.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_reward = Rewards(
        user_id=reward.user_id,
        program_name=reward.program_name,
        points_balance=reward.points_balance
    )
    try:
        db.add(db_reward)
        db.commit()
        db.refresh(db_reward)
        return db_reward
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error creating reward")


@router.put("/{reward_id}", response_model=RewardResponse)
def update_reward(reward_id: int, reward: RewardCreate, db: Session = Depends(get_db)):
    """Update a reward entry"""
    db_reward = db.query(Rewards).filter(Rewards.id == reward_id).first()
    if not db_reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    db_reward.program_name = reward.program_name
    db_reward.points_balance = reward.points_balance

    try:
        db.commit()
        db.refresh(db_reward)
        return db_reward
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error updating reward")


@router.delete("/{reward_id}")
def delete_reward(reward_id: int, db: Session = Depends(get_db)):
    """Delete a reward entry"""
    db_reward = db.query(Rewards).filter(Rewards.id == reward_id).first()
    if not db_reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    try:
        db.delete(db_reward)
        db.commit()
        return {"message": "Reward deleted successfully"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error deleting reward")
