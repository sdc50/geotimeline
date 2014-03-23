from sqlalchemy.exc import DBAPIError

from .models import (
    DBSession,
    User,
    Group,
    )

def groupfinder(userid, request):
    user = DBSession.query(User).filter_by(userName=userid).first()
    if user:
        return user.getGroups()