from fastapi import APIRouter, Depends

from ..auth import CurrentUser, get_current_user
from ..models.schemas import UsageOut
from ..services import usage as usage_service


router = APIRouter(prefix="/api/usage", tags=["usage"])


@router.get("", response_model=UsageOut)
def get_daily_usage(user: CurrentUser = Depends(get_current_user)) -> UsageOut:
    snapshot = usage_service.get_usage(user.id)
    return UsageOut(
        tokens_used=snapshot.tokens_used,
        tokens_limit=snapshot.tokens_limit,
        remaining=snapshot.remaining,
        percent=round(snapshot.percent, 1),
        user_count=snapshot.user_count,
        total_limit=snapshot.total_limit,
        usage_date=snapshot.usage_date.isoformat(),
        resets_at=snapshot.resets_at.isoformat(),
    )
